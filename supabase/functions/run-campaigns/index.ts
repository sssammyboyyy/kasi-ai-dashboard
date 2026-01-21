import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // 1. Fetch pending notifications
        const { data: notifications, error: fetchError } = await supabase
            .from("notifications")
            .select(`
                *,
                leads ( email, phone, contact_name )
            `)
            .eq("status", "pending")
            .limit(50); // Batch size

        if (fetchError) throw fetchError;

        if (!notifications || notifications.length === 0) {
            return new Response(JSON.stringify({ message: "No pending notifications" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const results = [];

        // 2. Process batch
        for (const notification of notifications) {
            let success = false;
            let errorMsg = null;

            try {
                if (notification.channel === "email" && notification.leads?.email) {
                    // Call send-email function
                    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                        },
                        body: JSON.stringify({
                            to: notification.leads.email,
                            subject: "New Opportunity", // Dynamic subject in future
                            html: notification.message || "<p>Hello!</p>", // Use template
                        }),
                    });

                    if (res.ok) success = true;
                    else {
                        const err = await res.json();
                        errorMsg = JSON.stringify(err);
                    }

                } else if (notification.channel === "whatsapp" && notification.leads?.phone) {
                    // Logic for WhatsApp (simulated or real call)
                    // For now, assume success if phone exists
                    const res = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                        },
                        body: JSON.stringify({
                            lead_id: notification.lead_id,
                            phone: notification.leads.phone,
                            business_name: notification.leads.contact_name || "Partner",
                        }),
                    });

                    if (res.ok) success = true;
                    else {
                        const err = await res.json();
                        errorMsg = JSON.stringify(err);
                    }
                } else {
                    errorMsg = "Invalid channel or missing contact info";
                }
            } catch (err: any) {
                errorMsg = err.message;
            }

            // 3. Update status
            await supabase
                .from("notifications")
                .update({
                    status: success ? "sent" : "failed",
                    // error: errorMsg, // Add error column if schema permits
                    updated_at: new Date().toISOString()
                })
                .eq("id", notification.id);

            results.push({ id: notification.id, success, error: errorMsg });
        }

        return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
