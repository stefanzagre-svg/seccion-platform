import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service key needed to bypass RLS and fetch/promote test admin

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env.local (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runTests() {
  console.log('🧪 Starting Platform Admin Dashboard Integration Tests...');

  try {
    // 1. Fetch or create a test admin user
    console.log('🔍 Locating or creating a test administrator user...');
    
    // Check if an admin already exists
    let { data: adminUser } = await supabase
      .from('profiles')
      .select('id, username, platform_role')
      .in('platform_role', ['admin', 'super_admin'])
      .limit(1)
      .single();

    if (!adminUser) {
      console.log('⚠️ No admin found. Promoting the first available user for testing...');
      // Get any user
      const { data: anyUser } = await supabase
        .from('profiles')
        .select('id, username')
        .limit(1)
        .single();

      if (!anyUser) {
        console.error('❌ Database contains zero users. Please seed users first.');
        process.exit(1);
      }

      // Promote to super_admin
      const { error: promoteError } = await supabase
        .from('profiles')
        .update({ platform_role: 'super_admin' })
        .eq('id', anyUser.id);

      if (promoteError) {
        throw new Error(`Failed to promote user to admin: ${promoteError.message}`);
      }

      adminUser = {
        id: anyUser.id,
        username: anyUser.username,
        platform_role: 'super_admin'
      };
      console.log(`✅ Promoted @${anyUser.username} to super_admin for testing.`);
    } else {
      console.log(`✅ Using existing admin user: @${adminUser.username} (${adminUser.platform_role})`);
    }

    const testAdminId = adminUser.id;
    const devHeaders = {
      'x-dev-admin-id': testAdminId,
      'Content-Type': 'application/json'
    };
    
    const baseUrl = 'http://localhost:3000'; // Target local dev server

    console.log(`\n📡 Testing Admin API Routes using dev bypass header (Admin ID: ${testAdminId})...`);

    // Helper to request local server
    const testRoute = async (path, options = {}) => {
      const url = `${baseUrl}${path}`;
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            ...devHeaders,
            ...options.headers
          }
        });
        
        if (res.ok) {
          console.log(`🟢 GET ${path} — Success (${res.status})`);
          return await res.json();
        } else {
          console.log(`🔴 GET ${path} — Failed (${res.status})`);
          try {
            const errJson = await res.json();
            console.log(`   Error body:`, errJson);
          } catch {
            console.log(`   No JSON error payload returned.`);
          }
          return null;
        }
      } catch (err) {
        console.log(`🔴 GET ${path} — Connection Error:`, err.message);
        console.log(`⚠️ Make sure your Next.js local server is running at ${baseUrl}`);
        return null;
      }
    };

    // Test 1: Dashboard aggregations
    console.log('\n📊 Test 1: /api/admin/dashboard');
    const dashData = await testRoute('/api/admin/dashboard');
    if (dashData) {
      console.log(`   KPIs total users: ${dashData.kpis?.totalUsers}`);
      console.log(`   KPIs active live streams: ${dashData.kpis?.activeLiveStreams}`);
    }

    // Test 2: Users list
    console.log('\n👥 Test 2: /api/admin/users');
    const usersData = await testRoute('/api/admin/users?limit=5');
    if (usersData) {
      console.log(`   Returned users: ${usersData.users?.length}`);
      console.log(`   Total registry count: ${usersData.pagination?.total}`);
    }

    // Test 3: Moderation queue
    console.log('\n🛡️ Test 3: /api/admin/moderation');
    const modData = await testRoute('/api/admin/moderation');
    if (modData) {
      console.log(`   Pending items in queue: ${modData.stats?.pending}`);
    }

    // Test 4: Audit Logs
    console.log('\n📜 Test 4: /api/admin/audit');
    const auditData = await testRoute('/api/admin/audit?limit=5');
    if (auditData) {
      console.log(`   Returned audit logs: ${auditData.logs?.length}`);
    }

    // Test 5: Settings
    console.log('\n⚙️ Test 5: /api/admin/settings');
    const settingsData = await testRoute('/api/admin/settings');
    if (settingsData) {
      console.log(`   Seeded feature flags text_translation: ${settingsData.settings?.feature_flags?.text_translation}`);
      console.log(`   Seeded pricing rate per min (EUR): ${settingsData.settings?.pricing?.s2st_rate_per_min_eur}`);
    }

    console.log('\n🎉 Integration check complete.');
  } catch (err) {
    console.error('❌ Test run encountered unhandled error:', err);
  }
}

runTests();
