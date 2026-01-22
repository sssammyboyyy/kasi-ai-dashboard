/**
 * src/core/scoring.ts
 * The Intelligence Algorithm.
 * Calculates a lead score (0-100) based on known heuristics.
 * Called on ingest by The Swarm and updated by The Rainmaker on engagement.
 */

export interface LeadData {
    businessName: string;
    email?: string | null;
    phone?: string | null;
    website?: string | null;
    niche?: string | null;
    location?: string | null;
}

export interface ScoringResult {
    score: number;
    reason: string;
}

// Keywords that indicate a higher-value B2B target
const POSITIVE_KEYWORDS = ['commercial', 'industrial', 'corporate', 'facilities', 'services', 'hygiene', 'group', 'holdings'];
const NEGATIVE_KEYWORDS = ['maid', 'domestic', 'laundry', 'car wash'];

/**
 * calculateLeadScore
 * The core algorithm. Scores a raw lead on ingest.
 */
export function calculateLeadScore(lead: LeadData): ScoringResult {
    let score = 50; // Base score
    const reasons: string[] = [];

    const name = (lead.businessName || '').toLowerCase();

    // 1. Contact Information (The Gold)
    if (lead.email) {
        score += 15;
        reasons.push('+15 Email Found');
    }
    if (lead.phone) {
        score += 10;
        reasons.push('+10 Phone Found');
    }

    // 2. Website (Indicates professionalism)
    if (lead.website) {
        score += 10;
        reasons.push('+10 Has Website');
    } else {
        score -= 10;
        reasons.push('-10 No Website (Low Priority)');
    }

    // 3. B2B Signal (Keyword Analysis)
    const hasPositive = POSITIVE_KEYWORDS.some(kw => name.includes(kw));
    const hasNegative = NEGATIVE_KEYWORDS.some(kw => name.includes(kw));

    if (hasPositive) {
        score += 15;
        reasons.push('+15 B2B Keywords');
    }
    if (hasNegative) {
        score -= 20;
        reasons.push('-20 B2C/Irrelevant Keywords');
    }

    // Clamp score to 0-100
    score = Math.max(0, Math.min(100, score));

    return {
        score,
        reason: reasons.join(' | '),
    };
}

/**
 * updateEngagementScore
 * Called by The Rainmaker when a lead interacts with an outbound message.
 */
export function calculateEngagementDelta(event: 'open' | 'click' | 'reply'): number {
    switch (event) {
        case 'open': return 5;
        case 'click': return 15;
        case 'reply': return 30;
        default: return 0;
    }
}
