import { NextRequest, NextResponse } from 'next/server';
import { nowPayments } from '@/lib/nowpayments';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { creatorId, amount, currency = 'usd', payCurrency = 'usdttrc20', orderType = 'subscription', description } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    const orderId = `crypto_${orderType}_${Date.now()}_${user.id.substring(0, 6)}`;
    const origin = req.nextUrl.origin;

    const invoice = await nowPayments.createInvoice({
      priceAmount: amount,
      priceCurrency: currency.toLowerCase(),
      payCurrency: payCurrency.toLowerCase(),
      orderId,
      orderDescription: description || `SECCION ${orderType.toUpperCase()} - Creator ${creatorId || 'Platform'}`,
      ipnCallbackUrl: `${origin}/api/billing/crypto/webhook`,
      successUrl: `${origin}/dashboard?payment=crypto_success`,
      cancelUrl: `${origin}/dashboard?payment=crypto_cancelled`,
    });

    return NextResponse.json({
      success: true,
      invoiceId: invoice.id,
      invoiceUrl: invoice.invoice_url,
      orderId
    });
  } catch (error: any) {
    console.error('Error creating NOWPayments invoice:', error);
    return NextResponse.json({ error: error.message || 'Failed to initialize crypto payment' }, { status: 500 });
  }
}
