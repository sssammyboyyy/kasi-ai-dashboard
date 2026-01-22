/**
 * src/agents/auditor/wins.ts
 * Team Wins Tracker - Posts wins to Discord and tracks revenue
 * 
 * Usage from dashboard or CLI:
 *   npx tsx src/agents/auditor/wins.ts post "Company Name" "15000" "Sam"
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WINS_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL || '';

interface Win {
    company: string;
    amount: number;
    closedBy: string;
    timestamp: Date;
}

// Store wins in memory (could be moved to Supabase later)
const wins: Win[] = [];

async function postWin(company: string, amount: number, closedBy: string): Promise<void> {
    const win: Win = {
        company,
        amount,
        closedBy,
        timestamp: new Date(),
    };
    wins.push(win);

    // Calculate totals
    const totalRevenue = wins.reduce((sum, w) => sum + w.amount, 0);
    const weeklyWins = wins.filter(w => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return w.timestamp > weekAgo;
    });
    const weeklyRevenue = weeklyWins.reduce((sum, w) => sum + w.amount, 0);

    const embed = {
        title: '🎉 DEAL CLOSED!',
        color: 0x00ff88,
        fields: [
            { name: '🏢 Company', value: company, inline: true },
            { name: '💰 Amount', value: `R${amount.toLocaleString()}`, inline: true },
            { name: '👤 Closed By', value: closedBy, inline: true },
            { name: '📈 This Week', value: `${weeklyWins.length} deals • R${weeklyRevenue.toLocaleString()}`, inline: false },
        ],
        footer: { text: `Total Pipeline: R${totalRevenue.toLocaleString()}` },
        timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `@everyone 🔥 **${closedBy}** just closed a deal!`,
            embeds: [embed]
        }),
    });

    console.log(`✅ Win posted: ${company} - R${amount} by ${closedBy}`);
}

async function postLeaderboard(): Promise<void> {
    // Group wins by person
    const leaderboard: Record<string, { count: number; total: number }> = {};

    wins.forEach(win => {
        if (!leaderboard[win.closedBy]) {
            leaderboard[win.closedBy] = { count: 0, total: 0 };
        }
        leaderboard[win.closedBy].count++;
        leaderboard[win.closedBy].total += win.amount;
    });

    const sorted = Object.entries(leaderboard)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 5);

    const leaderboardText = sorted
        .map((entry, i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
            return `${medal} **${entry[0]}** - ${entry[1].count} deals • R${entry[1].total.toLocaleString()}`;
        })
        .join('\n') || 'No wins yet. Go close some deals!';

    const embed = {
        title: '🏆 SALES LEADERBOARD',
        color: 0xffd700,
        description: leaderboardText,
        footer: { text: 'Updated in real-time' },
        timestamp: new Date().toISOString(),
    };

    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
    });

    console.log('✅ Leaderboard posted');
}

// CLI
const args = process.argv.slice(2);

if (args[0] === 'post' && args[1] && args[2] && args[3]) {
    postWin(args[1], parseInt(args[2]), args[3]);
} else if (args[0] === 'leaderboard') {
    postLeaderboard();
} else {
    console.log(`
Team Wins Tracker

Usage:
  npx tsx src/agents/auditor/wins.ts post "Company Name" 15000 "Sam"
  npx tsx src/agents/auditor/wins.ts leaderboard

Examples:
  npx tsx src/agents/auditor/wins.ts post "ABC Cleaning" 25000 "Sam"
  npx tsx src/agents/auditor/wins.ts post "XYZ Services" 18000 "Thabo"
    `);
}

export { postWin, postLeaderboard };
