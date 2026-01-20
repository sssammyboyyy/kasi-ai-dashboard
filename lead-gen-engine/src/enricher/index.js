/**
 * Email Discovery BEAST - Core Enricher
 * All 7 discovery methods in one module
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { SMTPVerifier } from './verifier.js';


// Skip patterns for garbage emails
const SKIP_PATTERNS = [
    'noreply', 'no-reply', 'donotreply', 'mailer-daemon', 'postmaster',
    'abuse@', 'spam@', 'hostmaster', 'webmaster', 'root@',
    'example.com', 'test@test', 'sample@', 'user@domain',
    'sentry', 'wixpress.com', 'wordpress', 'cloudflare'
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * Enrich an array of leads with email data
 */
export async function enrichLeads(leads, options = {}) {
    const {
        methods = ['website', 'pattern', 'dns', 'dork'],
        verifyEmails = true,
        findDecisionMaker = true,
        maxConcurrency = 3,
        customEmailPrefixes = null
    } = options;

    const results = [];

    // Process in chunks
    for (let i = 0; i < leads.length; i += maxConcurrency) {
        const chunk = leads.slice(i, i + maxConcurrency);

        const chunkResults = await Promise.all(
            chunk.map(async (lead) => {
                const domain = lead.domain || (lead.website ? new URL(lead.website).hostname.replace('www.', '') : null);

                // Initial Target Acquired Log
                if (domain) {
                    console.log(`      🎯 Target Acquired: ${domain} (Hunting...)`);
                } else {
                    console.log(`      ⚠️  Target Missing: No website found for ${lead.businessName}`);
                    return { ...lead, email: null, emailSource: null, emailError: 'No domain found' };
                }

                try {
                    const enrichment = await enrichDomain(domain, { methods, verifyEmails, findDecisionMaker, customEmailPrefixes });

                    if (enrichment.email) {
                        const value = Math.floor(Math.random() * (1000 - 300) + 300); // Simulated LTV
                        console.log(`      💎 JACKPOT! Found: ${enrichment.email} | Pipeline Val: +$${value}`);
                    } else {
                        console.log(`      💨 Ghosted: No email found for ${domain}`);
                    }

                    return {
                        ...lead,
                        email: enrichment.email,
                        emailVerified: enrichment.verified,
                        emailSource: enrichment.source,
                        allEmailsFound: enrichment.allEmailsFound,
                        decisionMaker: enrichment.decisionMaker,
                        enrichedAt: new Date().toISOString()
                    };
                } catch (error) {
                    console.log(`      💀 KIA: ${domain} - ${error.message}`);
                    return { ...lead, email: null, emailError: error.message };
                }
            })
        );

        results.push(...chunkResults);
        console.log(`   [${Math.min(i + maxConcurrency, leads.length)}/${leads.length}] enriched`);
    }

    return results;
}

/**
 * Enrich a single domain
 */
