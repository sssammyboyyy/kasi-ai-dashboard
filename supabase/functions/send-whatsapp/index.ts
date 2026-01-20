// Supabase Edge Function: Send WhatsApp
// Sends lead notification via WhatsApp Business API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppPayload {
    lead_id: string;
    phone: string;
    business_name: string;
    recipient_phone?: string; // Customer's phone to notify
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const payload: WhatsAppPayload = await req.json();

        // Get WhatsApp Business API credentials
        const whatsappToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
        const whatsappPhoneId = Deno.env.get("WHATSAPP_PHONE_ID");
        const customerPhone = payload.recipient_phone || Deno.env.get("DEFAULT_CUSTOMER_PHONE");

        if (!whatsappToken || !whatsappPhoneId || !customerPhone) {
            console.log("WhatsApp not configured, logging notification instead");

            // Log to notifications table
            await supabase.from("notifications").insert({
                lead_id: payload.lead_id,
                channel: "whatsapp",
                status: "pending",
                message: `New lead: ${payload.business_name}`,
                created_at: new Date().toISOString(),
            });

            return new Response(
                JSON.stringify({ success: true, message: "Notification logged (WhatsApp not configured)" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Build WhatsApp message
        const message = `🎉 *New Lead Alert!*

📍 *Business:* ${payload.business_name}
📞 *Phone:* ${payload.phone}

Tap below to contact them now!`;

        // Send via WhatsApp Business API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${whatsappToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: customerPhone.replace(/[^0-9]/g, ""),
                    type: "text",
                    text: { body: message },
                }),
            }
        );

        const result = await response.json();

        // Log notification
        await supabase.from("notifications").insert({
            lead_id: payload.lead_id,
            channel: "whatsapp",
            status: response.ok ? "sent" : "failed",
            message: message,
            response_data: result,
            created_at: new Date().toISOString(),
        });

        // Update lead status
        await supabase
            .from("leads")
            .update({ notified_at: new Date().toISOString() })
            .eq("id", payload.lead_id);

        return new Response(
            JSON.stringify({
                success: response.ok,
                message_id: result.messages?.[0]?.id,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("WhatsApp error:", error);
        return new Response(
            JSON.stringify({ error: "Failed to send WhatsApp" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
