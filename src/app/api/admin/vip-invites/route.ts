import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyAdminAuth, unauthorizedResponse, logAdminAction, getClientIP } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  buildVipDmTemplates,
  generateVipInviteCode,
  normalizeSocialHandle,
  resolveVipInviteStatus,
  type VipInviteRecord,
} from '@/lib/vip-invites';
import { sendVipFastTrackInviteEmail, type EmailLocale } from '@/lib/email';

const PUBLIC_SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://seccion.ai').replace(/\/$/, '');

const createVipInviteSchema = z.object({
  creatorName: z.string().trim().max(100).optional().nullable(),
  socialHandle: z.string().trim().max(120).optional().nullable(),
  platform: z
    .enum(['instagram', 'tiktok', 'x', 'youtube', 'onlyfans', 'whatsapp', 'other'])
    .optional()
    .default('instagram'),
  email: z.string().trim().email().optional().or(z.literal('')).nullable(),
  locale: z.enum(['en', 'es', 'fr']).optional().default('en'),
  niche: z.string().trim().max(60).optional().nullable(),
  moroccoShield: z.boolean().optional().default(false),
  expiresInDays: z.number().int().min(1).max(90).optional().default(14),
  maxUses: z.number().int().min(1).max(10).optional().default(1),
  sendEmail: z.boolean().optional().default(false),
  notes: z.string().trim().max(500).optional().nullable(),
});

const patchVipInviteSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['revoke', 'reactivate', 'extend', 'resend_email']),
  extendDays: z.number().int().min(1).max(90).optional().default(14),
});

function serializeVipInvite(invite: VipInviteRecord) {
  const inviteUrl = `${PUBLIC_SITE_URL}/vip/${invite.code}`;
  return {
    ...invite,
    status: resolveVipInviteStatus(invite),
    inviteUrl,
    dmTemplates: buildVipDmTemplates({
      inviteUrl,
      creatorName: invite.creator_name,
      socialHandle: invite.social_handle,
      moroccoShield: invite.morocco_shield,
    }),
  };
}

export async function GET(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  if (!admin) return unauthorizedResponse();

  const adminDb = createAdminClient();
  const { data, error } = await adminDb
    .from('creator_vip_invites')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json(
      { error: `Failed to fetch VIP invites: ${error.message}` },
      { status: 500 }
    );
  }

  const invites = ((data || []) as VipInviteRecord[]).map(serializeVipInvite);
  const stats = invites.reduce(
    (acc, inv) => {
      acc.total += 1;
      if (inv.status === 'active') acc.active += 1;
      else if (inv.status === 'claimed') acc.claimed += 1;
      else if (inv.status === 'revoked') acc.revoked += 1;
      else if (inv.status === 'expired') acc.expired += 1;
      return acc;
    },
    { total: 0, active: 0, claimed: 0, revoked: 0, expired: 0 }
  );

  return NextResponse.json({ invites, stats });
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  if (!admin) return unauthorizedResponse();

  const rawBody = await request.json().catch(() => null);
  const parsed = createVipInviteSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid VIP invite payload', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const cleanHandle = normalizeSocialHandle(payload.socialHandle);
  const cleanEmail = payload.email ? payload.email.toLowerCase().trim() : null;
  const cleanName = payload.creatorName?.trim() || null;

  if (!cleanHandle && !cleanEmail && !cleanName) {
    return NextResponse.json(
      { error: 'Provide at least a Creator Name, Social Handle, or Email.' },
      { status: 400 }
    );
  }

  const adminDb = createAdminClient();
  const expiresAt = new Date(
    Date.now() + payload.expiresInDays * 24 * 60 * 60 * 1000
  ).toISOString();

  let createdInvite: VipInviteRecord | null = null;
  let lastError: string | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const code = generateVipInviteCode(cleanHandle || cleanName || cleanEmail?.split('@')[0]);
    const { data, error } = await adminDb
      .from('creator_vip_invites')
      .insert({
        code,
        creator_name: cleanName,
        social_handle: cleanHandle || null,
        platform: payload.platform,
        email: cleanEmail,
        locale: payload.locale,
        niche: payload.niche?.trim() || null,
        morocco_shield: payload.moroccoShield,
        ai_free_months: 12,
        founding_split: 90,
        max_uses: payload.maxUses,
        expires_at: expiresAt,
        notes: payload.notes?.trim() || null,
        created_by: admin.userId,
      })
      .select('*')
      .single();

    if (!error && data) {
      createdInvite = data as VipInviteRecord;
      break;
    }
    lastError = error?.message || 'Insert failed';
  }

  if (!createdInvite) {
    return NextResponse.json(
      { error: `Failed to generate VIP invite: ${lastError}` },
      { status: 500 }
    );
  }

  const serialized = serializeVipInvite(createdInvite);
  let emailSent = false;

  if (payload.sendEmail && cleanEmail) {
    try {
      await sendVipFastTrackInviteEmail({
        email: cleanEmail,
        creatorName: cleanName,
        socialHandle: cleanHandle || null,
        locale: payload.locale as EmailLocale,
        inviteUrl: serialized.inviteUrl,
      });
      emailSent = true;
    } catch (emailErr) {
      console.error('[VIP Invites] Email send failed:', emailErr);
    }
  }

  await logAdminAction({
    adminId: admin.userId,
    action: 'create_creator_vip_invite',
    targetTable: 'creator_vip_invites',
    targetId: createdInvite.id,
    newValue: {
      code: createdInvite.code,
      social_handle: createdInvite.social_handle,
      email: createdInvite.email,
      morocco_shield: createdInvite.morocco_shield,
      emailSent,
    },
    ipAddress: getClientIP(request),
    userAgent: request.headers.get('user-agent') || undefined,
  }).catch(() => {});

  return NextResponse.json(
    {
      ok: true,
      invite: serialized,
      emailSent,
    },
    { status: 201 }
  );
}

