
export interface Lead {
    id: string;
    businessName: string;
    niche: string;
    leadScore: number;
    status: 'scraped' | 'enriching' | 'qualified' | 'dispatched';
    location: string;
    email?: string;
    phone?: string;
    whatsappScript: string;
    timestamp: string;
}

export const MOCK_LEADS: Lead[] = [
    {
        id: "1",
        businessName: "Dusty Rose Cleaning",
        niche: "Commercial Cleaning",
        leadScore: 92,
        status: "qualified",
        location: "Vanderbijlpark",
        email: "info@dustyrosecleaning.co.za",
        phone: "083 926 5165",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:01"
    },
    {
        id: "2",
        businessName: "WB Luminare",
        niche: "Commercial Cleaning",
        leadScore: 88,
        status: "qualified",
        location: "Vanderbijlpark",
        email: "support@wbluminare.co.za",
        phone: "+27 69 262 6457",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:04"
    },
    {
        id: "3",
        businessName: "Chem-Dry Vaal",
        niche: "Specialized Cleaning",
        leadScore: 95,
        status: "qualified",
        location: "Vaal Triangle",
        email: "vaal@chemdry.co.za",
        phone: "062 254 3035",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:08"
    },
    {
        id: "4",
        businessName: "The Specialists",
        niche: "Deep Cleaning services",
        leadScore: 85,
        status: "qualified",
        location: "Vereeniging",
        email: "lclaassen@lantic.net",
        phone: "016 428 2839",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:15"
    },
    {
        id: "5",
        businessName: "Modise Cleaning Solutions",
        niche: "Industrial Cleaning",
        leadScore: 78,
        status: "qualified",
        location: "Meyerton",
        email: "info@modisecleaning.co.za",
        phone: "082 528 7331",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:22"
    },
    {
        id: "6",
        businessName: "Famous Cleaning Services",
        niche: "Commercial Cleaning",
        leadScore: 89,
        status: "qualified",
        location: "Midrand/Gauteng",
        email: "info@famouscleaning.co.za",
        phone: "078 589 9572",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:28"
    },
    {
        id: "7",
        businessName: "Cleaning Africa Services",
        niche: "Corporate Cleaning",
        leadScore: 94,
        status: "qualified",
        location: "Gauteng",
        email: "info@cleaningafrica.co.za",
        phone: "+27 60 925 1734",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:35"
    },
    {
        id: "8",
        businessName: "CleanLab SA",
        niche: "Lab & Medical Cleaning",
        leadScore: 96,
        status: "qualified",
        location: "Vereeniging",
        email: "info@cleanlabsa.co.za",
        phone: "079 890 3441",
        whatsappScript: "Hi there, I'm Samuel...",
        timestamp: "10:42:42"
    }
];

export const LOG_STREAM = [
    "INIT: Connecting to Google Maps Grid [Johannesburg CBD]...",
    "SEARCH: Query 'commercial cleaning services' dispatched...",
    "GRID: Sector 12 responding... 47 results found",
    "EXTRACT: Found 'Pristine Office Cleaners'...",
    "ENRICH: Scanning website pristinecleaning.co.za...",
    "SUCCESS: admin@pristinecleaning.co.za verified ✓",
    "QUALIFY: Decision maker identified: Sarah M. (Operations Manager)",
    "SCRIPT: WhatsApp template personalized with location data...",
    "DISPATCH: Lead queued for delivery [Score: 94]",
    "EXTRACT: Found 'Sparkle Commercial Services'...",
    "ENRICH: LinkedIn profile matched...",
    "SUCCESS: Phone verified +27 82 555 1234 ✓",
    "QUALIFY: Business size: 10-50 employees",
    "EXTRACT: Found 'Metro Hygiene Solutions'...",
    "ENRICH: Enriching with company data...",
    "SUCCESS: Email bounce test passed ✓",
    "GRID: Sector 15 responding... 38 results found",
    "EXTRACT: Found 'CleanTech Pro'...",
    "ENRICH: Extracting contact from footer...",
    "SUCCESS: info@cleantechpro.co.za found ✓",
    "QUALIFY: Website quality score: 8.5/10",
    "EXTRACT: Found 'Vaal Cleaning Masters'...",
    "ENRICH: Cross-referencing with business registry...",
    "SUCCESS: Company registration verified ✓",
    "DISPATCH: Batch of 5 leads ready for WhatsApp",
    "GRID: Moving to Sandton sector...",
    "SEARCH: 156 potential businesses in queue...",
    "EXTRACT: Found 'Executive Cleaners SA'...",
    "QUALIFY: High-intent signals detected (hiring, expanding)",
    "SUCCESS: Decision maker direct line found ✓"
];

