/**
 * 🕵️ DEBUG: CONTACTED LEADS
 * Checks who is marked as 'contacted' and why.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkContacted() {
    console.log("🕵️ Checking 'contacted' leads...");

    const { data: leads, error } = await supabase
        .from('leads')
        .select('business_name, email, status, created_at, metadata')
        .eq('status', 'contacted');

    if (error) {
        console.error("❌ Error:", error.message);
        return;
    }

    console.log(`📊 Found ${leads.length} leads with status='contacted'.`);
    if (leads.length > 0) {
        console.log("Example:", leads[0]);
    }
}

checkContacted();
