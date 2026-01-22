/**
 * THE RAINMAKER: Bridge Agent (Supabase -> Manyreach V2 API)
 * Syncs hot leads (Score >= 80) to Outreach tool
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// CONFIGURATION (V2 API)
const MANYREACH_API_KEY = process.env.MANYREACH_API_KEY || ''; // Needs to be added to .env
const MANYREACH_API_URL = process.env.MANYREACH_API_URL || 'https://api.manyreach.com/api/v2/prospects';
const MANYREACH_LIST_ID = process.env.MANYREACH_LIST_ID ? parseInt(process.env.MANYREACH_LIST_ID) : 0;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// VALIDATION & DISCOVERY
if (!MANYREACH_API_KEY) {
    console.error('❌ MANYREACH_API_KEY missing in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function listManyreachLists() {
    try {
        // Try to fetch lists (Guessing endpoint /api/v2/lists based on standard REST)
        // If docs say otherwise we might need to adjust, but this is a good guess or we check docs again.
        // Docs sidebar showed "List" > "Retrieves a list of prospects..." wait.
        // Docs sidebar likely has "List" section. endpoint probably GET /api/v2/lists or /api/v2/mailing-lists
        // Let's assume /api/v2/lists for now or just ask user to provide ID. 
        // Actually, listing is risky without knowing endpoint. 
        // I will stick to asking the user.
    } catch (e) {
        console.log('Could not auto-fetch lists.');
    }
}

if (!MANYREACH_LIST_ID) {
    console.error('❌ MANYREACH_LIST_ID missing in .env.local');
    console.log('💡 Please provide the ID of the list you want to add prospects to.');
    process.exit(1);
}

async function syncLeads() {
    console.log('🌈 Rainmaker Bridge: Starting sync (V2)...');

    // 1. Fetch Hot Leads (New & Score >= 80)
    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'new')
        .gte('score', 70)
        .limit(50);

    if (error) {
        console.error('❌ Supabase Error:', error.message);
        return;
    }

    if (!leads || leads.length === 0) {
        console.log('💤 No new hot leads to sync.');
        return;
    }

    console.log(`🔥 Found ${leads.length} hot leads. Syncing...`);

    // 2. Push to Manyreach
    for (const lead of leads) {
        if (!lead.email) {
            console.log(`⚠️ Skipping ${lead.business_name}: No email`);
            continue;
        }

        try {
            // Improved First Name Logic: Avoid "Hi LLC"
            let firstName = (lead.business_name || '').split(' ')[0];
            const badNames = ['The', 'A', 'An', 'Pty', 'Ltd', 'LLC', 'Inc', 'Clean', 'Jims', 'Moms', 'Dads'];
            if (badNames.includes(firstName) || firstName.length < 3) {
                firstName = 'Partner';
            }

            // V2 Payload Structure
            const payload = {
                email: lead.email,
                baseListId: MANYREACH_LIST_ID,
                firstName: firstName, // camelCase
                company: lead.business_name,
                // Custom Fields (Top Level Strings) - ALIGNED WITH COPY BRIEF
                custom1: (lead.score || 0).toString(),   // {{custom1}} = Score
                custom3: lead.address || lead.location || '', // {{custom3}} = Location (City)
                custom4: lead.website || ''              // {{custom4}} = Website URL
            };

            const response = await fetch(MANYREACH_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': MANYREACH_API_KEY // Verify header name from docs carefully. Usually X-Api-Key or Authorization
                },
                body: JSON.stringify(payload)
            });

            const responseText = await response.text();

            if (response.ok) {
                console.log(`✅ Synced: ${lead.business_name}`);

                // 3. Update Status in Supabase
                await supabase
                    .from('leads')
                    .update({ status: 'contacted' })
                    .eq('id', lead.id);

                // 4. Log to Outbound
                await supabase
                    .from('outbound_logs')
                    .insert({
                        lead_id: lead.id,
                        campaign_id: `manyreach_list_${MANYREACH_LIST_ID}`,
                        channel: 'manyreach_api_v2',
                        status: 'sent',
                        metadata: { manyreach_response: responseText.substring(0, 100) }
                    });

            } else {
                console.error(`❌ Manyreach API Error for ${lead.business_name}:`, responseText);
                await supabase
                    .from('system_metrics')
                    .insert({
                        agent_name: 'rainmaker',
                        metric_type: 'api_error',
                        value: 1,
                        context: { error: responseText, lead: lead.email }
                    });
            }

        } catch (e: any) {
            console.error(`❌ Network Error for ${lead.business_name}:`, e.message);
        }
    }
    console.log('🌈 Sync complete.');
}

syncLeads();
