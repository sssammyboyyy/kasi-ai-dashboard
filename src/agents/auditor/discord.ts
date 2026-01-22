/**
 * src/agents/auditor/discord.ts
 * THE AUDITOR - Discord Webhook for Proactive Notifications
 * 
 * Features:
 * - Hot Lead Alerts (score 80+)
 * - System Health Alerts
 * - Daily Summary Report
 * 
 * Setup: 
 * 1. In Discord: Server Settings → Integrations → Webhooks → New Webhook
 * 2. Copy the Webhook URL
 * 3. Add to .env.local: DISCORD_WEBHOOK_URL=your_url
 */

// ============ CONFIGURATION ============
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const DISCORD_WEBHOOK_URL = process.env.DISCORD_AUDITOR_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rfacczttfdbrqpyguopy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============ DISCORD SENDER ============
async function sendDiscord(content: string, embeds?: object[]): Promise<void> {
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, embeds }),
        });
        console.log('[Auditor] Message sent to Discord');
    } catch (error) {
        console.error('[Auditor] Failed to send Discord message:', error);
    }
}

// ============ HOT LEAD ALERT ============
export async function alertHotLead(lead: {
    business_name: string;
    email?: string;
    phone?: string;
    score: number;
    address?: string;
}): Promise<void> {
    const embed = {
        title: '🔥 HOT LEAD ALERT',
        color: 0xff4500, // Orange-red
        fields: [
            { name: '🏢 Business', value: lead.business_name, inline: true },
            { name: '📊 Score', value: `${lead.score}/100`, inline: true },
            { name: '📧 Email', value: lead.email || 'N/A', inline: true },
            { name: '📞 Phone', value: lead.phone || 'N/A', inline: true },
            { name: '📍 Location', value: lead.address || 'N/A', inline: true },
        ],
        footer: { text: 'Act fast! 🚀' },
        timestamp: new Date().toISOString(),
    };

    await sendDiscord('', [embed]);
}

// ============ SYSTEM HEALTH ALERT ============
export async function alertSystemHealth(agent: string, status: 'error' | 'warning' | 'recovered', details: string): Promise<void> {
    const colors = { error: 0xff0000, warning: 0xffa500, recovered: 0x00ff00 };
    const emojis = { error: '🚨', warning: '⚠️', recovered: '✅' };

    const embed = {
        title: `${emojis[status]} SYSTEM ${status.toUpperCase()}`,
        color: colors[status],
        fields: [
            { name: 'Agent', value: `\`${agent}\``, inline: true },
            { name: 'Details', value: details, inline: false },
        ],
        timestamp: new Date().toISOString(),
    };

    await sendDiscord('', [embed]);
}

// ============ DAILY SUMMARY ============
export async function sendDailySummary(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: leads, count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString());

    const hotLeads = leads?.filter(l => l.score >= 80).length || 0;
    const withEmail = leads?.filter(l => l.email).length || 0;

    let errorCount = 0;
    try {
        const { count } = await supabase
            .from('system_metrics')
            .select('*', { count: 'exact' })
            .eq('metric_type', 'error_count')
            .gte('recorded_at', today.toISOString());
        errorCount = count || 0;
    } catch { /* Table might not exist yet */ }

    const embed = {
        title: '📊 DAILY SUMMARY',
        color: 0x5865f2, // Discord blurple
        fields: [
            { name: '📥 Leads Scraped', value: `${totalLeads || 0}`, inline: true },
            { name: '🔥 Hot Leads (80+)', value: `${hotLeads}`, inline: true },
            { name: '📧 With Email', value: `${withEmail}`, inline: true },
            { name: '❌ Errors', value: `${errorCount}`, inline: true },
        ],
        footer: { text: 'Keep grinding! 💪' },
        timestamp: new Date().toISOString(),
    };

    await sendDiscord('', [embed]);
}

// ============ CLI COMMANDS ============
const args = process.argv.slice(2);

if (args[0] === 'test') {
    sendDiscord('🤖 **Kasi AI Auditor is online!** Connection test successful.');
} else if (args[0] === 'summary') {
    sendDailySummary();
} else if (args[0] === 'hot') {
    alertHotLead({
        business_name: 'Test Company',
        email: 'test@example.com',
        phone: '0821234567',
        score: 85,
        address: 'Johannesburg',
    });
} else {
    console.log(`
Usage:
  npx tsx src/agents/auditor/discord.ts test     - Test connection
  npx tsx src/agents/auditor/discord.ts summary  - Send daily summary
  npx tsx src/agents/auditor/discord.ts hot      - Test hot lead alert
    `);
}
