/**
 * Insert Test Lead Script
 * bypassing SQL Editor for speed
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function insertTest() {
    const { error } = await supabase
        .from('leads')
        .insert({
            business_name: 'Antigravity Test Corp',
            email: 'antigravity_test@example.com', // Dummy email, user should replace with real one or check logs
            score: 95,
            status: 'new',
            address: 'Test City'
        });

    if (error) console.error('❌ Insert Failed:', error.message);
    else console.log('✅ Test Lead Inserted: Antigravity Test Corp');
}

insertTest();
