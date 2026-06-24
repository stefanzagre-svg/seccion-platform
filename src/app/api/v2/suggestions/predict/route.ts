import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  generateLocalSuggestions,
  SuggestionRequest,
  SuggestionResponse,
  CandidateProfile,
  PredictionPayload
} from '@/lib/ai-suggestion-service';
import { UserProfile } from '@/lib/match-engine';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION, buildPredictionPrompt } from '@/lib/prompts/suggestion-prompt';

// Rate Limit Store
const requestLog = new Map<string, number[]>();
const RATE_LIMIT = { window: 60_000, max: 20 }; // 20 req/min

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const times = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < RATE_LIMIT.window
  );
  times.push(now);
  requestLog.set(userId, times);
  return times.length > RATE_LIMIT.max;
}

// Prompt Injection Guard
function isSafeInput(str: string): boolean {
  const dangerous = /(<script|SELECT\s+\*|DROP\s+TABLE|IGNORE\s+PREVIOUS|system:|assistant:)/i;
  return !dangerous.test(str);
}

// Map database profile to match engine profile
function mapDbProfileToEngine(dbProf: any): UserProfile {
  if (!dbProf) {
    return {
      gender: '',
      location: '',
      hobbies: [],
      lifestyle: {},
      relationshipGoal: 'Long-term',
      relationshipType: 'Monogamous',
      sexualPreferences: [],
      familyGoals: 'Open to children'
    };
  }
  return {
    gender: dbProf.sexual_preference === 'Lesbian' || dbProf.sexual_preference === 'Gay' ? 'female' : 'male', // default fallback
    location: dbProf.origins || '',
    hobbies: dbProf.hobbies || [],
    lifestyle: dbProf.lifestyle_habits || {},
    relationshipGoal: dbProf.relationship_goals?.[0] || 'Long-term',
    relationshipType: dbProf.relationship_types?.[0] || 'Monogamous',
    sexualPreferences: [dbProf.sexual_preference].filter(Boolean),
    familyGoals: dbProf.lifestyle_habits?.family_goals || 'Open to children',
    // Match Engine v2 fields
    archetype: dbProf.archetype || undefined,
    moods: dbProf.moods || undefined,
    corePassion: dbProf.core_passion || undefined,
    origins: dbProf.origins || undefined,
    isKycVerified: dbProf.is_kyc_verified || false,
    lastActiveAt: dbProf.last_active_at || dbProf.updated_at || undefined,
    engagementScore: dbProf.engagement_score || undefined,
    bioAnalysis: dbProf.bio_analysis || undefined,
  };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: SuggestionRequest;

  try {
    body = (await req.json()) as SuggestionRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.user_id || !body?.context_data) {
    return NextResponse.json(
      { error: 'Missing required fields: user_id, context_data' },
      { status: 400 }
    );
  }

  if (!isSafeInput(body.user_id)) {
    return NextResponse.json({ error: 'Invalid user_id' }, { status: 400 });
  }

  if (isRateLimited(body.user_id)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before retrying.' },
      { status: 429 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Fetch real user profile
    const { data: dbUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', body.user_id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      throw userError;
    }

    const currentUser = mapDbProfileToEngine(dbUser);

    // 1b. Check Suggestion Cache
    const { data: latestCache } = await supabase
      .from('suggestion_caches')
      .select('*')
      .eq('user_id', body.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const isCacheValid = latestCache && (Date.now() - new Date(latestCache.created_at).getTime() < twentyFourHoursMs);

    // If cache is valid and refresh is not forced, serve from cache and mark as read
    if (isCacheValid && !body.force_refresh) {
      if (!latestCache.is_read) {
        await supabase
          .from('suggestion_caches')
          .update({ is_read: true })
          .eq('id', latestCache.id);
      }

      return NextResponse.json({
        suggestions: latestCache.suggestions,
        generated_at: latestCache.created_at,
        model_version: latestCache.model_version,
      } as SuggestionResponse);
    }

    // 1c. Enforce 24h Generation Limit (Max 10 generations/24h)
    if (body.force_refresh) {
      const twentyFourHoursAgo = new Date(Date.now() - twentyFourHoursMs).toISOString();
      const { count } = await supabase
        .from('suggestion_caches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', body.user_id)
        .gt('created_at', twentyFourHoursAgo);

      if (count !== null && count >= 10) {
        return NextResponse.json({
          suggestions: latestCache ? latestCache.suggestions : [],
          generated_at: latestCache ? latestCache.created_at : new Date().toISOString(),
          model_version: latestCache ? latestCache.model_version : 'local-v1.0-live',
          limit_reached: true,
          error: 'Daily generation limit of 10 requests reached. Showing cached suggestions.',
        } as SuggestionResponse);
      }
    }

    // 2. Fetch other user profiles as candidates
    const { data: dbCandidates, error: candError } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', body.user_id)
      .limit(15);

    if (candError) throw candError;

    // 3. Fetch relationships to get current gauge score details
    const { data: relationships } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', body.user_id);

    // Map DB profiles to candidate profiles with dynamic relationship scores
    const mappedCandidates: CandidateProfile[] = (dbCandidates || []).map((cand) => {
      const rel = relationships?.find(r => r.target_id === cand.id);
      return {
        id: cand.id,
        username: cand.username,
        avatar_url: cand.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        profile: mapDbProfileToEngine(cand),
        momentum: rel?.gauge_score ? Math.min(100, rel.gauge_score * 10) : Math.floor(Math.random() * 30) + 40,
        their_gauge: rel?.gauge_score || Math.floor(Math.random() * 20) + 10,
        shared_interests: (cand.hobbies || []).filter((h: string) => currentUser.hobbies.includes(h)),
        complementary_desires: [cand.relationship_goals?.[0]].filter(Boolean)
      };
    });

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const prompt = buildPredictionPrompt(currentUser, body.context_data, JSON.stringify(mappedCandidates, null, 2));
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            temperature: 0.7,
          }
        });
        
        const text = response.text;
        if (text) {
          const predictions = JSON.parse(text) as PredictionPayload[];
          
          // Cache the new suggestions
          await supabase.from('suggestion_caches').insert({
            user_id: body.user_id,
            suggestions: predictions,
            model_version: 'gemini-2.5-flash',
            is_read: true, // Mark as read since it is returned to active user feed
          });

          return NextResponse.json({
            suggestions: predictions,
            generated_at: new Date().toISOString(),
            model_version: 'gemini-2.5-flash',
          } as SuggestionResponse);
        }
      } catch (err) {
        console.error('Gemini API Error, falling back to local signal calculations:', err);
      }
    }

    // Fallback: Local signal-based engine calculation using live database values
    const localSuggestions = generateLocalSuggestions(currentUser, body.context_data, 5);
    
    // Inject the real names and avatars from mapped candidates
    const suggestions = localSuggestions.map((s) => {
      const matchCand = mappedCandidates.find(c => c.id === s.target_id);
      if (matchCand) {
        return {
          ...s,
          username: matchCand.username,
          avatar_url: matchCand.avatar_url
        };
      }
      return s;
    });

    // Cache the fallback suggestions
    await supabase.from('suggestion_caches').insert({
      user_id: body.user_id,
      suggestions,
      model_version: 'local-v1.0-live',
      is_read: true,
    });

    return NextResponse.json({
      suggestions,
      generated_at: new Date().toISOString(),
      model_version: 'local-v1.0-live',
    } as SuggestionResponse);

  } catch (err: any) {
    console.error('Error generating suggestions:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
