import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createAdminClient();

    // Verify caller is admin/super_admin/moderator
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('platform_role, username, display_name')
      .eq('id', user.id)
      .single();

    if (!callerProfile || !['super_admin', 'admin', 'moderator'].includes(callerProfile.platform_role)) {
      return NextResponse.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const { targetUserId, messageText, subject = 'Official Platform Message' } = body;

    if (!targetUserId || !messageText) {
      return NextResponse.json({ error: 'Missing targetUserId or messageText' }, { status: 400 });
    }

    // Insert admin message into public.messages
    const formattedContent = `[OFFICIAL ADMIN MESSAGE]\nSubject: ${subject}\n\n${messageText.trim()}\n\n— SECCIØN Platform Operations`;

    const { data: messageRecord, error: msgErr } = await adminClient
      .from('messages')
      .insert({
        sender_id: user.id,
        receiver_id: targetUserId,
        content: formattedContent,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (msgErr) {
      console.error('[Admin Message API] Failed to insert message:', msgErr);
      return NextResponse.json({ error: 'Failed to deliver message', details: msgErr.message }, { status: 500 });
    }

    // Log admin audit log if admin_audit_logs table exists
    const { error: auditErr } = await adminClient.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'send_direct_message',
      target_user_id: targetUserId,
      metadata: { subject, textLength: messageText.length },
      created_at: new Date().toISOString(),
    });
    if (auditErr) {
      console.warn('[Admin Message API] Optional audit log skipped:', auditErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Direct message delivered to user inbox successfully.',
      messageRecord
    });

  } catch (err: any) {
    console.error('[Admin Message API] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
