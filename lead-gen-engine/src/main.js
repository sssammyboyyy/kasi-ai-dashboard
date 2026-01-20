/**
 * Lead Generation Suite - Main Entry Point
 * Unified Actor with mode routing, full customization, and feedback loops
 */

import { Actor } from 'apify';
import axios from 'axios';
import { scrapeGoogleMaps } from './scraper/google-maps.js';
import { enrichLeads } from './enricher/index.js';
import { qualifyLeads, filterLeads } from './qualifier/scoring.js';
import { generateScripts } from './qualifier/scripts.js';
import { generateEmailTemplates } from './qualifier/emails.js';
import { logFeedback, createMetrics } from './utils/feedback.js';
import { ApexBrowser } from './scraper/apex-browser.js';
import { NanoBrain } from './marketing/nano-brain.js';
import { NanoVision } from './marketing/nano-vision.js';
import { pushToSupabase } from './utils/supabase.js';


const startTime = Date.now();

await Actor.init();

try {
    const input = await Actor.getInput();

    const {
        mode = 'full_pipeline',
        searchQuery = 'golf simulator',
        locations = ['Miami, FL'],
        maxResultsPerLocation = 50,
        domains = [],
        leads = [],
        enrichmentMethods = ['website', 'pattern', 'dns', 'dork'],
        customEmailPrefixes,
        verifyEmails = true,
        findDecisionMaker = true,
        scoringWeights = {},
        minScoreThreshold = 0,
        generateCallScripts = true,
        generateEmailTemplates: genEmails = true,
        customCallScripts = {},
        customEmailTemplates = {},
        outputFormat = 'json',
        outputFilters = {},
        webhookUrl = '',
        webhookBatchSize = 10,
        maxConcurrency = 3,
        feedbackWebhook = null
    } = input;

    console.log(`
    ██╗     ███████╗ █████╗ ██████╗      ██████╗ ███████╗███╗   ██╗
    ██║     ██╔════╝██╔══██╗██╔══██╗    ██╔════╝ ██╔════╝████╗  ██║
    ██║     █████╗  ███████║██║  ██║    ██║  ███╗█████╗  ██╔██╗ ██║
    ██║     ██╔══╝  ██╔══██║██║  ██║    ██║   ██║██╔══╝  ██║╚██╗██║
    ███████╗███████╗██║  ██║██████╔╝    ╚██████╔╝███████╗██║ ╚████║
    ╚══════╝╚══════╝╚═╝  ╚═╝╚═════╝      ╚═════╝ ╚══════╝╚═╝  ╚═══╝
    🚀 SYSTEM ONLINE: ${mode.toUpperCase()} MODE ACTIVATED
    `);

    console.log(`🔧 LOADOUT CONFIGURED:`);
    if (Object.keys(scoringWeights).length) console.log(`   ✨ Custom Scoring Rules Loaded`);
    if (Object.keys(customCallScripts).length) console.log(`   📜 Custom Scripts Loaded`);
    if (Object.keys(customEmailTemplates).length) console.log(`   📧 Custom Templates Loaded`);
    if (webhookUrl) console.log(`   🔗 Webhook Uplink Established`);
    console.log(`\n🎯 MISSION: Extract & Enrich leads for "${searchQuery}" in ${locations.length} sector(s)\n`);

    let results = [];

    // ============ APEX PREDATOR (GOD MODE) ============
    if (mode === 'apex_predator') {
        console.log(`\n🦖 APEX PREDATOR MODE ENGAGED`);
        console.log(`   Sequence: Hunt -> Infect -> Mutate -> Visualize`);

        const browser = new ApexBrowser();
        const brain = new NanoBrain(process.env.GEMINI_API_KEY);
        const vision = new NanoVision(process.env.GEMINI_API_KEY);

        try {
            // 1. Hunt (Scrape)
            // Use 'searchQuery' as the Target URL in this mode
            const targetUrl = searchQuery.startsWith('http') ? searchQuery : `https://www.reddit.com/r/${searchQuery}/top/?t=week`;
            const viralContent = await browser.scrape(targetUrl);

            if (viralContent && viralContent.content) {
                // 2. Infect (Analyze)
                const dna = await brain.extractViralDNA(viralContent.content);
                console.log(`   🧬 DNA Extracted: ${dna.hookType || 'Unknown Hook'}`);

                // 3. Mutate (Rewrite)
                const niche = locations[0] || 'B2B Lead Generation';
                const mutantPost = await brain.mutateContent(dna, niche);
                console.log(`   🧪 Content Mutated for ${niche}`);

                // 4. Visualize (Image)
                const visualAsset = await vision.generateVisual(mutantPost);
                if (visualAsset) console.log(`   🎨 Visual Asset Staged`);

                results.push({
                    mode: 'apex_predator',
                    source: viralContent,
                    dna,
                    output: {
                        text: mutantPost,
                        image: visualAsset
                    },
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('   ❌ Hunt returned no viable content.');
            }
        } catch (e) {
            console.error(`   💀 Apex Predator Error: ${e.message}`);
        } finally {
            await browser.close();
        }
    }


    // ============ SCRAPE ONLY ============
    if (mode === 'scrape_only' || mode === 'full_pipeline') {
        console.log(`\n📍 SCRAPING: ${locations.length} location(s) for "${searchQuery}"`);

        for (const location of locations) {
            console.log(`   → Scraping: ${location}`);
            const scraped = await scrapeGoogleMaps(searchQuery, location, maxResultsPerLocation);
            results.push(...scraped);
            console.log(`   ✅ Found ${scraped.length} businesses`);
        }

        console.log(`\n📊 Total scraped: ${results.length} leads`);

        if (mode === 'scrape_only') {
            await pushResults(results, webhookUrl, webhookBatchSize);
            await Actor.setValue('SUMMARY', {
                mode,
                locationsSearched: locations.length,
                totalLeads: results.length,
                completedAt: new Date().toISOString()
            });
        }
    }

    // ============ ENRICH ONLY ============
    if (mode === 'enrich_only') {
        results = domains.map(d => ({
            domain: d,
            website: d.startsWith('http') ? d : `https://${d}`
        }));
    }

    // ============ ENRICHMENT ============
    if (mode === 'enrich_only' || mode === 'full_pipeline') {
        console.log(`\n📧 ENRICHING: ${results.length} leads`);

        results = await enrichLeads(results, {
            methods: enrichmentMethods,
            verifyEmails,
            findDecisionMaker,
            maxConcurrency,
            customEmailPrefixes
        });

        const emailCount = results.filter(r => r.email).length;
        console.log(`\n📊 Emails found: ${emailCount}/${results.length} (${((emailCount / results.length) * 100).toFixed(1)}%)`);

        if (mode === 'enrich_only') {
            await pushResults(results, webhookUrl, webhookBatchSize);
            await Actor.setValue('SUMMARY', {
                mode,
                totalDomains: domains.length,
                emailsFound: emailCount,
                successRate: `${((emailCount / results.length) * 100).toFixed(1)}%`,
                completedAt: new Date().toISOString()
            });
        }
    }

    // ============ ENRICH FROM FAST SCRAPER ============
    if (mode === 'enrich_from_fast_scraper') {
        // Accept leads from Fast Scraper with email_found: true
        const enrichableLeads = leads.filter(l => l.email_found === true);
        console.log(`\n📧 ENRICH FROM FAST SCRAPER: ${enrichableLeads.length}/${leads.length} leads have email potential`);

        results = await enrichLeads(enrichableLeads, {
            methods: enrichmentMethods,
            verifyEmails,
            findDecisionMaker,
            maxConcurrency,
            customEmailPrefixes
        });

        const emailCount = results.filter(r => r.email).length;
        console.log(`\n📊 Emails found: ${emailCount}/${results.length} (${((emailCount / results.length) * 100).toFixed(1)}%)`);
    }

    // ============ QUALIFY ONLY ============
    if (mode === 'qualify_only') {
        results = leads;
    }

    // ============ QUALIFICATION ============
    if (mode === 'qualify_only' || mode === 'full_pipeline') {
        console.log(`\n⭐ QUALIFYING: ${results.length} leads`);

        results = qualifyLeads(results, scoringWeights);

        const hotLeads = results.filter(r => r.qualification?.tier === 'hot').length;
        const warmLeads = results.filter(r => r.qualification?.tier === 'warm').length;
        console.log(`\n📊 Qualified: ${hotLeads} hot, ${warmLeads} warm, ${results.length - hotLeads - warmLeads} cold`);

        // Apply output filters
        if (minScoreThreshold > 0 || outputFilters.onlyWithEmail || outputFilters.onlyWithPhone) {
            const beforeFilter = results.length;
            results = filterLeads(results, { ...outputFilters, minScore: minScoreThreshold });
            console.log(`📋 Filtered: ${beforeFilter} → ${results.length} leads`);
        }

        // Generate call scripts
        if (generateCallScripts) {
            console.log(`\n📞 GENERATING CALL SCRIPTS...`);
            results = generateScripts(results, customCallScripts);
            console.log(`   ✅ Call scripts generated for ${results.length} leads`);
        }

        // Generate email templates
        if (genEmails) {
            console.log(`\n✉️ GENERATING EMAIL TEMPLATES...`);
            results = generateEmailTemplates(results, customEmailTemplates);
            console.log(`   ✅ Email templates generated for ${results.length} leads`);
        }
    }

    // ============ ADD SESSION ANALYTICS ============
    results = results.map(lead => ({
        ...lead,
        _meta: {
            sourceActor: lead.source === 'google_maps_fast' ? 'fast-scraper' : 'lead-gen-suite',
            pipelineMode: mode,
            enrichedAt: new Date().toISOString(),
            pipelineVersion: '2.0'
        }
    }));

    // ============ OUTPUT ============
    console.log(`\n💾 Saving ${results.length} results...`);

    await pushResults(results, webhookUrl, webhookBatchSize);

    // Summary
    const summary = {
        mode,
        totalLeads: results.length,
        withEmail: results.filter(r => r.email).length,
        hotLeads: results.filter(r => r.qualification?.tier === 'hot').length,
        warmLeads: results.filter(r => r.qualification?.tier === 'warm').length,
        customizationsApplied: {
            scoringWeights: Object.keys(scoringWeights).length > 0,
            customCallScripts: Object.keys(customCallScripts).length > 0,
            customEmailTemplates: Object.keys(customEmailTemplates).length > 0,
            webhookEnabled: !!webhookUrl
        },
        completedAt: new Date().toISOString()
    };

    await Actor.setValue('SUMMARY', summary);

    console.log(`\n🎉 COMPLETE!`);
    console.log(`   Total leads: ${summary.totalLeads}`);
    console.log(`   With email: ${summary.withEmail}`);
    console.log(`   Hot leads: ${summary.hotLeads}`);
    console.log(`   Warm leads: ${summary.warmLeads}`);

    // ============ FEEDBACK LOOP ============
    if (feedbackWebhook) {
        const metrics = createMetrics({
            event: `${mode}_completed`,
            runId: Actor.getEnv().actorRunId,
            success: true,
            mode: mode,
            duration: Date.now() - startTime,
            inputCount: leads?.length || locations?.length || 0,
            outputCount: results.length,
            emailsFound: summary.withEmail,
            hotLeads: summary.hotLeads,
            warmLeads: summary.warmLeads
        });
        await logFeedback(feedbackWebhook, metrics);
    }

} catch (error) {
    console.error('❌ Actor failed:', error.message);

    // Send failure feedback
    if (input?.feedbackWebhook) {
        const errorMetrics = createMetrics({
            event: 'run_failed',
            runId: Actor.getEnv().actorRunId,
            success: false,
            mode: input?.mode || 'unknown',
            duration: Date.now() - startTime,
            errors: [error.message]
        });
        await logFeedback(input.feedbackWebhook, errorMetrics);
    }

    throw error;
} finally {
    await Actor.exit();
}


// Helper: Push results to dataset and optionally to webhook
async function pushResults(results, webhookUrl, batchSize) {
    // Push to Apify dataset
    await Actor.pushData(results);

    // Push to Supabase
    await pushToSupabase(results);

    // Send to webhook if configured
    if (webhookUrl) {
        console.log(`\n🔗 Sending to webhook...`);

        for (let i = 0; i < results.length; i += batchSize) {
            const batch = results.slice(i, i + batchSize);
            try {
                await axios.post(webhookUrl, { leads: batch }, {
                    timeout: 30000,
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log(`   ✅ Sent batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(results.length / batchSize)}`);
            } catch (e) {
                console.log(`   ⚠️ Webhook batch failed: ${e.message}`);
            }
        }
    }
}