export async function PATCH(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  if (!admin) return unauthorizedResponse();

  const rawBody = await request.json().catch(() => null);
  const parsed = patchVipInviteSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid VIP invite update payload', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { id, action, extendDays } = parsed.data;
  const adminDb = createAdminClient();

  const { data: existing, error: fetchErr } = await adminDb
    .from('creator_vip_invites')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'VIP invite not found' }, { status: 404 });
  }

  const current = existing as VipInviteRecord;

  if (action === 'resend_email') {
    if (!current.email) {
      return NextResponse.json(
        { error: 'This VIP pass is not bound to an email address.' },
        { status: 400 }
      );
    }
    const serialized = serializeVipInvite(current);
    await sendVipFastTrackInviteEmail({
      email: current.email,
      creatorName: current.creator_name,
      socialHandle: current.social_handle,
      locale: current.locale,
      inviteUrl: serialized.inviteUrl,
    });
    return NextResponse.json({ ok: true, invite: serialized, emailSent: true });
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (action === 'revoke') {
    updates.is_revoked = true;
  } else if (action === 'reactivate') {
    updates.is_revoked = false;
    if (new Date(current.expires_at).getTime() <= Date.now()) {
      updates.expires_at = new Date(Date.now() + extendDays * 24 * 60 * 60 * 1000).toISOString();
    }
  } else if (action === 'extend') {
    const baseMs = Math.max(Date.now(), new Date(current.expires_at).getTime());
    updates.expires_at = new Date(baseMs + extendDays * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data: updated, error: updateErr } = await adminDb
    .from('creator_vip_invites')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: `Failed to update VIP invite: ${updateErr?.message}` },
      { status: 500 }
    );
  }

  await logAdminAction({
    adminId: admin.userId,
    action: `vip_invite_${action}`,
    targetTable: 'creator_vip_invites',
    targetId: id,
    oldValue: { is_revoked: current.is_revoked, expires_at: current.expires_at },
    newValue: updates,
    ipAddress: getClientIP(request),
  }).catch(() => {});

  return NextResponse.json({
    ok: true,
    invite: serializeVipInvite(updated as VipInviteRecord),
  });
}

export async function DELETE(request: NextRequest) {
  const admin = await verifyAdminAuth(request);
  if (!admin) return unauthorizedResponse();

  const id = request.nextUrl.searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing invite id' }, { status: 400 });
  }

  const adminDb = createAdminClient();
  const { data: existing } = await adminDb
    .from('creator_vip_invites')
    .select('id, uses_count, code')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'VIP invite not found' }, { status: 404 });
  }

  if ((existing.uses_count ?? 0) > 0) {
    return NextResponse.json(
      { error: 'Claimed VIP invites cannot be deleted; revoke instead to preserve audit history.' },
      { status: 400 }
    );
  }

  const { error } = await adminDb.from('creator_vip_invites').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    adminId: admin.userId,
    action: 'delete_creator_vip_invite',
    targetTable: 'creator_vip_invites',
    targetId: id,
    oldValue: { code: existing.code },
    ipAddress: getClientIP(request),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
