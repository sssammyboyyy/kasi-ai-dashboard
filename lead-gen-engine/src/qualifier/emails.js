/**
 * Email Template Generator
 * Creates personalized cold email sequences
 */

const DEFAULT_TEMPLATES = {
    subject1: "Quick question about {{businessName}}",
    subject2: "{{city}} {{businessType}} - booking idea",
    body1: `Hi {{firstName}},

I noticed {{businessName}} in {{city}} and wanted to reach out.

We help {{businessType}} businesses automate bookings and fill empty time slots without changing how you operate.

Would it make sense to show you how it works?

Best,
[Your Name]`,
    followUp: `Hi {{firstName}},

Just following up on my last note about {{businessName}}.

Happy to share a quick demo if it's helpful.

Best,
[Your Name]`,
    breakup: `Hi {{firstName}},

I've reached out a couple of times about {{businessName}}.

If you're not interested, no worries at all — I'll stop reaching out.

But if timing wasn't right, I'm happy to circle back in a few months.

Best,
[Your Name]`
};

export function generateEmailTemplates(leads, customTemplates = {}) {
    const templates = { ...DEFAULT_TEMPLATES, ...customTemplates };

    return leads.map(lead => {
        const businessName = lead.businessName || lead.business_name || 'your venue';
        const city = lead.location || lead.city || '';
        const businessType = lead.sourceQuery?.split(' in ')[0] || 'venue';
        const rating = lead.rating || '';
        const firstName = lead.decisionMaker?.name?.split(' ')[0] || 'there';

        const replacements = {
            '{{businessName}}': businessName,
            '{{city}}': city,
            '{{businessType}}': businessType,
            '{{rating}}': rating,
            '{{firstName}}': firstName
        };

        const replaceVars = (text) => {
            let result = text;
            for (const [key, value] of Object.entries(replacements)) {
                result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
            }
            return result;
        };

        return {
            ...lead,
            emailTemplates: {
                subject1: replaceVars(templates.subject1),
                subject2: replaceVars(templates.subject2),
                body1: replaceVars(templates.body1),
                followUp: replaceVars(templates.followUp),
                breakup: replaceVars(templates.breakup)
            }
        };
    });
}
