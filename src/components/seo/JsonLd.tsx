"use client";

interface JsonLdProps {
    data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Pre-built schema generators for common types
export const schemas = {
    organization: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Kasi AI",
        url: "https://kasi.ai",
        logo: "https://kasi.ai/logo.png",
        description: "AI-powered B2B lead generation platform for South African small businesses. Get verified leads with email and phone numbers delivered to your WhatsApp.",
        foundingDate: "2024",
        founders: [
            {
                "@type": "Person",
                name: "Kasi AI Team"
            }
        ],
        address: {
            "@type": "PostalAddress",
            addressLocality: "Johannesburg",
            addressRegion: "Gauteng",
            addressCountry: "ZA"
        },
        contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer service",
            availableLanguage: ["English", "Afrikaans", "Zulu"]
        },
        sameAs: [
            "https://twitter.com/kasiai",
            "https://linkedin.com/company/kasiai"
        ]
    },

    website: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Kasi AI",
        url: "https://kasi.ai",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://kasi.ai/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    },

    product: (tier: { name: string; price: number; description: string; features: string[] }) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: `Kasi AI ${tier.name} Plan`,
        description: tier.description,
        brand: {
            "@type": "Brand",
            name: "Kasi AI"
        },
        offers: {
            "@type": "Offer",
            price: tier.price,
            priceCurrency: "ZAR",
            availability: "https://schema.org/InStock",
            priceValidUntil: "2026-12-31",
            seller: {
                "@type": "Organization",
                name: "Kasi AI"
            }
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "127"
        }
    }),

    faq: (items: { question: string; answer: string }[]) => ({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer
            }
        }))
    }),

    breadcrumb: (items: { name: string; url: string }[]) => ({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    })
};
