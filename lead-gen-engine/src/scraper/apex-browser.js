import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

// Equip the stealth functionality
chromium.use(stealth());

/**
 * ApexBrowser - The "Universal Scraper"
 * Zero-marginal cost scraping using local resources.
 * Capable of handling Twitter/X, Reddit, and generic sites.
 */
export class ApexBrowser {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    /**
     * Launch the stealth browser
     */
    async init() {
        console.log('   🕵️  Apex Browser: Initializing Stealth Mode...');
        this.browser = await chromium.launch({
            headless: true, // Set to false for debugging
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();

        // Anti-detect measures
        await this.page.setViewportSize({ width: 1920, height: 1080 });
        console.log('   ✅ Apex Browser: Online');
    }

    /**
     * Extract content from a URL based on platform detection
     * @param {string} url - Target URL (Twitter/Reddit/Generic)
     */
    async scrape(url) {
        if (!this.browser) await this.init();
        console.log(`   🏹 Hunting: ${url}`);

        try {
            await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            await this.page.waitForTimeout(2000); // Human-like pause

            if (url.includes('reddit.com')) {
                return await this.scrapeReddit();
            } else if (url.includes('twitter.com') || url.includes('x.com')) {
                return await this.scrapeTwitter();
            } else {
                return await this.scrapeGeneric();
            }
        } catch (error) {
            console.error(`   ❌ Scrape Failed: ${error.message}`);
            return null;
        }
    }

    /**
     * Extract Reddit Thread
     */
    async scrapeReddit() {
        console.log('   👽 Identifying Reddit Structure...');

        // Wait for main content
        try {
            await this.page.waitForSelector('h1', { timeout: 5000 });
        } catch (e) { }

        const data = await this.page.evaluate(() => {
            const title = document.querySelector('h1')?.innerText || '';
            const content = document.querySelector('div[data-test-id="post-content"]')?.innerText ||
                document.querySelector('.Post p')?.innerText || ''; // Fallback selector

            // Get comments (simple extraction of top comments)
            const comments = Array.from(document.querySelectorAll('div[data-test-id="comment"]'))
                .slice(0, 5)
                .map(c => c.innerText.slice(0, 200) + '...');

            return { platform: 'reddit', title, content, comments };
        });

        console.log(`   ✅ Extracted: "${data.title.slice(0, 30)}..."`);
        return data;
    }

    /**
     * Extract Twitter/X Thread
     * Note: X is hard to scrape without auth, this is a best-effort public view scraper.
     */
    async scrapeTwitter() {
        console.log('   🐦 Identifying X Structure...');

        // Best effort for public threads
        try {
            await this.page.waitForSelector('article', { timeout: 5000 });
        } catch (e) {
            console.log('   ⚠️  Twitter may be forcing login.');
        }

        const data = await this.page.evaluate(() => {
            const tweets = Array.from(document.querySelectorAll('article div[lang]'))
                .map(d => d.innerText);

            return {
                platform: 'twitter',
                content: tweets[0] || '', // Main tweet
                thread: tweets.slice(1) // Replies/Thread
            };
        });

        console.log(`   ✅ Extracted: ${data.content.length} chars`);
        return data;
    }

    /**
     * Generic Page Scraper
     */
    async scrapeGeneric() {
        console.log('   🌐 Generic Extraction...');
        const content = await this.page.evaluate(() => document.body.innerText);
        const title = await this.page.title();
        return { platform: 'generic', title, content: content.slice(0, 5000) };
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('   💤 Apex Browser: Closed');
        }
    }
}
