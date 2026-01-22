/**
 * src/core/logging.ts
 * The Nano Banana Hooks.
 * Centralized logging for all agents. Enables self-healing by capturing structured errors.
 */

import { getAdminClient } from './database/admin';

export type AgentName = 'swarm' | 'outbound' | 'auditor' | 'core';
export type MetricType = 'leads_scraped' | 'emails_sent' | 'api_cost_usd' | 'error_count' | 'run_duration_ms';

interface LogMetricOptions {
    agent: AgentName;
    type: MetricType;
    value: number;
    context?: Record<string, unknown>;
}

/**
 * logMetric
 * Sends a metric to the system_metrics table.
 */
export async function logMetric(options: LogMetricOptions): Promise<void> {
    const supabase = getAdminClient();
    const { agent, type, value, context } = options;

    const { error } = await supabase.from('system_metrics').insert({
        agent_name: agent,
        metric_type: type,
        value,
        context: context || {},
    });

    if (error) {
        console.error('[Nano Banana] Failed to log metric:', error.message);
    }
}

/**
 * logError
 * Specialized metric for errors. Captures stack trace for debugging.
 */
export async function logError(agent: AgentName, error: Error, context?: Record<string, unknown>): Promise<void> {
    console.error(`[${agent.toUpperCase()}] ERROR:`, error.message);
    await logMetric({
        agent,
        type: 'error_count',
        value: 1,
        context: {
            message: error.message,
            stack: error.stack,
            ...context,
        },
    });

    // FUTURE: Trigger Nano Banana AI analysis here
    // Example: await analyzeErrorWithAI(error, context);
}

/**
 * logRunDuration
 * Helper to log how long an agent task took.
 */
export async function logRunDuration(agent: AgentName, startTime: number): Promise<void> {
    const duration = Date.now() - startTime;
    await logMetric({
        agent,
        type: 'run_duration_ms',
        value: duration,
    });
    console.log(`[${agent.toUpperCase()}] Run completed in ${(duration / 1000).toFixed(2)}s`);
}