async function enrichDomain(domainInput, options = {}) {
    const {
        methods = ['website', 'pattern', 'dns', 'dork'],
        verifyEmails = true,
        findDecisionMaker = false,
        customEmailPrefixes = null
    } = options;

    let domain = domainInput.toLowerCase().trim();
    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];

    const website = `https://${domain}`;

    const result = {
        domain,
        email: null,
        verified: false,
        source: null,
        allEmailsFound: [],
        decisionMaker: null,
        processedAt: new Date().toISOString()
    };

    const allEmails = new Set();

    // Method 1: Website Crawl
    if (methods.includes('website')) {
        const emails = await crawlWebsite(website);
        emails.forEach(e => allEmails.add(e));
        if (emails.length > 0) result.source = 'website';
    }

    // Method 2: Pattern Generation
    if (methods.includes('pattern')) {
        const patterns = generatePatterns(domain, customEmailPrefixes);
        patterns.forEach(e => allEmails.add(e));
        if (!result.source && patterns.length > 0) result.source = 'pattern';
    }

    // Method 3: WHOIS Lookup
    if (methods.includes('whois')) {
        const email = await whoisLookup(domain);
        if (email) {
            allEmails.add(email);
            if (!result.source) result.source = 'whois';
        }
    }

    // Method 4: Social Scrape
    if (methods.includes('social')) {
        const emails = await scrapeSocials(website);
        emails.forEach(e => allEmails.add(e));
        if (!result.source && emails.length > 0) result.source = 'social';
    }

    // Method 5: DNS TXT
    if (methods.includes('dns')) {
        const email = await checkDNS(domain);
        if (email) {
            allEmails.add(email);
            if (!result.source) result.source = 'dns';
        }
    }

    // Method 6: DuckDuckGo Dorking
    if (methods.includes('dork')) {
        const emails = await dorkSearch(domain);
        emails.forEach(e => allEmails.add(e));
        if (!result.source && emails.length > 0) result.source = 'dork';
    }

    // Method 7: Wayback Machine
    if (methods.includes('wayback')) {
        const emails = await checkWayback(domain);
        emails.forEach(e => allEmails.add(e));
        if (!result.source && emails.length > 0) result.source = 'wayback';
    }

    result.allEmailsFound = [...allEmails].filter(e => isValidEmail(e));

    // Select best email - try verification if enabled, but always fallback
    if (result.allEmailsFound.length > 0) {
        if (verifyEmails) {
            // Try to find a verified email
            for (const email of result.allEmailsFound) {
                try {
                    const verification = await verifyEmail(email);
                    if (verification.valid) {
                        result.email = email;
                        result.verified = true;
                        break;
                    }
                } catch (e) {
                    // Verification failed, continue to next
                }
            }
        }

        // FALLBACK: If no verified email found, use first email unverified
        if (!result.email) {
            result.email = result.allEmailsFound[0];
            result.verified = false;
        }
    }

    // Decision Maker
    if (findDecisionMaker) {
        result.decisionMaker = await findDecisionMakerInfo(website);
    }

    return result;
}

// ==================== METHOD IMPLEMENTATIONS ====================

async function crawlWebsite(website) {
    const emails = new Set();
    const pages = ['', '/contact', '/contact-us', '/about', '/about-us', '/team'];

    for (const page of pages) {
        try {
            const { data } = await axios.get(`${website}${page}`, {
                timeout: 5000,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EmailBot/1.0)' }
            });
            const found = data.match(EMAIL_REGEX) || [];
            found.forEach(e => emails.add(e.toLowerCase()));

            const $ = cheerio.load(data);
            $('a[href^="mailto:"]').each((_, el) => {
                const href = $(el).attr('href');
                const email = href.replace('mailto:', '').split('?')[0];
                if (email) emails.add(email.toLowerCase());
            });
        } catch (e) { /* continue */ }
    }

    return [...emails];
}

function generatePatterns(domain, customPrefixes = null) {
    const prefixes = customPrefixes || ['info', 'hello', 'contact', 'sales', 'support', 'admin', 'office', 'enquiries', 'bookings'];
    return prefixes.map(p => `${p}@${domain}`);
}

async function whoisLookup(domain) {
    try {
        const { data } = await axios.get(`https://rdap.org/domain/${domain}`, { timeout: 5000 });
        if (data.entities) {
            for (const entity of data.entities) {
                if (entity.vcardArray?.[1]) {
                    for (const field of entity.vcardArray[1]) {
                        if (field[0] === 'email' && field[3]) {
                            return field[3].toLowerCase();
                        }
                    }
                }
            }
        }
    } catch (e) { /* continue */ }
    return null;
}

async function scrapeSocials(website) {
    const emails = new Set();
    try {
        const { data } = await axios.get(website, { timeout: 5000 });
        const $ = cheerio.load(data);

        const socialLinks = [];
        $('a[href*="facebook.com"], a[href*="instagram.com"]').each((_, el) => {
            socialLinks.push($(el).attr('href'));
        });

        for (const link of socialLinks.slice(0, 2)) {
            try {
                const { data: socialData } = await axios.get(link, { timeout: 5000 });
                const found = socialData.match(EMAIL_REGEX) || [];
                found.forEach(e => emails.add(e.toLowerCase()));
            } catch (e) { /* continue */ }
        }
    } catch (e) { /* continue */ }
    return [...emails];
}

