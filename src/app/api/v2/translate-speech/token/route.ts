import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Get user session
    let user;
    const devUserId = req.headers.get('x-dev-user-id');
    if (process.env.NODE_ENV === 'development' && devUserId) {
      user = { id: devUserId };
    } else {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    }

    // 2. Fetch User Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const isCreator = profile.role === 'creator';
    const { preAuthCardHoldActive, devSpeechSecondsUsed, devCreatorUltimatePack } = await req.json().catch(() => ({}));

    // 3. Process Creator authorization
    if (isCreator) {
      const hasUltimatePack = (process.env.NODE_ENV === 'development' && devCreatorUltimatePack !== undefined)
        ? devCreatorUltimatePack
        : (profile.creator_ultimate_pack || false);
      const expiresAt = profile.creator_ultimate_pack_expires_at ? new Date(profile.creator_ultimate_pack_expires_at) : null;
      const isPromoActive = (process.env.NODE_ENV === 'development' && devCreatorUltimatePack) || 
        (profile.promo_status === 'approved' && expiresAt && expiresAt > new Date());

      if (!hasUltimatePack && !isPromoActive) {
        return NextResponse.json({
          error: 'Subscription Required',
          code: 'SUBSCRIPTION_REQUIRED',
          message: 'Speech-to-speech translation requires the Creator Ultimate Pack (€69/mo) or an active verified promo.'
        }, { status: 402 });
      }

      // Generate simulated/mock ephemeral session token for Gemini 3.5 Live
      const mockToken = `creator_s2st_${user.id}_${Date.now()}`;
      return NextResponse.json({
        success: true,
        token: mockToken,
        url: 'wss://translate-gateway.googleapis.com/stream',
        role: 'creator',
        expiresAt: expiresAt
      });
    }

    // 4. Process Member authorization (5-min free limit per 24h)
    // Fetch or create their quota record
    let { data: quota, error: quotaError } = await supabase
      .from('translation_quotas')
      .select('*')
      .eq('profile_id', user.id)
      .single();

    const now = new Date();

    if (quotaError || !quota) {
      // Create new quota record
      const { data: newQuota, error: insertError } = await supabase
        .from('translation_quotas')
        .insert({
          profile_id: user.id,
          speech_seconds_used_today: 0,
          last_quota_reset_at: now.toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.warn('[Translate Speech] Failed to create quota row, simulating in-memory for sandbox:', insertError);
        quota = {
          speech_seconds_used_today: 0,
          last_quota_reset_at: now.toISOString()
        };
      } else {
        quota = newQuota;
      }
    }

    // Check if 24 hours has elapsed to reset quota
    const lastReset = new Date(quota.last_quota_reset_at);
    const msDiff = now.getTime() - lastReset.getTime();
    let secondsUsed = quota.speech_seconds_used_today;

    if (process.env.NODE_ENV === 'development' && devSpeechSecondsUsed !== undefined) {
      secondsUsed = devSpeechSecondsUsed;
    } else if (msDiff > 24 * 60 * 60 * 1000) {
      secondsUsed = 0;
      try {
        await supabase
          .from('translation_quotas')
          .update({
            speech_seconds_used_today: 0,
            last_quota_reset_at: now.toISOString()
          })
          .eq('profile_id', user.id);
      } catch (updateError) {
        console.warn('[Translate Speech] Failed to reset quota in DB:', updateError);
      }
    }

    const FREE_LIMIT_SECONDS = 300; // 5 minutes

    // Check for active VIP or MASTER subscriptions
    const { data: activeSubs } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('subscriber_id', user.id)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .in('tier', ['vip', 'master']);

    const hasVipOrMaster = activeSubs && activeSubs.length > 0;
    
    // VIP/MASTER get unlimited S2ST translation
    const effectiveLimit = hasVipOrMaster ? Infinity : FREE_LIMIT_SECONDS;
    const isOverLimit = secondsUsed >= effectiveLimit;

    if (isOverLimit && !preAuthCardHoldActive) {
      return NextResponse.json({
        error: 'Quota Exceeded',
        code: 'QUOTA_EXCEEDED',
        message: 'You have consumed your 5 free minutes of speech translation for today. Please authorize a Stripe card hold to continue (€0.10/min) or upgrade to VIP/MASTER for unlimited translation.',
        secondsUsed
      }, { status: 402 });
    }

    // Generate simulated/mock ephemeral session token for Member
    const mockToken = `member_s2st_${user.id}_${Date.now()}`;
    return NextResponse.json({
      success: true,
      token: mockToken,
      url: 'wss://translate-gateway.googleapis.com/stream',
      role: 'member',
      secondsUsed,
      freeSecondsRemaining: hasVipOrMaster ? Infinity : Math.max(0, FREE_LIMIT_SECONDS - secondsUsed),
      overageActive: isOverLimit,
      hasUnlimitedQuota: hasVipOrMaster
    });

  } catch (err: any) {
    console.error('[Translate Speech API Error]:', err);
    return NextResponse.json({ error: 'Internal Server Error', message: err.message }, { status: 500 });
  }
}
