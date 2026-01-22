/**
 * Setup Discord for Team
 * Sends welcome messages and channel info
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463575352679858176/MV8tXUL8o8ppC8oojeP95y2Ulwk4kE2fuzToqcUWzJ_dZeq5IrxjUp9p2N73YLsajyRZ';

async function sendDiscord(content, embeds) {
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, embeds }),
    });
}

async function setup() {
    // Welcome message
    await sendDiscord('', [{
        title: '👋 Welcome to Kasi AI HQ',
        color: 0x5865f2,
        description: `**The Sovereign Code Monolith**

This is our command center. Here's what happens here:

🔥 **Hot Lead Alerts** — Get pinged when high-value leads come in
📊 **Daily Digests** — Morning summaries of leads, tasks, and metrics
📋 **Asana Sync** — Task updates from Asana appear here
🚨 **System Alerts** — Know when something needs attention

*The machine runs 24/7. Let's get to work.*`,
        footer: { text: 'Powered by Kasi AI' },
        timestamp: new Date().toISOString(),
    }]);

    console.log('✅ Welcome message sent');

    // Wait a bit between messages
    await new Promise(r => setTimeout(r, 1000));

    // Team roles guide
    await sendDiscord('', [{
        title: '📋 Team Roles & Expectations',
        color: 0x00ff88,
        fields: [
            {
                name: '🎯 Sales Team',
                value: '• Respond to hot leads within 24 hours\n• Update lead status in dashboard\n• Report wins in chat',
                inline: false
            },
            {
                name: '🎬 UGC/Content',
                value: '• Create content from successful case studies\n• Track which content drives leads\n• Share wins here',
                inline: false
            },
            {
                name: '📦 Distribution',
                value: '• Coordinate deliveries\n• Flag logistics issues\n• Keep customers happy',
                inline: false
            },
        ],
        footer: { text: 'Questions? Ask Sam.' },
    }]);

    console.log('✅ Roles message sent');

    await new Promise(r => setTimeout(r, 1000));

    // Quick links
    await sendDiscord('', [{
        title: '🔗 Quick Links',
        color: 0xffa500,
        fields: [
            { name: '📊 Dashboard', value: '[Open Dashboard](https://kasi-ai.vercel.app/dashboard)', inline: true },
            { name: '📋 Asana', value: '[Open Asana](https://app.asana.com)', inline: true },
            { name: '💬 Sam', value: '@Sam for urgent issues', inline: true },
        ],
    }]);

    console.log('✅ Quick links sent');
    console.log('\n🎉 Discord is ready for the team!');
}

setup();