async function checkDNS(domain) {
    try {
        const { data } = await axios.get(`https://dns.google/resolve?name=${domain}&type=TXT`, { timeout: 5000 });
        if (data.Answer) {
            for (const answer of data.Answer) {
                const txt = answer.data || '';
                const dmarcMatch = txt.match(/mailto:([^;"\\s]+)/);
                if (dmarcMatch) return dmarcMatch[1].toLowerCase();
            }
        }
    } catch (e) { /* continue */ }
    return null;
}

async function dorkSearch(domain) {
    const emails = new Set();
    try {
        const query = encodeURIComponent(`"${domain}" email OR contact OR @`);
        const { data } = await axios.get(`https://html.duckduckgo.com/html/?q=${query}`, {
            timeout: 10000,
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const found = data.match(EMAIL_REGEX) || [];
        found.filter(e => e.includes(domain)).forEach(e => emails.add(e.toLowerCase()));
    } catch (e) { /* continue */ }
    return [...emails];
}

async function checkWayback(domain) {
    const emails = new Set();
    try {
        const { data } = await axios.get(
            `http://web.archive.org/cdx/search/cdx?url=${domain}&matchType=domain&output=json&limit=5`,
            { timeout: 10000 }
        );
        if (Array.isArray(data) && data.length > 1) {
            const snapshot = data[1];
            const timestamp = snapshot[1];
            const originalUrl = snapshot[2];

            const archiveUrl = `http://web.archive.org/web/${timestamp}/${originalUrl}`;
            const { data: pageData } = await axios.get(archiveUrl, { timeout: 10000 });

            const found = pageData.match(EMAIL_REGEX) || [];
            found.filter(e => e.includes(domain.split('.')[0])).forEach(e => emails.add(e.toLowerCase()));
        }
    } catch (e) { /* continue */ }
    return [...emails];
}

async function verifyEmail(email) {
    try {
        const result = await SMTPVerifier.verify(email);
        return { valid: result.valid, catchAll: result.catchAll };
    } catch (e) {
        return { valid: false, catchAll: false };
    }
}

async function findDecisionMakerInfo(website) {
    const patterns = [
        /(?:owner|founder|ceo|managing director|proprietor)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
        /([A-Z][a-z]+ [A-Z][a-z]+)[\s,\-–]+(?:owner|founder|ceo)/gi,
        /meet\s+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
        /founded by\s+([A-Z][a-z]+ [A-Z][a-z]+)/gi
    ];

    const pages = [`${website}/about`, `${website}/about-us`, `${website}/team`, `${website}/leadership`];

    for (const page of pages) {
        try {
            const { data } = await axios.get(page, { timeout: 5000 });
            const $ = cheerio.load(data);

            // 1. Look for structured text matches
            for (const pattern of patterns) {
                const match = pattern.exec(data);
                if (match && match[1]) {
                    // Try to find a linkedIn link nearby
                    const linkedin = $(`a[href*="linkedin.com/in"]`).first().attr('href');
                    return { name: match[1], title: 'Owner/Founder', linkedin: linkedin || null };
                }
            }

            // 2. Look for team cards with LinkedIn links
            let bestMatch = null;
            $('a[href*="linkedin.com/in"]').each((_, el) => {
                const href = $(el).attr('href');
                const name = $(el).text().trim() || $(el).closest('div').find('h3, h4, strong').first().text().trim();
                const title = $(el).closest('div').text().match(/(ceo|founder|owner|director)/i);

                if (title && name) {
                    bestMatch = { name, title: title[0], linkedin: href };
                    return false; // Break
                }
            });

            if (bestMatch) return bestMatch;

        } catch (e) { /* continue */ }
    }

    return null;
}

function isValidEmail(email) {
    if (!email || !email.includes('@')) return false;
    const lower = email.toLowerCase();
    return !SKIP_PATTERNS.some(p => lower.includes(p));
}
