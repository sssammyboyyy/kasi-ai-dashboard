/**
 * Google Maps Scraper - Playwright-based
 * Enhanced: Clicks into each result to get website/phone
 */

import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(stealthPlugin());

export async function scrapeGoogleMaps(keyword, location, maxResults = 50) {
    const limit = parseInt(maxResults) || 50;
    console.log(`   🔍 Scraping "${keyword}" in "${location}" (max: ${limit})`);

    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });

    const context = await browser.newContext({
        locale: 'en-US',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();
    let leads = [];

    try {
        // Navigate directly to search URL
        const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(keyword + " in " + location)}`;
        await page.goto(searchUrl, { timeout: 60000, waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(5000);

        // Handle consent
        try {
            const consentBtn = await page.$('button[aria-label*="Accept all"], button[jsname="tLjvIf"]');
            if (consentBtn) {
                await consentBtn.click();
                await page.waitForTimeout(2000);
            }
        } catch (e) { /* No consent needed */ }

        // Wait for results
        try {
            await Promise.race([
                page.waitForSelector('div[role="feed"]', { timeout: 10000 }),
                page.waitForSelector('div.Nv2PK', { timeout: 10000 }),
                page.waitForSelector('a[href*="/maps/place"]', { timeout: 10000 })
            ]);
        } catch (e) {
            console.log('   ⚠️ Results panel not found');
        }

        // Scroll to load more
        await page.evaluate(async (maxLimit) => {
            const wrapper = document.querySelector('div[role="feed"]');
            if (!wrapper) return;

            return new Promise((resolve) => {
                let stuckCount = 0;
                const timer = setInterval(() => {
                    const before = wrapper.scrollTop;
                    wrapper.scrollBy(0, 1500);

                    const items = document.querySelectorAll('a[href*="/maps/place"]');
                    if (items.length >= maxLimit) {
                        clearInterval(timer);
                        resolve();
                        return;
                    }

                    if (wrapper.scrollTop === before) {
                        stuckCount++;
                        if (stuckCount > 10) {
                            clearInterval(timer);
                            resolve();
                        }
                    } else {
                        stuckCount = 0;
                    }
                }, 600);

                setTimeout(() => { clearInterval(timer); resolve(); }, 30000);
            });
        }, limit);

        await page.waitForTimeout(1500);

        // Get all result links first
        const resultLinks = await page.evaluate((maxLimit) => {
            const links = [];
            document.querySelectorAll('a.hfpxzc, a[href*="/maps/place"]').forEach(el => {
                if (el.href && !links.includes(el.href)) {
                    links.push(el.href);
                }
            });
            return links.slice(0, maxLimit);
        }, limit);

        console.log(`   📍 Found ${resultLinks.length} results, extracting details...`);

        // Click into each result to get full details
        for (let i = 0; i < resultLinks.length; i++) {
            try {
                await page.goto(resultLinks[i], { timeout: 30000, waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(2000);

                const details = await page.evaluate(() => {
                    // Business name
                    const nameEl = document.querySelector('h1.DUwDvf');
                    const name = nameEl?.innerText || '';

                    // Website - try multiple selectors
                    let website = null;

                    // Method 1: Look for the website link in the info section
                    const infoLinks = document.querySelectorAll('a[data-item-id="authority"], a[aria-label*="Website"], a.CsEnBe[href*="http"]');
                    for (const link of infoLinks) {
                        if (link.href && !link.href.includes('google.com') && !link.href.includes('maps.google')) {
                            website = link.href;
                            break;
                        }
                    }

                    // Method 2: Look for any external links in the sidebar
                    if (!website) {
                        const allLinks = document.querySelectorAll('a[href^="http"]:not([href*="google"])');
                        for (const link of allLinks) {
                            if (link.href && !link.href.includes('google.com') && !link.href.includes('facebook.com') && !link.href.includes('instagram.com')) {
                                website = link.href;
                                break;
                            }
                        }
                    }

                    // Phone - look for phone button/link
                    let phone = null;
                    const phoneEl = document.querySelector('button[data-item-id*="phone:tel"]');
                    if (phoneEl) {
                        const phoneText = phoneEl.getAttribute('data-item-id') || phoneEl.innerText;
                        phone = phoneText.replace(/[^+\d]/g, '') || null;
                    }

                    // Rating
                    const ratingEl = document.querySelector('span[role="img"][aria-label*="stars"]');
                    const rating = ratingEl?.getAttribute('aria-label')?.match(/[\d.]+/)?.[0] || null;

                    // Review count
                    const reviewEl = document.querySelector('span[aria-label*="reviews"]');
                    const reviewCount = reviewEl?.getAttribute('aria-label')?.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || null;

                    // Category
                    const categoryEl = document.querySelector('button[jsaction*="category"]');
                    const category = categoryEl?.innerText || null;

                    return { name, website, phone, rating, reviewCount, category };
                });

                if (details.name) {
                    leads.push({
                        businessName: details.name,
                        googleMapsUrl: resultLinks[i],
                        website: details.website,
                        domain: details.website ? new URL(details.website).hostname.replace('www.', '') : null,
                        phone: details.phone,
                        rating: details.rating,
                        reviewCount: details.reviewCount,
                        category: details.category,
                        location: location,
                        source: 'google_maps',
                        sourceQuery: `${keyword} in ${location}`,
                        scrapedAt: new Date().toISOString()
                    });
                }

                // Progress indicator
                if ((i + 1) % 5 === 0) {
                    console.log(`   [${i + 1}/${resultLinks.length}] extracted`);
                }
            } catch (e) {
                // Skip failed extractions
            }
        }

    } catch (error) {
        console.error('   ❌ Scraper error:', error.message);
    } finally {
        await browser.close();
    }

    return leads;
}
