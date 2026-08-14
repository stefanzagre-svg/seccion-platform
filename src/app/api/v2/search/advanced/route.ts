import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { calculateMatch } from '@/lib/match-engine';

export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      query,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      sexualPreference,
      relationshipGoal,
      relationshipType,
      minMatchScore,
      locationType,
      relationshipLevel,
      categoryTag,
      specialization,
      includeAdultContent = false,
      profileStatus,
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Fetch searcher profile details to check role and subscription status
    const { data: searcherProfile, error: searcherError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (searcherError || !searcherProfile) {
      return NextResponse.json({ error: 'Searcher profile not found' }, { status: 404 });
    }

    // 2. Fetch searcher active subscriptions
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('subscriber_id', userId)
      .eq('is_active', true);

    const isCreator = searcherProfile.role === 'creator';
    const isVipOrMaster = activeSubs && activeSubs.length > 0;
    const isUltimate = searcherProfile.creator_ultimate_pack && 
                       new Date(searcherProfile.creator_ultimate_pack_expires_at) > new Date();

    const isFreeSearch = isCreator || isVipOrMaster || isUltimate;

    let userXpProfile = null;

    if (!isFreeSearch) {
      // Standard member: deduct 250 XP
      const { data: xpProf, error: xpError } = await supabase
        .from('user_xp_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (xpError || !xpProf) {
        return NextResponse.json({ error: 'XP Profile not found. Complete your profile to earn XP!' }, { status: 403 });
      }

      if (xpProf.current_xp < 250) {
        return NextResponse.json({ 
          error: `Insufficient XP. Advanced Search costs 250 XP. You currently have ${xpProf.current_xp} XP.`,
          currentXp: xpProf.current_xp
        }, { status: 403 });
      }

      // Deduct 250 XP
      const { data: updatedXpProf, error: deductError } = await supabase
        .from('user_xp_profiles')
        .update({
          current_xp: xpProf.current_xp - 250,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (deductError) throw deductError;
      userXpProfile = updatedXpProf;
    } else {
      // Free search: just read current XP profile if it exists
      const { data: xpProf } = await supabase
        .from('user_xp_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      userXpProfile = xpProf;
    }

    // 3. Query all candidate profiles (we filter creators or all profiles depending on role, let's filter all for maximum results)
    let dbQuery = supabase.from('profiles').select('*');

    if (query) {
      dbQuery = dbQuery.or(`username.ilike.%${query}%,display_name.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    if (profileStatus && profileStatus !== 'All') {
      dbQuery = dbQuery.eq('role', profileStatus.toLowerCase());
    }

    // Apply basic SQL filters
    if (profileStatus && profileStatus !== 'All') {
      dbQuery = dbQuery.eq('role', profileStatus.toLowerCase());
    }
    if (sexualPreference && sexualPreference !== 'All') {
      dbQuery = dbQuery.eq('sexual_preference', sexualPreference);
    }
    if (minAge) {
      dbQuery = dbQuery.gte('age', minAge);
    }
    if (maxAge) {
      dbQuery = dbQuery.lte('age', maxAge);
    }
    if (minHeight) {
      dbQuery = dbQuery.gte('height', minHeight);
    }
    if (maxHeight) {
      dbQuery = dbQuery.lte('height', maxHeight);
    }
    if (specialization && specialization !== 'all') {
      dbQuery = dbQuery.eq('specialization', specialization);
    }
    if (!includeAdultContent) {
      // Exclude 18+ adult content creators by default unless SafeSearch is toggled OFF
      dbQuery = dbQuery.eq('is_adult_content', false);
    }

    const { data: candidates, error: queryError } = await dbQuery;

    if (queryError) throw queryError;

    // 4. Load all relationships for the searcher to evaluate levels
    const { data: relationships } = await supabase
      .from('relationships')
      .select('*')
      .eq('user_id', userId);

    const relMap = new Map((relationships || []).map(r => [r.target_id, r]));

    // 5. Build full user-profile representation of the searcher for compatibility checks
    const searcherCompatibilityProfile = {
      gender: searcherProfile.sexual_preference === 'Lesbian' || searcherProfile.sexual_preference === 'Gay' ? 'female' : 'male',
      location: searcherProfile.origins || 'Paris, France',
      hobbies: searcherProfile.hobbies || [],
      lifestyle: searcherProfile.lifestyle_habits || {},
      relationshipGoal: searcherProfile.relationship_goals?.[0] || 'Long-term',
      relationshipType: searcherProfile.relationship_types?.[0] || 'Monogamous',
      sexualPreferences: [searcherProfile.sexual_preference].filter(Boolean),
      familyGoals: searcherProfile.lifestyle_habits?.family_goals || 'Open to children'
    };

    // 6. Enrich, filter, and mask candidate profiles
    let results = candidates
      .filter(c => c.id !== userId) // Exclude self
      .map(c => {
        // Calculate match compatibility
        const candidateCompatProfile = {
          gender: c.sexual_preference === 'Lesbian' || c.sexual_preference === 'Gay' ? 'female' : 'male',
          location: c.origins || '',
          hobbies: c.hobbies || [],
          lifestyle: c.lifestyle_habits || {},
          relationshipGoal: c.relationship_goals?.[0] || 'Long-term',
          relationshipType: c.relationship_types?.[0] || 'Monogamous',
          sexualPreferences: [c.sexual_preference].filter(Boolean),
          familyGoals: c.lifestyle_habits?.family_goals || 'Open to children'
        };

        const matchResult = calculateMatch(searcherCompatibilityProfile, candidateCompatProfile);
        const rel = relMap.get(c.id);
        const currentLevel = rel?.current_level || 'strangers';
        const gaugeScore = rel?.gauge_score || 0;

        // Extract privacy settings
        const privacy = c.privacy_settings || {};
        const showAge = privacy.show_age !== false;
        const showHeight = privacy.show_height !== false;
        const showGoals = privacy.show_relationship_goals !== false;
        const showTypes = privacy.show_relationship_types !== false;

        return {
          id: c.id,
          username: c.username,
          display_name: c.display_name,
          avatar_url: c.avatar_url,
          bio: c.bio,
          role: c.role,
          residence: c.residence,
          origins: c.origins,
          current_location: c.current_location,
          is_kyc_verified: c.is_kyc_verified,
          
          // Apply privacy masking to returned fields
          age: showAge ? c.age : null,
          height: showHeight ? c.height : null,
          relationship_goals: showGoals ? c.relationship_goals : null,
          relationship_types: showTypes ? c.relationship_types : null,
          sexual_preference: c.sexual_preference,
          hobbies: c.hobbies,
          specialization: c.specialization || 'beauty',
          specialization_tags: c.specialization_tags || [],
          is_adult_content: c.is_adult_content || false,
          
          // Relationship & match score
          matchScore: matchResult.totalScore,
          matchResult,
          currentLevel,
          gaugeScore,
          
          // Privacy metadata for client UI labels
          privacyFlags: {
            ageHidden: !showAge,
            heightHidden: !showHeight,
            goalsHidden: !showGoals,
            typesHidden: !showTypes
          }
        };
      });

    // 7. Apply Post-processing advanced filters in-memory via composable filter predicates
    const filterByMatchScore = (r: typeof results[0]) => 
      !minMatchScore || r.matchScore >= minMatchScore;

    const filterByLocationType = (r: typeof results[0]) => {
      if (!locationType || locationType === 'All') return true;
      if (locationType === 'Current') return r.current_location === searcherProfile.current_location;
      if (locationType === 'Origins') return r.origins === searcherProfile.origins;
      return true;
    };

    const filterByRelationshipLevel = (r: typeof results[0]) => 
      !relationshipLevel || relationshipLevel === 'All' || r.currentLevel.toLowerCase() === relationshipLevel.toLowerCase();

    const filterByRelationshipGoal = (r: typeof results[0]) => {
      if (!relationshipGoal || relationshipGoal === 'All') return true;
      return !r.privacyFlags.goalsHidden && 
        r.relationship_goals?.some((g: string) => g.toLowerCase().includes(relationshipGoal.toLowerCase()));
    };

    const filterByRelationshipType = (r: typeof results[0]) => {
      if (!relationshipType || relationshipType === 'All') return true;
      return !r.privacyFlags.typesHidden && 
        r.relationship_types?.some((t: string) => t.toLowerCase().includes(relationshipType.toLowerCase()));
    };

    results = results.filter(r => 
      filterByMatchScore(r) &&
      filterByLocationType(r) &&
      filterByRelationshipLevel(r) &&
      filterByRelationshipGoal(r) &&
      filterByRelationshipType(r)
    );

    return NextResponse.json({
      success: true,
      results,
      deducted: !isFreeSearch,
      currentXp: userXpProfile?.current_xp ?? 0,
      passesAvailable: userXpProfile?.boost_passes_available ?? 0
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
