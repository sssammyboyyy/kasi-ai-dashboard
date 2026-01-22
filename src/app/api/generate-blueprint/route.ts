import { createClient } from "@/utils/supabase/server";
import { Resend } from 'resend';

export async function POST(request: Request) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const body = await request.json();
        const {
            target_locations, google_maps_query, lead_scoring_criteria,
            pain_point, magical_outcome, lost_revenue, value_prop,
            call_to_action, sender_name, case_study,
            client_email
        } = body;

        // 1. Save Diagnosis to Supabase (so we have a record)
        const supabase = await createClient();
        const { error: dbError } = await supabase.from('leads').insert({
            business_name: "Diagnosis Pending", // Placeholder or from another input
            email: client_email,
            status: 'contacted',
            score: 85, // High score because they are engaged
            metadata: { type: 'sovereign_blueprint', ...body }
        });

        if (dbError) {
            console.error("DB Error:", dbError);
            // Continue sending email even if DB fails
        }

        // 2. Generate The Sovereign Blueprint (Email Content)
        // In a real PDF implementation, we would generate a Buffer here.
        // For now, we create a high-fidelity HTML Email Asset.

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">The Sovereign Blueprint</h1>
                <p>Prepared for: <strong>${client_email}</strong></p>
                <p>Prepared by: <strong>${sender_name}</strong></p>
                
                <p>Based on our diagnosis, here is your customized plan to recover <strong>${lost_revenue}</strong> in lost revenue.</p>

                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="color: #111; margin-top: 0;">1. The Kill Zone strategy</h2>
                    <p>We will deploy our Swarm Scraper to target <strong>${google_maps_query}</strong> in <strong>${target_locations}</strong>.</p>
                    <p><strong>Victory Condition:</strong> Identifying high-value "${lead_scoring_criteria}" targets.</p>
                </div>

                <div style="background-color: #FFF1F2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #E11D48;">
                    <h2 style="color: #9F1239; margin-top: 0;">2. Eliminating the Pain</h2>
                    <p>You mentioned that <strong>"${pain_point}"</strong> steals your time.</p>
                    <p>Our system is designed to automate this entirely, so you can achieve the outcome of <strong>"${magical_outcome}"</strong>.</p>
                </div>

                <div style="background-color: #ECFDF5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 5px solid #059669;">
                    <h2 style="color: #065F46; margin-top: 0;">3. The Outreach Advantage</h2>
                    <p>We will engage these leads using your unfair advantage: <strong>${value_prop}</strong>.</p>
                    <p><strong>Proof Point:</strong> We will leverage the success of the ${case_study} project to build trust instantly.</p>
                </div>

                <div style="text-align: center; margin-top: 40px;">
                    <a href="https://kasi-ai-dashboard.vercel.app" style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Access Your 25 Free Leads
                    </a>
                    <p style="font-size: 12px; color: #888; margin-top: 10px;">(Demo Link Active for 24 Hours)</p>
                </div>
            </div>
        `;

        // 3. Send via Resend
        const data = await resend.emails.send({
            from: 'Kasi OS <onboarding@resend.dev>', // Update with verified domain if available
            to: client_email,
            subject: `Your Sovereign Blueprint & 25 Leads`,
            html: emailHtml,
        });

        return new Response(JSON.stringify({ success: true, data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
