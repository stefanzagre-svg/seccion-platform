import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

const supabaseAdmin = createAdminClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    let query = supabaseAdmin
      .from('creator_applications')
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

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({
      applications: data,
      totalCount: count || 0,
      page,
      limit
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, reviewer_notes } = body;

    if (!id || !action) {
      return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
    }

    let status = '';
    if (action === 'approve') status = 'approved';
    else if (action === 'waitlist') status = 'waitlist';
    else if (action === 'reject') status = 'rejected';
    else return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString()
    };

    if (reviewer_notes !== undefined) {
      updateData.reviewer_notes = reviewer_notes;
    }

    const { data, error } = await supabaseAdmin
      .from('creator_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, application: data });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (!email && !id) {
      return NextResponse.json({ error: 'Email or ID required' }, { status: 400 });
    }

    let query = supabaseAdmin.from('creator_applications').delete();
    if (id) {
      query = query.eq('id', id);
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim());
    }

    const { error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/admin/creator-applications:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
