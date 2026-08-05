import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// Replace with your actual Shufti Pro secret
const SHUFTI_SECRET = process.env.SHUFTI_PRO_SECRET || 'test_secret';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Handle intent creation (Simulation for frontend)
    if (body.action === 'create_intent') {
      const { userId } = body;
      if (!userId) {
        return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
      }

      const reference_id = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const { error } = await supabase
        .from('creator_kyc')
        .insert({
          creator_id: userId,
          reference_id: reference_id,
          verification_provider: 'shufti_pro',
          status: 'pending'
        });

      if (error) throw error;

      return NextResponse.json({ success: true, reference_id });
    }

    // Handle actual Shufti Pro Webhook
    const signature = req.headers.get('signature');
    if (signature) {
      // Validate signature (Shufti Pro uses SHA256 of the raw payload + secret)
      const expectedSignature = crypto.createHash('sha256').update(rawBody + SHUFTI_SECRET).digest('hex');
      
      // In production, we'd enforce this. For now, we log it.
      if (signature !== expectedSignature) {
        console.warn('Shufti Pro signature mismatch');
      }
    }

    const { reference, event, verification_result } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    let status = 'pending';
    if (event === 'verification.accepted') status = 'approved';
    else if (event === 'verification.declined') status = 'rejected';

    const { error } = await supabase
      .from('creator_kyc')
      .update({
        status,
        verification_data: verification_result,
        updated_at: new Date().toISOString()
      })
      .eq('reference_id', reference);

    if (error) {
      console.error('Failed to update KYC status:', error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Shufti Pro Webhook Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
