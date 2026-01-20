/**
 * Feedback Utility - Feedback Flywheel
 * Sends run metrics to external webhook for continuous improvement
 */

import axios from 'axios';

/**
 * Log feedback to an external webhook
 * @param {string} webhookUrl - URL to POST feedback to
 * @param {object} metrics - Run metrics to send
 */
export async function logFeedback(webhookUrl, metrics) {
    if (!webhookUrl) return;

    try {
        await axios.post(webhookUrl, {
            ...metrics,
            timestamp: new Date().toISOString(),
            source: 'lead-gen-suite'
        }, {
            timeout: 5000,
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('📊 Feedback sent to webhook');
        return true;
    } catch (e) {
        console.log(`⚠️ Feedback webhook failed: ${e.message}`);
        return false;
    }
}

/**
 * Create a standardized metrics object
 * @param {object} params - Run parameters
 * @returns {object} Metrics object
 */
export function createMetrics(params = {}) {
    return {
        event: params.event || 'run_completed',
        actorId: 'lead-gen-suite',
        runId: params.runId || null,
        success: params.success || false,
        mode: params.mode || 'unknown',
        duration: params.duration || 0,
        inputCount: params.inputCount || 0,
        outputCount: params.outputCount || 0,
        emailsFound: params.emailsFound || 0,
        hotLeads: params.hotLeads || 0,
        warmLeads: params.warmLeads || 0,
        errors: params.errors || []
    };
}
