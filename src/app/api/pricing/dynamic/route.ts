import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json({ error: 'creatorId is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    
    // Fetch the creator's base subscription price
    const { data: creator, error: creatorError } = await supabase
      .from('profiles')
      .select('base_subscription_price')
      .eq('id', creatorId)
      .single();

    if (creatorError) throw creatorError;

    const basePrice = creator?.base_subscription_price || 19.99;

    // Fetch the volume of approved MASTER content released by this creator
    const { count, error: contentError } = await supabase
      .from('platform_content')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', creatorId)
      .eq('tier', 'master')
      .eq('moderation_status', 'approved');

    if (contentError) throw contentError;

    const contentVolume = count || 0;

    // Dynamic Pricing Logic: Base Price * (1 + (contentVolume * 0.5)) 
    // This scales the MASTER price drastically as more exclusive content is added.
    const multiplier = 1 + (contentVolume * 0.5);
    const dynamicPrice = basePrice * multiplier;

    return NextResponse.json({
      creatorId,
      basePrice,
      contentVolume,
      multiplier,
      dynamicPrice: parseFloat(dynamicPrice.toFixed(2))
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
