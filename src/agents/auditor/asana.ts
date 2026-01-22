/**
 * src/agents/auditor/asana.ts
 * Asana Integration for Kasi AI Auditor
 * 
 * Features:
 * - Daily task digest to Discord
 * - Overdue task alerts
 * - Auto-create tasks for hot leads
 * 
 * Setup:
 * 1. Go to https://app.asana.com/0/developer-console
 * 2. Create a Personal Access Token
 * 3. Add to .env: ASANA_ACCESS_TOKEN=your_token
 * 4. Get your workspace ID: run with 'workspaces' command
 */

const ASANA_ACCESS_TOKEN = process.env.ASANA_ACCESS_TOKEN || '';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1463575352679858176/MV8tXUL8o8ppC8oojeP95y2Ulwk4kE2fuzToqcUWzJ_dZeq5IrxjUp9p2N73YLsajyRZ';
const ASANA_WORKSPACE_ID = process.env.ASANA_WORKSPACE_ID || '';

// ============ ASANA API ============
async function asanaFetch(endpoint: string) {
    const response = await fetch(`https://app.asana.com/api/1.0${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
            'Accept': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`Asana API error: ${response.status}`);
    }
    return response.json();
}

// ============ DISCORD SENDER ============
async function sendDiscord(content: string, embeds?: object[]): Promise<void> {
    await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, embeds }),
    });
}

// ============ LIST WORKSPACES ============
async function listWorkspaces() {
    const { data } = await asanaFetch('/workspaces');
    console.log('📋 Your Asana Workspaces:');
    data.forEach((ws: { gid: string; name: string }) => {
        console.log(`   ID: ${ws.gid} | Name: ${ws.name}`);
    });
    console.log('\nAdd ASANA_WORKSPACE_ID to your .env file');
}

// ============ GET TODAY'S TASKS ============
async function getTodaysTasks() {
    if (!ASANA_WORKSPACE_ID) {
        console.log('❌ ASANA_WORKSPACE_ID not set. Run with "workspaces" first.');
        return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const { data } = await asanaFetch(
        `/workspaces/${ASANA_WORKSPACE_ID}/tasks/search?due_on=${today}&opt_fields=name,assignee.name,due_on,completed,projects.name`
    );
    return data;
}

// ============ GET OVERDUE TASKS ============
async function getOverdueTasks() {
    if (!ASANA_WORKSPACE_ID) return [];

    const today = new Date().toISOString().split('T')[0];
    const { data } = await asanaFetch(
        `/workspaces/${ASANA_WORKSPACE_ID}/tasks/search?due_on.before=${today}&completed=false&opt_fields=name,assignee.name,due_on,projects.name`
    );
    return data;
}

// ============ DAILY TASK DIGEST ============
async function sendTaskDigest() {
    console.log('📋 Fetching tasks...');

    const todaysTasks = await getTodaysTasks();
    const overdueTasks = await getOverdueTasks();

    const fields = [];

    if (todaysTasks.length > 0) {
        const taskList = todaysTasks.slice(0, 10).map((t: any) =>
            `• ${t.completed ? '✅' : '⬜'} ${t.name}${t.assignee ? ` (@${t.assignee.name})` : ''}`
        ).join('\n');
        fields.push({ name: `📅 Due Today (${todaysTasks.length})`, value: taskList || 'None', inline: false });
    }

    if (overdueTasks.length > 0) {
        const overdueList = overdueTasks.slice(0, 5).map((t: any) =>
            `• ⚠️ ${t.name}${t.assignee ? ` (@${t.assignee.name})` : ''} - Due: ${t.due_on}`
        ).join('\n');
        fields.push({ name: `🚨 Overdue (${overdueTasks.length})`, value: overdueList, inline: false });
    }

    if (fields.length === 0) {
        fields.push({ name: '✨ All Clear!', value: 'No tasks due today and no overdue items.', inline: false });
    }

    const embed = {
        title: '📋 DAILY TASK DIGEST',
        color: 0x7c3aed, // Purple (Asana-ish)
        fields,
        footer: { text: 'Synced from Asana' },
        timestamp: new Date().toISOString(),
    };

    await sendDiscord('', [embed]);
    console.log('✅ Task digest sent to Discord!');
}

// ============ CREATE TASK FOR HOT LEAD ============
async function createLeadTask(leadName: string, leadEmail: string, score: number, projectId?: string) {
    if (!ASANA_WORKSPACE_ID) {
        console.log('❌ ASANA_WORKSPACE_ID not set');
        return;
    }

    const taskData: any = {
        data: {
            name: `🔥 Follow up: ${leadName} (Score: ${score})`,
            notes: `Hot lead from Kasi AI\n\nEmail: ${leadEmail}\nScore: ${score}/100\n\nAction: Call/email within 24 hours`,
            workspace: ASANA_WORKSPACE_ID,
            due_on: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due tomorrow
        }
    };

    if (projectId) {
        taskData.data.projects = [projectId];
    }

    const response = await fetch('https://app.asana.com/api/1.0/tasks', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ASANA_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
    });

    if (response.ok) {
        console.log(`✅ Created Asana task for: ${leadName}`);
    } else {
        console.log('❌ Failed to create task:', await response.text());
    }
}

// ============ CLI ============
const args = process.argv.slice(2);

if (args[0] === 'workspaces') {
    listWorkspaces();
} else if (args[0] === 'digest') {
    sendTaskDigest();
} else if (args[0] === 'test-task') {
    createLeadTask('Test Company', 'test@example.com', 85);
} else {
    console.log(`
Asana Integration for Kasi AI

Usage:
  npx tsx src/agents/auditor/asana.ts workspaces  - List your Asana workspaces
  npx tsx src/agents/auditor/asana.ts digest      - Send daily task digest to Discord
  npx tsx src/agents/auditor/asana.ts test-task   - Create a test task in Asana

Setup:
  1. Get token: https://app.asana.com/0/developer-console
  2. Add to .env.local: ASANA_ACCESS_TOKEN=your_token
  3. Run 'workspaces' to get your workspace ID
  4. Add to .env.local: ASANA_WORKSPACE_ID=your_id
    `);
}
