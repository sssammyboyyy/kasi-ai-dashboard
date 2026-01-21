import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ✨ GOD-TIER PROMPT (The "Product")
const SYSTEM_PROMPT = `
ROLE: senior_sales_dev_safrica
CONTEXT: B2B Lead Generation for "Kasi AI" (platform connecting businesses to verified leads).
MARKET: South Africa (tier 1 & 2 cities).
TONE: Professional, succinct, value-driven. No corporate fluff.
GOAL: Book a meeting or get a trial signup.

INSTRUCTION:
Write a cold email to {lead_name} at {company_name}.
- Highlight that we have verified leads in their industry ({industry}).
- Mention "exclusive access" or "first 25 leads free".
- Keep it under 100 words.
- Sign off as "Kasi AI Growth Team".
`;

serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { lead_name, company_name, industry } = await req.json();

        // 1. Check for API Key (Real AI)
        const openAiKey = Deno.env.get("OPENAI_API_KEY");

        let generatedCopy = "";

        if (openAiKey) {
            // Real AI Call
            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openAiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: `Generate email for: ${lead_name}, ${company_name}, ${industry}` }
                    ]
                })
            });
            const data = await res.json();
            generatedCopy = data.choices[0]?.message?.content || "Error generating copy.";
        } else {
            // 2. Fallback / Mock Mode (Ruthless Efficiency when no key)
            // Simulating a "Good" response based on the prompt
            console.log("No OPENAI_API_KEY found. Using Mock AI response.");
            generatedCopy = `
Subject: Verified leads for ${company_name} in ${industry || "your sector"}

Hi ${lead_name},

I saw ${company_name} is growing in the ${industry || "local"} space.

We've verified 25 high-intent leads specifically for businesses like yours. 
They are ready to buy, not just browse.

Want to see the list? It's free to look.

Best,
Kasi AI Growth Team
(Sent via Kasi AI Intelligence Layer)
      `;
        }

        return new Response(JSON.stringify({ copy: generatedCopy, method: openAiKey ? "ai" : "mock" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
