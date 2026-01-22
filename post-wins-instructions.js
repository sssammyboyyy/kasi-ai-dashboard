/**
 * Post simplified team instructions to wins-showcase
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463586356507836521/q8CqzFhuo7c-sWggXI7K32JTTgBNJi6lxWiyB1vKI5xT4vbvO81xRpJajt96aDFIlYus';

async function postInstructions() {
    const embed = {
        title: '🏆 How to Share Your Wins',
        color: 0xffd700,
        description: `**Closed a deal? Post it here!**

Just type a message in this format:`,
        fields: [
            {
                name: '📝 Format',
                value: '**WIN:** [Company Name] - R[Amount]\n\nExample:\n**WIN:** ABC Cleaning - R25,000',
                inline: false
            },
            {
                name: '✨ What Happens',
                value: '• Your win gets tracked\n• Team celebrates with you\n• Leaderboard updates weekly',
                inline: false
            },
        ],
        footer: { text: 'Every win counts! Let\'s see those numbers 🔥' },
    };

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
    });

    console.log('✅ Team instructions posted!');
}

postInstructions();
