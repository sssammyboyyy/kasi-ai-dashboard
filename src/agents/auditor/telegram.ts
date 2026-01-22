/**
 * src/agents/auditor/telegram.ts
 * THE AUDITOR - Telegram Bot for Proactive Notifications
 * 
 * Features:
 * - Hot Lead Alerts (score 80+)
 * - System Health Alerts
 * - Daily Summary Report
 * 
 * Setup: Replace TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID
 */

// ============ CONFIGURATION ============
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rfacczttfdbrqpyguopy.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============ TELEGRAM SENDER ============
async function sendTelegram(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        console.log('[Auditor] Message sent to Telegram');
    } catch (error) {
        console.error('[Auditor] Failed to send Telegram message:', error);
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
    const message = `🔥 *HOT LEAD ALERT*

*${lead.business_name}*
📊 Score: ${lead.score}/100
📧 Email: ${lead.email || 'N/A'}
📞 Phone: ${lead.phone || 'N/A'}
📍 Location: ${lead.address || 'N/A'}

_Act fast!_`;

    await sendTelegram(message);
}

// ============ SYSTEM HEALTH ALERT ============
export async function alertSystemHealth(agent: string, status: 'error' | 'warning' | 'recovered', details: string): Promise<void> {
    const emoji = status === 'error' ? '🚨' : status === 'warning' ? '⚠️' : '✅';
    const message = `${emoji} *SYSTEM ${status.toUpperCase()}*

Agent: \`${agent}\`
Details: ${details}
Time: ${new Date().toLocaleString('en-ZA')}`;

    await sendTelegram(message);
}

// ============ DAILY SUMMARY ============
export async function sendDailySummary(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's leads
    const { data: leads, count: totalLeads } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .gte('created_at', today.toISOString());

    const hotLeads = leads?.filter(l => l.score >= 80).length || 0;
    const withEmail = leads?.filter(l => l.email).length || 0;

    // Get errors from system_metrics (if table exists)
    let errorCount = 0;
    try {
        const { count } = await supabase
            .from('system_metrics')
            .select('*', { count: 'exact' })
            .eq('metric_type', 'error_count')
            .gte('recorded_at', today.toISOString());
        errorCount = count || 0;
    } catch { /* Table might not exist yet */ }

    const message = `📊 *DAILY SUMMARY* - ${today.toLocaleDateString('en-ZA')}

📥 *Leads Scraped:* ${totalLeads || 0}
🔥 *Hot Leads (80+):* ${hotLeads}
📧 *With Email:* ${withEmail}
❌ *Errors:* ${errorCount}

_Keep grinding! 💪_`;

    await sendTelegram(message);
}

// ============ CLI COMMANDS ============
const args = process.argv.slice(2);

if (args[0] === 'test') {
    sendTelegram('🤖 Kasi AI Auditor is online! Connection test successful.');
} else if (args[0] === 'summary') {
    sendDailySummary();
} else if (args[0] === 'hot') {
    // Test hot lead alert
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
  npx tsx src/agents/auditor/telegram.ts test     - Test connection
  npx tsx src/agents/auditor/telegram.ts summary  - Send daily summary
  npx tsx src/agents/auditor/telegram.ts hot      - Test hot lead alert
    `);
}
