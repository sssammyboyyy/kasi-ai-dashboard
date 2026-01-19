
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
    "INIT: Connecting to Google Maps Grid [Vanderbijlpark]...",
    "SEARCH: Query 'commercial cleaning' dispatched...",
    "GRID: Sector 7 responding...",
    "EXTRACT: Found 'Dusty Rose Cleaning'...",
    "ENRICH: Scanning website for emails...",
    "SUCCESS: info@dustyrosecleaning.co.za found.",
    "QUALIFY: Phone number validated [083 926 5165]",
    "SCRIPT: Generating WhatsApp personalization...",
    "DISPATCH: Ready for queue.",
    "EXTRACT: Found 'WB Luminare'...",
    "ENRICH: Scanning website...",
    "SUCCESS: support@wbluminare.co.za found.",
    "QUALIFY: Phone number validated [+27 69 262 6457]"
];
