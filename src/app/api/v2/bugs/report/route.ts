import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { checkBugReportRateLimit, calculateBugReward, BugCategory, BugSeverity } from '@/lib/bug-bounty';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const ip = req.headers.get('x-forwarded-for') || 'anon-ip';
    const identifier = user?.id || ip;

    // 1. Rate Limiting Check
    const rateLimit = checkBugReportRateLimit(identifier);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'You have submitted too many reports recently. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      category = 'visual_display',
      title,
      description,
      severity = 'medium',
      pageUrl = '',
      userAgent = '',
      viewportSize = '',
      screenshotUrl = '',
    } = body;

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a brief description of what happened (minimum 5 characters).' },
        { status: 400 }
      );
    }

    // Determine user role and reward estimation
    let userRole: 'member' | 'creator' | 'guest' = 'guest';
    let userEmail = user?.email || null;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = profile?.role === 'creator' ? 'creator' : 'member';
    }

    const reward = calculateBugReward(userRole, severity as BugSeverity);
    const reportTitle = (title && typeof title === 'string' && title.trim())
      ? title.trim().slice(0, 120)
      : `${category.replace('_', ' ').toUpperCase()}: ${description.trim().slice(0, 60)}...`;

    // 2. Insert into Supabase (Admin client to bypass any guest insertion edge cases)
    const adminDb = createAdminClient();
    const { data: report, error: insertError } = await adminDb
      .from('bug_reports')
      .insert({
        reporter_id: user?.id || null,
        reporter_email: userEmail,
        reporter_role: userRole,
        category: category as BugCategory,
        title: reportTitle,
        description: description.trim(),
        severity: severity as BugSeverity,
        status: 'pending',
        page_url: pageUrl,
        user_agent: userAgent,
        viewport_size: viewportSize,
        screenshot_url: screenshotUrl || null,
        reward_status: 'pending',
        reward_type: reward.rewardType,
        reward_amount: reward.rewardAmount,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Bug Report] Database Insert Error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit bug report. Please try again.' },
        { status: 500 }
      );
    }

    // 3. Instant Telegram Admin Dispatch (Fire & Forget)
    const telegramMessage = 
      `🐞 *NEW BUG REPORT FILED* (#${report?.id?.slice(0, 8) || 'N/A'})\n\n` +
      `👤 *Reporter:* ${userEmail || 'Guest'} (${userRole.toUpperCase()})\n` +
      `🏷️ *Category:* ${category}\n` +
      `⚡ *Severity:* ${severity.toUpperCase()}\n` +
      `🌐 *URL:* ${pageUrl || 'N/A'}\n` +
      `📱 *Viewport:* ${viewportSize || 'N/A'}\n\n` +
      `📝 *Description:*\n"${description.trim()}"\n\n` +
      `🎁 *Est. Reward:* ${reward.descriptionEn}\n` +
      `👉 [Review in Admin Dashboard](https://seccion.ai/admin/bugs)`;

    sendTelegramMessage(telegramMessage).catch((err) => {
      console.warn('[Bug Report] Telegram dispatch skipped:', err);
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      estimatedReward: reward,
      message: 'Bug report received! Our team will review it and grant your reward upon verification.'
    });

  } catch (error: any) {
    console.error('[Bug Report API Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error while filing report.' },
      { status: 500 }
    );
  }
}
