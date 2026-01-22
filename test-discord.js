/**
 * Quick Discord test - no dependencies
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463575352679858176/MV8tXUL8o8ppC8oojeP95y2Ulwk4kE2fuzToqcUWzJ_dZeq5IrxjUp9p2N73YLsajyRZ';

async function test() {
    console.log('Sending test message to Discord...');

    const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: '🤖 **Kasi AI Auditor is online!** Connection test successful.',
            embeds: [{
                title: '🔥 HOT LEAD ALERT (Test)',
                color: 0xff4500,
                fields: [
                    { name: '🏢 Business', value: 'Test Company', inline: true },
                    { name: '📊 Score', value: '85/100', inline: true },
                    { name: '📧 Email', value: 'test@example.com', inline: true },
                ],
                footer: { text: 'This is a test message' },
                timestamp: new Date().toISOString(),
            }]
        }),
    });

    if (response.ok) {
        console.log('✅ Message sent! Check your Discord.');
    } else {
        console.log('❌ Failed:', response.status, await response.text());
    }
}

test();
