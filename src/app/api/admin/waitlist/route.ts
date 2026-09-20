import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/admin-auth';

/**
 * GET /api/admin/waitlist
 * Paginated early access member waitlist with search and filtering.
 * Query params: page, limit, search, city, founding_only
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminAuth(request);
    if (!admin) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const foundingOnly = searchParams.get('founding_only') === 'true';

    const adminClient = createAdminClient();

    let query = adminClient
      .from('member_waitlist')
      .select('id, email, city, founding_member, created_at', { count: 'exact' });

    if (search) {
      query = query.ilike('email', `%${search}%`);
    }

    if (city && city !== 'All') {
      query = query.eq('city', city);
    }

    if (foundingOnly) {
      query = query.eq('founding_member', true);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: waitlist, count, error } = await query;

    if (error) {
      console.error('[Admin Waitlist API] Query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch distinct cities for filtering convenience
    const { data: cityRows } = await adminClient
      .from('member_waitlist')
      .select('city');
    
    const uniqueCities = Array.from(new Set((cityRows || []).map((r: any) => r.city).filter(Boolean))).sort();

    return NextResponse.json({
      waitlist: waitlist || [],
      cities: uniqueCities,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err: any) {
    console.error('[Admin Waitlist API] Exception:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
