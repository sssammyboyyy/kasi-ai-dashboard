/**
 * Create a new Manyreach List
 */
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.MANYREACH_API_KEY;
const BASE_URL = 'https://api.manyreach.com/api/v2/lists'; // Correct endpoint based on GET success

if (!API_KEY) {
    console.error('❌ API Key missing');
    process.exit(1);
}

async function createList() {
    console.log('✨ Creating new list: "Kasi AI Hot Leads"...');

    try {
        const res = await fetch(BASE_URL, {
            method: 'POST',
            headers: {
                'X-API-Key': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: 'Kasi AI Hot Leads' })
        });

        const text = await res.text();

        if (res.ok) {
            console.log(`\n✅ SUCCESS: List Created!`);
            console.log(text);
        } else {
            console.log(`❌ Failed: ${res.status} ${res.statusText}`);
            console.log(text);
        }
    } catch (e) {
        console.error(`Error:`, e.message);
    }
}

createList();
