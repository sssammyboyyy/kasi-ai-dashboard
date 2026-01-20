# Lead Generation Suite 🚀

> **All-in-One Lead Generation: Scrape → Enrich → Qualify → Scripts & Emails**

From search query to **sales-ready leads with personalized outreach** in one click.

---

### 🤖 Free AI Consultant
**Need expert help configuring your campaign?**
Chat with our [Lead Gen Architect GPT](https://chatgpt.com/g/g-696a2c0ab5448191a7020beea411dd08-lead-gen-architect).
It will interview you about your niche, write your sales scripts, and generate the perfect JSON for this Actor.

---

## 🔗 Works with Fast Scraper (A→B Pipeline)

Already scraped leads with our [⚡ Fastest Google Maps Scraper](https://apify.com/venueengine.co/fast-google-maps-scraper)?

Use `enrich_from_fast_scraper` mode to unlock the premium data:

```json
{
    "mode": "enrich_from_fast_scraper",
    "leads": [...output from Fast Scraper...]
}
```

This filters leads with `email_found: true` and enriches them with verified emails, decision makers, and scripts.

---

## 🎯 Features

| Stage | What It Does |
|-------|--------------|
| **Scrape** | Search Google Maps for businesses |
| **Enrich** | Find emails using 7 discovery methods |
| **Qualify** | Score leads 0-100 (customizable weights) |
| **Scripts** | Generate gatekeeper bypass call scripts |
| **Emails** | Generate tested cold email sequences |

---

## ✨ Full Customization

### Custom Call Scripts
Use your own openers with variables:
```json
{
    "customCallScripts": {
        "openerPrimary": "Hi — who handles {{businessType}} at your location?",
        "valueHook": "We help {{businessType}} businesses save 10+ hours/week on scheduling."
    }
}
```

### Custom Email Templates
Personalized cold emails:
```json
{
    "customEmailTemplates": {
        "subject1": "Quick question about {{businessName}}",
        "body1": "Hi {{firstName}},\n\nI noticed {{businessName}} in {{city}}..."
    }
}
```

### Custom Scoring Weights
Prioritize what matters to YOU:
```json
{
    "scoringWeights": {
        "hasEmail": 30,
        "hasPhone": 20,
        "highRating": 15
    }
}
```

### Output Filters
Only get the leads you want:
```json
{
    "minScoreThreshold": 50,
    "outputFilters": {
        "onlyWithEmail": true,
        "excludeCategories": ["Golf equipment store"]
    }
}
```

### Webhook Integration
Push leads to Zapier/Make/n8n in real-time:
```json
{
    "webhookUrl": "https://hooks.zapier.com/hooks/catch/...",
    "webhookBatchSize": 10
}
```

### Feedback Analytics (Optional)
Track run performance for continuous improvement:
```json
{
    "feedbackWebhook": "https://your-analytics-endpoint.com/ingest"
}
```
Receives POST with: `success`, `totalLeads`, `emailsFound`, `hotLeads`, `duration`, `errors[]`

---

## 🔧 Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{businessName}}` | Company name | "Swing Shack" |
| `{{city}}` | Location | "Miami, FL" |
| `{{businessType}}` | From search query | "golf simulator" |
| `{{firstName}}` | Decision maker first name | "John" |
| `{{rating}}` | Star rating | "4.9" |

---

## 📥 Input Examples

### Full Pipeline with Customization
```json
{
    "mode": "full_pipeline",
    "searchQuery": "yoga studio",
    "locations": ["Austin, TX", "Denver, CO"],
    "maxResultsPerLocation": 50,
    "verifyEmails": true,
    "generateCallScripts": true,
    "generateEmailTemplates": true,
    "minScoreThreshold": 50,
    "customCallScripts": {
        "valueHook": "We help yoga studios automate class bookings and reduce no-shows by 40%."
    }
}
```

---

## 📤 Sample Output

```json
{
    "businessName": "Zen Yoga Austin",
    "email": "hello@zenyoga.com",
    "phone": "5125551234",
    "qualification": {
        "score": 75,
        "tier": "warm"
    },
    "callScript": {
        "openerPrimary": "Hi — who handles yoga studio bookings?",
        "valueHook": "We help yoga studios automate class bookings..."
    },
    "emailTemplates": {
        "subject1": "Quick question about Zen Yoga Austin",
        "body1": "Hi there,\n\nI noticed Zen Yoga Austin in Austin..."
    }
}
```

---

## 🔬 7 Email Discovery Methods

1. **Website Crawl** - Contact pages
2. **Pattern Generation** - info@, hello@, etc.
3. **WHOIS Lookup** - Domain registration
4. **Social Scrape** - Facebook/Instagram
5. **DNS TXT** - DMARC records
6. **DuckDuckGo Dorking** - Search exposed emails
7. **Wayback Machine** - Historical pages

---

## 💰 Pricing

| Mode | Price/Lead |
|------|------------|
| Full Pipeline | ~$0.05 |
| Scrape Only | ~$0.01 |
| Enrich Only | ~$0.025 |
| Qualify Only | ~$0.01 |

---

## 🎯 Perfect For

- **SDRs** - Call-ready leads with scripts
- **Email Marketers** - Enriched lists with copy
- **Agencies** - White-label lead gen
- **ANY Niche** - Fully customizable

---

## 📜 License

MIT
