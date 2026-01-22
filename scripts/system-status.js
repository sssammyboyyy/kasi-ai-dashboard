/**
 * Kasi AI System Status Check
 * Verifies DB connection, row counts, and schema columns
 */

import { createClient } from '@supabase/supabase-js';


import fs from 'fs';
import path from 'path';

// Load env from .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envConfig = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, '');
        envConfig[key] = value;
    }
});

const SUPABASE_URL = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSystem() {
    console.log('\n🔍 KASI AI SYSTEM DIAGNOSTIC\n===========================');

    // 1. Check Database Capability
    try {
        const { count, error } = await supabase.from('leads').select('*', { count: 'exact', head: true });
        if (error) throw error;
        console.log(`✅ Database Connection: ACTIVE`);
        console.log(`📊 Total Leads: ${count}`);
    } catch (e) {
        console.log(`❌ Database Error: ${e.message}`);
    }

    // 2. Check Flywheel Cols (Schema Verification)
    try {
        // Try to insert a dummy row with new columns to test schema
        // We won't actually commit it, just testing the shape or select
        const { data, error } = await supabase
            .from('leads')
            .select('engagement_score, deal_value_zar')
            .limit(1);

        if (error) {
            console.log(`⚠️ Master Schema: PENDING (Columns likely missing: ${error.message})`);
        } else {
            console.log(`✅ Master Schema: APPLIED (Flywheel columns detected)`);
        }
    } catch (e) {
        console.log(`⚠️ Schema Check Error: ${e.message}`);
    }

    // 3. Check Local Files (The Swarm Output)
    const leadGenPath = path.join('..', 'lead-gen-suite');
    let jsonFiles = [];
    let csvFiles = [];

    try {
        const files = fs.readdirSync(leadGenPath);
        jsonFiles = files.filter(f => f.endsWith('.json') && f.startsWith('leads_'));
        csvFiles = files.filter(f => f.endsWith('.csv') && f.startsWith('manyreach_'));
    } catch (e) {
        console.log(`⚠️ Lead Gen Suite Path Error: ${e.message}`);
    }

    console.log(`\n📂 Local Assets (The Swarm):`);
    console.log(`   • JSON Backups: ${jsonFiles.length} files`);
    console.log(`   • CSV Exports: ${csvFiles.length} files (Ready for Manyreach)`);

    // 4. API Keys Security Check
    const discordTs = fs.readFileSync('src/agents/auditor/discord.ts', 'utf8');
    const secured = discordTs.includes('process.env.DISCORD');
    console.log(`\n🔒 Security Check:`);
    console.log(`   • Agents: ${secured ? 'SECURED' : '⚠️ UNSECURED'}`);

    console.log('\n===========================\n');
}

checkSystem();
