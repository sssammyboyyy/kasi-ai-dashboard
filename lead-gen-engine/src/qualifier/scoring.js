/**
 * Lead Qualifier - Scoring System
 * Assigns 0-100 score based on lead attributes with customizable weights
 */

const DEFAULT_WEIGHTS = {
    hasWebsite: 15,
    hasEmail: 25,
    emailVerified: 10,
    hasPhone: 10,
    noBookingSystem: 20,
    highRating: 10,
    hasDecisionMaker: 10,
    hasSocialMedia: 5,
    hasReviews: 5
};

export function qualifyLeads(leads, customWeights = {}) {
    const weights = { ...DEFAULT_WEIGHTS, ...customWeights };

    return leads.map(lead => {
        const { score, breakdown } = calculateScore(lead, weights);
        const tier = score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold';

        return {
            ...lead,
            qualification: {
                score,
                tier,
                breakdown
            }
        };
    });
}

function calculateScore(lead, weights) {
    let score = 0;
    const breakdown = {};

    // Has website
    if (lead.website || lead.domain) {
        score += weights.hasWebsite;
        breakdown.hasWebsite = weights.hasWebsite;
    }

    // Has email
    if (lead.email) {
        score += weights.hasEmail;
        breakdown.hasEmail = weights.hasEmail;
    }

    // Email verified
    if (lead.emailVerified) {
        score += weights.emailVerified;
        breakdown.emailVerified = weights.emailVerified;
    }

    // Has phone
    if (lead.phone) {
        score += weights.hasPhone;
        breakdown.hasPhone = weights.hasPhone;
    }

    // No booking system detected (manual operations)
    if (lead.hasBookingSystem === false || lead.noBookingSystem) {
        score += weights.noBookingSystem;
        breakdown.noBookingSystem = weights.noBookingSystem;
    }

    // High rating (4.5+)
    if (lead.rating && parseFloat(lead.rating) >= 4.5) {
        score += weights.highRating;
        breakdown.highRating = weights.highRating;
    }

    // Has social media
    if (lead.hasSocialMedia || lead.socialLinks) {
        score += weights.hasSocialMedia;
        breakdown.hasSocialMedia = weights.hasSocialMedia;
    }

    // Decision maker found
    if (lead.decisionMaker?.name) {
        score += weights.hasDecisionMaker;
        breakdown.hasDecisionMaker = weights.hasDecisionMaker;
    }

    // Has reviews (engagement indicator)
    if (lead.reviewCount && parseInt(lead.reviewCount) > 10) {
        score += weights.hasReviews;
        breakdown.hasReviews = weights.hasReviews;
    }

    // --- ALGORITHMIC BONUSES (Non-Linear) ---

    // 1. The "Golden Lead" Bonus (Email + Phone + Decision Maker)
    if (lead.email && lead.phone && lead.decisionMaker?.name) {
        const bonus = 15;
        score += bonus;
        breakdown.goldenLeadBonus = bonus;
    }

    // 2. The "Digital Ghost" Penalty (No Website + No Socials)
    if (!lead.website && !lead.hasSocialMedia) {
        const penalty = -10;
        score += penalty;
        breakdown.digitalGhostPenalty = penalty;
    }

    // 3. Low Rating Penalty
    if (lead.rating && parseFloat(lead.rating) < 3.0) {
        const penalty = -15;
        score += penalty;
        breakdown.lowRatingPenalty = penalty;
    }

    return { score: Math.max(0, Math.min(score, 100)), breakdown };
}

export function filterLeads(leads, filters = {}) {
    const {
        minScore = 0,
        onlyWithEmail = false,
        onlyWithPhone = false,
        excludeCategories = []
    } = filters;

    return leads.filter(lead => {
        if (lead.qualification?.score < minScore) return false;
        if (onlyWithEmail && !lead.email) return false;
        if (onlyWithPhone && !lead.phone) return false;
        if (excludeCategories.length > 0 && lead.category) {
            if (excludeCategories.some(cat => lead.category.toLowerCase().includes(cat.toLowerCase()))) {
                return false;
            }
        }
        return true;
    });
}
