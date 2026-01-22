/**
 * Fetch Manyreach Lists to find List ID
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.MANYREACH_API_KEY;
const BASE_URL = 'https://api.manyreach.com/api/v2';

if (!API_KEY) {
    console.error('❌ API Key missing');
    process.exit(1);
}

async function fetchLists() {
    console.log('🔍 Attempting to fetch Mailing Lists...');

    // Check known potential endpoints
    const endpoints = ['/mailing-lists', '/lists', '/campaigns'];

    for (const ep of endpoints) {
        const url = `${BASE_URL}${ep}`;
        console.log(`Checking ${url}...`);
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: { 'X-API-Key': API_KEY, 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();
                console.log(`\n✅ FOUND DATA at ${ep}:`);
                console.log(JSON.stringify(data, null, 2));
                return;
            } else {
                console.log(`❌ ${ep} Failed: ${res.status} ${res.statusText}`);
            }
        } catch (e) {
            console.error(`Error fetching ${ep}:`, e.message);
        }
    }
}

fetchLists();
