// Supabase Edge Function: Process Lead
// Receives webhook from Apify, validates, enriches, and stores lead

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
    business_name: string;
    contact_name?: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    source: string;
    raw_data?: Record<string, unknown>;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const payload: LeadPayload = await req.json();

        // Validate required fields
        if (!payload.business_name) {
            return new Response(
                JSON.stringify({ error: "business_name is required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Calculate lead score (basic scoring)
        let score = 50; // Base score
        if (payload.phone) score += 20;
        if (payload.email) score += 15;
        if (payload.contact_name) score += 10;
        if (payload.address) score += 5;

        // Insert lead into database
        const { data: lead, error: insertError } = await supabase
            .from("leads")
            .insert({
                business_name: payload.business_name,
                contact_name: payload.contact_name,
                phone: payload.phone,
                email: payload.email,
                address: payload.address,
                website: payload.website,
                source: payload.source || "api",
                score: score,
                status: "new",
                raw_data: payload.raw_data,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError) {
            console.error("Insert error:", insertError);
            return new Response(
                JSON.stringify({ error: insertError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Trigger WhatsApp notification (async, don't wait)
        if (lead && payload.phone) {
            const notifyUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`;
            fetch(notifyUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                },
                body: JSON.stringify({
                    lead_id: lead.id,
                    phone: payload.phone,
                    business_name: payload.business_name,
                }),
            }).catch(console.error);
        }

        return new Response(
            JSON.stringify({
                success: true,
                lead_id: lead?.id,
                score: score,
                message: "Lead processed successfully"
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error processing lead:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
