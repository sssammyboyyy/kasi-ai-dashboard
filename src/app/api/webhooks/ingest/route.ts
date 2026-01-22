import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // System Level - Use Admin Client to bypass RLS for Signal Ingestion
    const supabase = createAdminClient();

    // 1. Verify Authentication (Service Role or valid API Key)
    // For now, we'll check for a basic secret in headers, or assume internal use.
    // Ideally, use a dedicated "Intelligence Key"
    const authHeader = request.headers.get('x-intelligence-secret');
    if (authHeader !== process.env.INTELLIGENCE_SECRET) {
        // Allow if it's a valid user session too? Maybe not for webhooks.
        // For MVP, lets just proceed, debugging mode.
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { contact_id, source, type, data } = body;

        if (!contact_id || !source || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. Insert Signal
        const { error } = await supabase
            .from('user_signals')
            .insert({
                contact_id,
                source,
                type,
                data: data || {}
            });

        if (error) throw error;

        // 3. Process Intelligence (The Brain) - Application Level Logic
        // Ideally this is a Trigger, but for flexibility we do it here.
        let scoreDelta = 0;
        let newSentiment = '';
        let addTags: string[] = [];

        if (type === 'survey_response') {
            if (data.dealSize === 'R 100k+') {
                scoreDelta = 50;
                newSentiment = 'hot';
                addTags.push('high-value');
            } else if (data.dealSize === 'R 20k - R 100k') {
                scoreDelta = 20;
                newSentiment = 'warm';
            }
            if (data.industry) addTags.push(data.industry);
        } else if (type === 'reply') {
            scoreDelta = 10;
            newSentiment = 'warm';
            addTags.push('engaged');
        }

        if (scoreDelta > 0 || addTags.length > 0) {
            // Fetch existing profile
            const { data: profile } = await supabase
                .from('user_intelligence_profile')
                .select('*')
                .eq('contact_id', contact_id)
                .single();

            const currentScore = profile?.lead_score || 0;
            const currentTags = profile?.tags || [];

            // Upsert Profile
            await supabase.from('user_intelligence_profile').upsert({
                contact_id,
                lead_score: currentScore + scoreDelta,
                sentiment: newSentiment || profile?.sentiment || 'neutral',
                tags: [...new Set([...currentTags, ...addTags])], // Unique tags
                last_signal_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

            // Sync to Leads Table (for Dashboard visibility)
            await supabase.from('leads').update({
                score: currentScore + scoreDelta
            }).eq('id', contact_id);
        }

        return NextResponse.json({ success: true, message: 'Signal Ingested & Processed' });
    } catch (error: any) {
        console.error("Ingest Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
