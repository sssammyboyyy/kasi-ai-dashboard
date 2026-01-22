
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envContent = fs.readFileSync('.env.local', 'utf8');
const envConfig: any = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envConfig[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
});

const supabase = createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyUsersTable() {
    console.log('🔍 Verifying "users" table...');

    const testEmail = `test.verifier.${Date.now()}@kasi.ai`;

    // 1. Try Insert
    const { data, error } = await supabase
        .from('users')
        .insert({
            email: testEmail,
            phone: '1234567890',
            business_name: 'Verification Corp',
            status: 'test_record'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Table Check Failed:', error.message);
        if (error.code === '42P01') console.error('   (Hint: Table "users" does not exist yet.)');
    } else {
        console.log('✅ Table "users" exists and is writable.');
        console.log('   Inserted ID:', data.id);

        // 2. Cleanup
        await supabase.from('users').delete().eq('id', data.id);
        console.log('   Cleaned up test record.');
    }
}

verifyUsersTable();
