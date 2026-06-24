import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Use createBrowserClient (from @supabase/ssr) so that auth sessions are stored
// in cookies rather than localStorage. This is required for the server-side proxy
// middleware to read the session and avoid redirect loops after sign-up.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
