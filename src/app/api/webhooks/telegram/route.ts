import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
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

    // Format the message for the Telegram push notification
    const roleEmoji = newProfile.role === 'creator' ? '⭐' : '👤';
    const message = `
🚀 *New Signup Alert!*
${roleEmoji} *Role:* ${newProfile.role?.toUpperCase()}
🆔 *Username:* @${newProfile.username}
${newProfile.is_kyc_verified ? '✅ KYC Verified' : '⏳ KYC Pending'}

[View in Supabase Dashboard](https://supabase.com/dashboard)
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
        parse_mode: 'Markdown',
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
