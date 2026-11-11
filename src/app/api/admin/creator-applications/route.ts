import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { sendCreatorApprovalEmail } from '@/lib/email';
import crypto from 'crypto';

function extractHandleFromLink(link?: string | null, email?: string): string {
  if (link) {
    const cleaned = link.replace(/^https?:\/\/[^\/]+\/@?/, '').replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (cleaned.length >= 3) return cleaned.slice(0, 24).toLowerCase();
  }
  if (email) {
    const fromEmail = email.split('@')[0].replace(/\./g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    if (fromEmail.length >= 3) return fromEmail.slice(0, 24).toLowerCase();
  }
  return `creator_${Math.floor(1000 + Math.random() * 9000)}`;
}

async function findAuthUserByEmail(supabaseAdmin: any, email: string) {
  let page = 1;
  const perPage = 1000;
  while (page <= 5) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (!data?.users || data.users.length === 0) break;
    const match = data.users.find((u: any) => u.email?.toLowerCase().trim() === email);
    if (match) return match;
    if (data.users.length < perPage) break;
    page++;
  }
  return null;
}

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('creator_applications')
      .select('*', { count: 'exact' });

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({
      applications: data,
      totalCount: count || 0,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { id, action, reviewer_notes } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    let status = '';
    if (action === 'approve') status = 'approved';
    else if (action === 'waitlist') status = 'waitlist';
    else if (action === 'reject') status = 'rejected';
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString()
    };

    if (reviewer_notes !== undefined) {
      updateData.reviewer_notes = reviewer_notes;
    }

    const { data, error } = await supabaseAdmin
      .from('creator_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    // When approved: auto-create auth.users + profiles (role='creator') so creator needs zero password setup, and send 1-click magic link email
    if (action === 'approve' && data?.email) {
      const cleanEmail = data.email.toLowerCase().trim();
      let magicLinkUrl: string | undefined;

      try {
        const existingUser = await findAuthUserByEmail(supabaseAdmin, cleanEmail);

        const baseUsername = (
          extractHandleFromLink(data.link1, cleanEmail) ||
          existingUser?.user_metadata?.username ||
          cleanEmail.split('@')[0] ||
          'creator'
        )
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .slice(0, 24) || `creator_${Math.floor(1000 + Math.random() * 9000)}`;

        const displayName =
          data.full_name?.trim() ||
          existingUser?.user_metadata?.full_name ||
          cleanEmail.split('@')[0];

        let targetUserId = existingUser?.id || null;

        if (!targetUserId) {
          const randomPassword = crypto.randomBytes(24).toString('base64url') + 'A1!';
          const { data: created } = await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: randomPassword,
            email_confirm: true,
            user_metadata: {
              username: baseUsername,
              full_name: displayName,
              role: 'creator',
              email_verified: true,
            },
          });
          targetUserId = created?.user?.id || null;
        } else if (!existingUser?.email_confirmed_at) {
          await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
            email_confirm: true,
            user_metadata: {
              ...existingUser?.user_metadata,
              role: 'creator',
              email_verified: true,
            },
          });
        }

        if (targetUserId) {
          await supabaseAdmin.from('profiles').upsert(
            {
              id: targetUserId,
              username: baseUsername,
              display_name: displayName,
              role: 'creator',
            },
            { onConflict: 'id' }
          );
        }

        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: cleanEmail,
          options: {
            redirectTo: 'https://seccion.ai/auth/callback?next=/studio',
          },
        });

        const hashedToken = linkData?.properties?.hashed_token;
        if (hashedToken) {
          // Construct direct query-param URL for rock-solid server-side callback verification (H1 fix)
          magicLinkUrl = `https://seccion.ai/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=magiclink&next=/studio`;
        } else if (linkData?.properties?.action_link) {
          magicLinkUrl = linkData.properties.action_link;
        }
      } catch (e) {
        console.warn('[Admin Approve] Profile auto-provision notice:', e);
      }

      sendCreatorApprovalEmail({
        email: cleanEmail,
        fullName: data.full_name || cleanEmail.split('@')[0],
        magicLinkUrl,
      }).catch((e) => console.warn('[Admin Approve] Approval email notice:', e));
    }

    return NextResponse.json({ success: true, application: data });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email && !id) {
      return NextResponse.json({ error: 'Email or ID required' }, { status: 400 });
    }

    let query = supabaseAdmin.from('creator_applications').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim());
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
