import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function inspectFirstLead() {
    console.log('--- Inspecting Leads Table Data ---');
    const { data, error } = await supabase
        .from('leads')
        .select('*')
        .ilike('business_name', '%Vaal Clean%')
        .ilike('business_name', '%Vaal Clean%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('No leads found.');
        return;
    }

    const lead = data[0];
    console.log('Sample Lead Data Keys:', Object.keys(lead));
    console.log('Address Field:', lead.address);
    console.log('Location Field:', lead.location);
    console.log('City Field:', lead.city);
    console.log('Full Object:', JSON.stringify(lead, null, 2));
}

inspectFirstLead();
