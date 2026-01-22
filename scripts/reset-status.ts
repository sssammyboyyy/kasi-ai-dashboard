/**
 * 🛠️ RESET STATUS
 * Resets all 'contacted' leads back to 'new' to fix dashboard count.
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

async function resetStatus() {
    console.log("🛠️ Resetting all leads to 'new'...");

    const { count, error } = await supabase
        .from('leads')
        .update({ status: 'new' })
        .eq('status', 'contacted')
        .select();

    if (error) {
        console.error("❌ Error:", error.message);
    } else {
        console.log(`✅ Reset ${count} leads back to 'new'.`);
    }
}

resetStatus();
