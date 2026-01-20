/**
 * Call Script Generator
 * Creates personalized gatekeeper bypass scripts with custom template support
 */

const DEFAULT_SCRIPTS = {
    openerPrimary: "Hi — who's the best person to speak to about {{businessType}}?",
    openerSecondary: "Hi — I'm calling regarding {{businessType}}. Who should I speak to?",
    openerCallback: "Hi — I'm following up on a call earlier regarding {{businessName}}.",
    icebreaker: "{{businessName}} looks like a great spot in {{city}}!",
    valueHook: "We help {{businessType}} businesses automate bookings and fill empty slots.",
    close: "Would it make sense to show you how it works? Takes about 10 minutes."
};

const OBJECTION_RESPONSES = {
    whatAbout: [
        "It's about how bookings are being handled.",
        "It's regarding scheduling.",
        "Just a quick ops-related question."
    ],
    whoAreYou: "[Your Name]. (Stop. Don't add anything else.)",
    areSales: [
        "Not exactly — it's about improving how bookings are handled.",
        "It's not a sales call — it's a quick operational query."
    ],
    needEmail: "I can do that — it'll just help to speak to them briefly so I send the right thing.",
    notAvailable: "No problem — when's the best time to catch them? And just so I reach the right person, what's their role?"
};

export function generateScripts(leads, customScripts = {}) {
    const templates = { ...DEFAULT_SCRIPTS, ...customScripts };

    return leads.map(lead => {
        const businessName = lead.businessName || lead.business_name || 'the venue';
        const city = lead.location || lead.city || '';
        const businessType = lead.sourceQuery?.split(' in ')[0] || 'venue';
        const rating = lead.rating || '';

        const replacements = {
            '{{businessName}}': businessName,
            '{{city}}': city,
            '{{businessType}}': businessType,
            '{{rating}}': rating
        };

        const replaceVars = (text) => {
            let result = text;
            for (const [key, value] of Object.entries(replacements)) {
                result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
            }
            return result;
        };

        const venueType = classifyVenueType(lead);

        return {
            ...lead,
            callScript: {
                venueType,
                openerPrimary: replaceVars(templates.openerPrimary),
                openerSecondary: replaceVars(templates.openerSecondary),
                callbackOpener: replaceVars(templates.openerCallback),
                icebreaker: replaceVars(templates.icebreaker),
                objections: {
                    whatAbout: OBJECTION_RESPONSES.whatAbout[Math.floor(Math.random() * OBJECTION_RESPONSES.whatAbout.length)],
                    whoAreYou: OBJECTION_RESPONSES.whoAreYou,
                    areSales: OBJECTION_RESPONSES.areSales[Math.floor(Math.random() * OBJECTION_RESPONSES.areSales.length)],
                    needEmail: OBJECTION_RESPONSES.needEmail,
                    notAvailable: OBJECTION_RESPONSES.notAvailable
                },
                dmTransition: `Perfect — then I'll be quick. I'm calling about how you handle bookings and scheduling.`,
                valueHook: replaceVars(templates.valueHook),
                close: replaceVars(templates.close)
            }
        };
    });
}

function classifyVenueType(lead) {
    const name = (lead.businessName || lead.business_name || '').toLowerCase();
    const category = (lead.category || '').toLowerCase();

    if (name.includes('country club') || name.includes('estate') || name.includes('royal') || name.includes('resort')) {
        return 'corporate';
    }

    if (name.includes('academy') || name.includes('coaching') || name.includes('pro shop') || name.includes('studio')) {
        return 'small_business';
    }

    return 'default';
}
