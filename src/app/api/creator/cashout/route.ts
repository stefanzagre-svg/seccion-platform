import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { validateMoroccanRib } from '@/lib/morocco-banking';

const cashoutSettingsSchema = z.object({
  preferredRail: z.enum(['sepa', 'crypto_usdt', 'wise', 'cosmo_card', 'morocco_bank']),
  sepaIban: z.string().optional(),
  sepaBic: z.string().optional(),
  accountHolderName: z.string().optional(),
  cryptoNetwork: z.enum(['solana', 'tron_trc20']).optional().default('solana'),
  cryptoWalletAddress: z.string().optional(),
  wiseEmail: z.string().email().optional().or(z.literal('')),
  cosmoAccountId: z.string().optional(),
  moroccoRib: z.string().optional(),
  moroccoSwiftBic: z.string().optional(),
  moroccoBankName: z.string().optional(),
  autoPayoutEnabled: z.boolean().optional().default(false),
  minPayoutThreshold: z.number().int().min(10).optional().default(50)
});

// GET: Fetch creator's cashout preferences and pending balance
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch settings
    const { data: settings } = await supabase
      .from('creator_payout_settings')
      .select('*')
      .eq('creator_id', user.id)
      .single();

    // Calculate total net pending earnings
    const { data: earnings } = await supabase
      .from('creator_earnings_ledger')
      .select('creator_share_amount, status')
      .eq('creator_id', user.id)
      .eq('status', 'credited');

    const totalAvailableEur = (earnings || []).reduce((acc: number, curr: any) => acc + Number(curr.creator_share_amount || 0), 0);

    return NextResponse.json({
      success: true,
      settings: settings || {
        preferred_rail: 'sepa',
        auto_payout_enabled: false,
        min_payout_threshold: 50
      },
      availableBalanceEur: Number(totalAvailableEur.toFixed(2)),
      splitGuarantee: '90% Net Creator Share Honored'
    });
  } catch (err: any) {
    console.error('Fetch cashout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Save or update preferred cashout rails
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = cashoutSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid settings parameters', details: parsed.error.format() }, { status: 400 });
    }

    const {
      preferredRail,
      sepaIban,
      sepaBic,
      accountHolderName,
      cryptoNetwork,
      cryptoWalletAddress,
      wiseEmail,
      cosmoAccountId,
      moroccoRib,
      moroccoSwiftBic,
      moroccoBankName,
      autoPayoutEnabled,
      minPayoutThreshold
    } = parsed.data;

    let validatedMoroccoRib = moroccoRib || '';
    let validatedMoroccoBic = moroccoSwiftBic || '';
    let validatedMoroccoBank = moroccoBankName || '';
    let derivedIban = sepaIban || '';

    if (preferredRail === 'morocco_bank') {
      if (!moroccoRib) {
        return NextResponse.json({ error: 'Moroccan 24-digit RIB is required for Moroccan Bank payout' }, { status: 400 });
      }
      const ribCheck = validateMoroccanRib(moroccoRib);
      if (!ribCheck.isValid) {
        return NextResponse.json({ error: ribCheck.error || 'Invalid Moroccan RIB format' }, { status: 400 });
      }
      validatedMoroccoRib = ribCheck.cleanRib;
      validatedMoroccoBic = ribCheck.bankInfo?.bic || moroccoSwiftBic || 'BCMADMMC';
      validatedMoroccoBank = ribCheck.bankInfo?.name || moroccoBankName || 'Moroccan Commercial Bank';
      derivedIban = ribCheck.iban || derivedIban;
    }

    const payoutPayload: Record<string, any> = {
      creator_id: user.id,
      preferred_rail: preferredRail,
      sepa_iban: derivedIban || sepaIban || null,
      sepa_bic: validatedMoroccoBic || sepaBic || null,
      account_holder_name: accountHolderName || null,
      crypto_network: cryptoNetwork || 'solana',
      crypto_wallet_address: cryptoWalletAddress || null,
      wise_email: wiseEmail || null,
      cosmo_account_id: cosmoAccountId || null,
      auto_payout_enabled: autoPayoutEnabled,
      min_payout_threshold: minPayoutThreshold,
      updated_at: new Date().toISOString()
    };

    if (validatedMoroccoRib) {
      payoutPayload.morocco_rib = validatedMoroccoRib;
      payoutPayload.morocco_swift_bic = validatedMoroccoBic;
      payoutPayload.morocco_bank_name = validatedMoroccoBank;
    }

    const { error: upsertError } = await supabase
      .from('creator_payout_settings')
      .upsert(payoutPayload);

    if (upsertError) {
      // If error is due to column not existing yet, retry without optional morocco columns
      if (upsertError.message?.includes('morocco_rib')) {
        delete payoutPayload.morocco_rib;
        delete payoutPayload.morocco_swift_bic;
        delete payoutPayload.morocco_bank_name;
        const { error: retryError } = await supabase
          .from('creator_payout_settings')
          .upsert(payoutPayload);
        if (retryError) throw retryError;
      } else {
        throw upsertError;
      }
    }

    // Also mirror to isolated creator_private_data
    if (preferredRail === 'morocco_bank' && validatedMoroccoRib) {
      try {
        await supabase
          .from('creator_private_data')
          .upsert({
            user_id: user.id,
            morocco_rib: validatedMoroccoRib,
            morocco_bank_name: validatedMoroccoBank,
            morocco_swift_bic: validatedMoroccoBic,
            updated_at: new Date().toISOString()
          });
      } catch (privErr) {
        console.warn('[Cashout API] creator_private_data sync notice:', privErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Creator payout preferences saved successfully.',
      preferredRail,
      bankInfo: validatedMoroccoBank ? { name: validatedMoroccoBank, bic: validatedMoroccoBic } : undefined,
      iban: derivedIban || undefined
    });
  } catch (err: any) {
    console.error('Save cashout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
