/**
 * Fix Distribution role description
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463575352679858176/MV8tXUL8o8ppC8oojeP95y2Ulwk4kE2fuzToqcUWzJ_dZeq5IrxjUp9p2N73YLsajyRZ';

async function fix() {
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: '',
            embeds: [{
                title: '📋 Team Roles (Updated)',
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
                        name: '📱 Distribution (Organic Social)',
                        value: '• Post content across social platforms\n• Engage with comments & DMs\n• Track what\'s working, double down',
                        inline: false
                    },
                ],
                footer: { text: 'Questions? Ask Sam.' },
            }]
        }),
    });
    console.log('✅ Updated roles sent!');
}

fix();
