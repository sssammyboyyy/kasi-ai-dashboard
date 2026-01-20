
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfacczttfdbrqpyguopy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYWNjenR0ZmRicnFweWd1b3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTg2OTQsImV4cCI6MjA4MDQzNDY5NH0.xbPkq7qYhd-zQ4Xju8ySp5PooLz__Gq2vlmfACwXiFw';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function pushToSupabase(leads) {
    if (!leads || leads.length === 0) return;

    console.log(`\n🗄️ Pushing ${leads.length} leads to Supabase...`);

    // Map scraper results to Supabase 'prospects' table schema
    const formattedLeads = leads.map(lead => ({
        business_name: lead.title || lead.name,
        address: lead.address,
        city: lead.city,
        state: lead.state,
        country: lead.country || 'South Africa',
        postal_code: lead.postalCode,
        phone: lead.phone,
        website: lead.website,
        google_maps_url: lead.url,
        rating: lead.totalScore,
        review_count: lead.reviewsCount,
        category: lead.categoryName,
        email: lead.email,
        email_verified: lead.emailVerified || false,
        email_source: lead.emailSource, // e.g., 'website', 'facebook'
        decision_maker_name: lead.decisionMaker?.name,
        decision_maker_title: lead.decisionMaker?.title,
        decision_maker_linkedin: lead.decisionMaker?.linkedin,
        score: Math.round(lead.score || 0),
        score_breakdown: {
            ...lead.scoreBreakdown,
            extra_emails: lead.allEmailsFound || []
        },
        social_links: lead.socials || {},
        status: 'raw', // Default status
        source: 'google_maps',
        scraped_at: new Date().toISOString()
    }));

    try {
        const { data, error } = await supabase
            .from('prospects')
            .upsert(formattedLeads, { onConflict: 'website' }); // Use website as unique key if possible, or google_maps_url?

        if (error) {
            console.error('   ❌ Supabase Error:', error.message);
        } else {
            console.log(`   ✅ Successfully saved to Supabase`);
        }
    } catch (err) {
        console.error('   💀 Supabase Connection Failed:', err.message);
    }
}
