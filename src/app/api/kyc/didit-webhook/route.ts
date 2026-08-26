import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[DIDIT Webhook Received]:', JSON.stringify(body, null, 2));

    const {
      status,
      session_id,
      vendor_data,
      user_id,
      decision,
      verification_status,
    } = body;

    // Didit sends status updates (approved, rejected, pending, completed)
    const isApproved = 
      status === 'approved' || 
      status === 'completed' || 
      decision === 'approved' || 
      verification_status === 'Approved';

    const targetUserId = user_id || vendor_data || body?.metadata?.user_id;

    if (!targetUserId) {
      console.warn('[DIDIT Webhook] No target userId found in payload.');
      return NextResponse.json({ received: true, note: 'No user ID attached' });
    }

    const adminDb = createAdminClient();

    if (isApproved) {
      // 1. Update Profile to KYC Verified and Active Creator
      const { data: profile, error } = await adminDb
        .from('profiles')
        .update({
          is_kyc_verified: true,
          role: 'creator',
          updated_at: new Date().toISOString(),
        })
        .eq('id', targetUserId)
        .select()
        .single();

      if (error) {
        console.error('[DIDIT Webhook] Failed to update profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // 2. Award KYC Completion XP (+500 XP)
      const currentXp = profile?.connection_points || 0;
      await adminDb
        .from('profiles')
        .update({ connection_points: currentXp + 500 })
        .eq('id', targetUserId);

      // 3. Telegram Notification Alert
      const msg = 
        `🛡️ *CREATOR KYC VERIFIED (DIDIT)*\n\n` +
        `👤 *User:* @${profile?.username || 'Creator'} (${profile?.email || targetUserId})\n` +
        `✅ *Status:* Approved\n` +
        `🆔 *Session:* ${session_id || 'N/A'}\n` +
        `🎁 *Reward:* +500 XP (Creator Studio Unlocked)`;

      sendTelegramNotification(msg).catch((err) => console.warn('Telegram notify error:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'DIDIT webhook processed successfully',
      approved: isApproved,
    });
  } catch (error: any) {
    console.error('[DIDIT Webhook Error]:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
