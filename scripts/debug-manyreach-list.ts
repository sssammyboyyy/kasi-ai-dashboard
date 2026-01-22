/**
 * Debug: Fetch prospects in the specific list
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.MANYREACH_API_KEY;
const LIST_ID = process.env.MANYREACH_LIST_ID;
// Correct endpoint for fetching prospects in a list might be /api/v2/prospects?mailingListId=...
// or /api/v2/mailing-lists/{id}/prospects
// Let's try to filter prospects by listId if possible, or just list all prospects and checks.

if (!API_KEY || !LIST_ID) {
    console.error('❌ Keys missing');
    process.exit(1);
}

// Docs (from memory of standard V2): GET /api/v2/prospects usually allows filtering.
// Let's try fetching all prospects and see if they have listIds.

async function checkList() {
    console.log(`🔍 Inspecting List ID: ${LIST_ID}...`);

    // Try endpoint: /api/v2/prospects?baseListId={ID} (Guessing filter)
    // Or just all prospects
    const url = 'https://api.manyreach.com/api/v2/prospects?limit=20';

    try {
        const res = await fetch(url, {
            headers: { 'X-API-Key': API_KEY }
        });

        if (res.ok) {
            const data = await res.json();
            console.log(`\n📋 Recent Prospects (Total: ${data.totalItems || '?'})`);

            // Log first few to see structure
            const prospects = data.items || data.prospects || [];
            if (prospects.length === 0) {
                console.log('   (No prospects found in account)');
            }

            prospects.forEach((p: any) => {
                console.log(`   - ${p.email} (ListIDs: ${p.listIds || p.mailingLists || p.baseListId})`);
            });

        } else {
            console.log(`❌ Failed: ${res.status} ${res.statusText}`);
            console.log(await res.text());
        }

    } catch (e: any) {
        console.error('Error:', e.message);
    }
}

checkList();
