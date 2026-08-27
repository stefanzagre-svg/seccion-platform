import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('crm_outreach_leads')
      .select('*', { count: 'exact' });

    if (status && status !== 'All') {
      query = query.eq('status', status.toLowerCase());
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const [leadsResponse, statsResponse] = await Promise.all([
      query,
      supabaseAdmin.from('crm_outreach_leads').select('city, status')
    ]);

    if (leadsResponse.error) {
      console.error('Supabase query error:', leadsResponse.error);
      throw leadsResponse.error;
    }

    // Group by city for Milestones
    const cityStats: Record<string, { total: number, approved: number }> = {};
    if (statsResponse.data) {
      statsResponse.data.forEach((lead) => {
        const c = lead.city || 'Unknown';
        if (!cityStats[c]) {
          cityStats[c] = { total: 0, approved: 0 };
        }
        cityStats[c].total++;
        if (lead.status === 'approved_onboarded') {
          cityStats[c].approved++;
        }
      });
    }

    return NextResponse.json({
      leads: leadsResponse.data,
      totalCount: leadsResponse.count || 0,
      cityStats,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/crm-outreach:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await request.json();
    const { id, status, outreach_stage, reviewer_notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status !== undefined) updateData.status = status;
    if (outreach_stage !== undefined) updateData.outreach_stage = outreach_stage;
    if (reviewer_notes !== undefined) updateData.reviewer_notes = reviewer_notes;

    const { data, error } = await supabaseAdmin
      .from('crm_outreach_leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/crm-outreach:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
