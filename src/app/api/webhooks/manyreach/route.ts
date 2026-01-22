/**
 * Manyreach Reply Webhook Handler
 * Closes the loop: Updates Supabase when a lead replies.
 */
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const payload = await request.json();

        // Validation (Basic)
        if (!payload.email) {
            return NextResponse.json({ message: 'Ignored: No email' }, { status: 200 });
        }

        const eventType = payload.event_type || payload.type; // Adjust based on actual payload
        // If it's not a reply, ignore (or log)
        // Manyreach payload usually has 'type': 'reply_received' or similar

        // Supabase Admin Client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        console.log(`🚨 Manyreach Webhook: ${payload.email} [${eventType}]`);

        // Update Lead Status
        const { error } = await supabase
            .from('leads')
            .update({
                status: 'replied',
                engagement_score: 100
            })
            .eq('email', payload.email);

        if (error) {
            console.error('Supabase Update Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Send Discord Notification (via Webhook URL in env or hardcoded/helper)
        // We'll use a simple fetch to the configured Discord Webhook if available
        const discordWebhook = process.env.DISCORD_AUDITOR_WEBHOOK_URL;
        if (discordWebhook) {
            await fetch(discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: `🚨 **REPLY DETECTED!**\n**Lead:** ${payload.email}\n**Status:** Moved to 'replied'\n**Score:** 100 🚀\nCheck Manyreach!`
                })
            });
        }

        return NextResponse.json({ success: true, message: 'Lead updated' });

    } catch (e: any) {
        console.error('Webhook Error:', e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
