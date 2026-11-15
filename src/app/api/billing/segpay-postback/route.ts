import { NextRequest, NextResponse } from 'next/server';
import { verifySegpaySignature } from '@/lib/segpay-verify';

/**
 * Segpay Postback Endpoint
 * Receives server-to-server notifications from Segpay.
 * Fields usually sent by Segpay:
 * action: auth, void, chargeback, rebill, cancel
 * tranid: transaction ID
 * custom1: subscriberId
 * custom2: creatorId
 * custom3: tier
 * price: amount
 * trantype: SALE, etc.
 */
export async function POST(req: NextRequest) {
  try {
    // Segpay typically sends data as form urlencoded
    const text = await req.text();
    const data = new URLSearchParams(text);

    const action = data.get('action');
    const subscriberId = data.get('custom1');
    const creatorId = data.get('custom2');
    const tier = data.get('custom3');
    const tranid = data.get('tranid');
    const price = data.get('price');

    // Basic validation
    if (!action || !subscriberId || !creatorId || !tier) {
      return NextResponse.json({ error: 'Missing necessary custom tracking parameters' }, { status: 400 });
    }

    // Cryptographic signature verification against SEGPAY_POSTBACK_SECRET
    const secret = process.env.SEGPAY_POSTBACK_SECRET;
    if (!secret) {
      console.error('[Segpay Webhook] SEGPAY_POSTBACK_SECRET is not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const receivedHash = data.get('hash') || data.get('signature') || req.headers.get('x-segpay-signature');
    if (!receivedHash) {
      console.warn('[Segpay Webhook] Missing signature/hash');
      return NextResponse.json({ error: 'Missing security signature' }, { status: 401 });
    }

    const isValid = verifySegpaySignature(data, secret, receivedHash);
    if (!isValid) {
      console.warn('[Segpay Webhook] Invalid signature rejected');
      return NextResponse.json({ error: 'Invalid security signature' }, { status: 403 });
    }

    // Legacy Segpay processing retired under Financial Stack V3.1
    const maskedSub = subscriberId ? `${subscriberId.slice(0, 4)}...${subscriberId.slice(-4)}` : 'anon';
    const maskedCreator = creatorId ? `${creatorId.slice(0, 4)}...${creatorId.slice(-4)}` : 'anon';
    console.warn(`[Segpay Webhook] Retired processor postback received post-signature verification (sub: ${maskedSub}, creator: ${maskedCreator}, action: ${action})`);

    return NextResponse.json(
      {
        error: 'LEGACY_PROCESSOR_RETIRED',
        message: 'Segpay billing has been retired under SECCION Financial Stack V3.1. Use NOWPayments USDC, Coinflow, or Open Banking A2A rails.',
      },
      { status: 410 }
    );
  } catch (err: unknown) {
    console.error('[Segpay Webhook] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
