import { NextRequest, NextResponse } from 'next/server';
import { nowPayments, type NOWPaymentsIPNPayload } from '@/lib/nowpayments';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig') || '';

    // 1. Verify HMAC-SHA512 Signature
    const isValid = nowPayments.verifyIPNSignature(rawBody, signature);
    if (!isValid) {
      console.warn('[NOWPayments IPN] Invalid HMAC signature rejected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const payload: NOWPaymentsIPNPayload = JSON.parse(rawBody);
    console.info(`[NOWPayments IPN] Received payment status ${payload.payment_status} for order ${payload.order_id}`);

    // We only finalize on confirmed / finished status
    if (payload.payment_status !== 'confirmed' && payload.payment_status !== 'finished') {
      return NextResponse.json({ received: true, status: payload.payment_status });
    }

    const supabaseAdmin = createAdminClient();

    // 2. Determine Creator Split (Default to 90% founding split)
    const split = nowPayments.calculateCryptoSplit(payload.price_amount, true);

    // 3. Atomically record crypto transaction in ledger
    const { error: ledgerError } = await supabaseAdmin
      .from('platform_transactions')
      .insert({
        payment_id: String(payload.payment_id),
        order_id: payload.order_id,
        processor: 'nowpayments',
        pay_currency: payload.pay_currency,
        gross_amount: split.grossAmount,
        processor_fee: split.processorFee,
        net_revenue: split.netRevenue,
        creator_share: split.creatorShare,
        platform_share: split.platformShare,
        status: 'completed',
        metadata: {
          actually_paid: payload.actually_paid,
          pay_address: payload.pay_address,
          purchase_id: payload.purchase_id
        }
      });

    if (ledgerError) {
      console.warn('[NOWPayments IPN] Note on transaction ledger insert:', ledgerError.message);
    }

    return NextResponse.json({ success: true, processed: true, split });
  } catch (error: any) {
    console.error('Error processing NOWPayments IPN webhook:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
