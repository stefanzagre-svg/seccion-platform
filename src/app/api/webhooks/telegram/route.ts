import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

function escapeHtml(text: unknown): string {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function verifyWebhookSecret(request: Request): boolean {
  const expected =
    process.env.SUPABASE_WEBHOOK_SECRET?.trim() ||
    process.env.TELEGRAM_WEBHOOK_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const provided =
    request.headers.get('x-supabase-webhook-secret') ||
    request.headers.get('x-webhook-secret') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    '';
  if (!provided || provided.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: Request) {
  try {
    if (!verifyWebhookSecret(request)) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 });
    }

    // Parse the payload from Supabase Webhook
    const body = await request.json();

    // Ensure this is an INSERT event on the profiles table
    if (body.type !== 'INSERT' || !body.record) {
      return NextResponse.json({ message: 'Ignored non-insert event' }, { status: 200 });
    }

    const newProfile = body.record;
    
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials are not configured in environment variables.');
      return NextResponse.json({ error: 'Telegram configuration missing' }, { status: 500 });
    }

    // Format the message for the Telegram push notification using HTML
    const roleEmoji = newProfile.role === 'creator' ? '⭐' : '👤';
    const message = `
🚀 <b>New Signup Alert!</b>
${roleEmoji} <b>Role:</b> ${escapeHtml(String(newProfile.role || 'member').toUpperCase())}
🆔 <b>Username:</b> @${escapeHtml(newProfile.username || 'unknown')}
${newProfile.is_kyc_verified ? '✅ KYC Verified' : '⏳ KYC Pending'}

<a href="https://supabase.com/dashboard">View in Supabase Dashboard</a>
    `.trim();

    // Send the message to the Telegram API
    const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send Telegram message:', errorText);
      return NextResponse.json({ error: 'Failed to notify Telegram' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Notification sent' }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
