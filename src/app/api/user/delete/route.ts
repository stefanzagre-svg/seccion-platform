import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin-client';

const supabaseAdmin = createAdminClient();

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the user's token using the admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Auth error during deletion:", userError);
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Now delete the user using the admin client
    // Since public.profiles has ON DELETE CASCADE on the user_id foreign key, 
    // deleting them from auth.users will automatically clean up all associated data in the database.
    const { data, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("Failed to delete user:", deleteError);
      return NextResponse.json({ error: 'Failed to delete account from server' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Account successfully deleted' }, { status: 200 });

  } catch (error) {
    console.error('Account deletion processing error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
