/**
 * 🕵️ DASHBOARD ACCESS VERIFIER
 * Simulates a browser request (using ANON key) to check if we can see the leads.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

async function verifyDashboardAccess() {
    console.log("🕵️ TESTING DASHBOARD READ ACCESS...");
    console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);

    // 1. Create CLIENT (Anon Key) - Simulating the Browser
    const browserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 2. Create ADMIN (Service Role) - Comparison
    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test Admin (Control Group)
    const { count: adminCount, error: adminError } = await adminClient
        .from('leads')
        .select('*', { count: 'exact', head: true });

    if (adminError) {
        console.error("❌ ADMIN CHECK FAILED:", adminError.message);
        return;
    }
    console.log(`✅ Admin (Service Role) sees: ${adminCount} leads`);

    // Test Browser (Experimental Group)
    const { count: browserCount, error: browserError } = await browserClient
        .from('leads')
        .select('*', { count: 'exact', head: true });

    if (browserError) {
        console.error("❌ BROWSER CHECK ERROR:", browserError.message);
    } else {
        console.log(`👀 Browser (Anon Key) sees: ${browserCount} leads`);
    }

    if (browserCount === 0 && adminCount! > 0) {
        console.log("\n🚨 DIAGNOSIS: RLS BLOCKING ACCESS");
        console.log("   The database has leads, but the dashboard cannot see them.");
        console.log("   You need to add a ROW LEVEL SECURITY policy.");
    } else if (browserCount === adminCount) {
        console.log("\n✅ DIAGNOSIS: ACCESS OK. Issue might be in React code/State.");
    }
}

verifyDashboardAccess();
