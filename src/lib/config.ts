// Production configuration
export const config = {
    formspree: {
        formId: process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || 'xyzgvqpw',
        getEndpoint: () => `https://formspree.io/f/${config.formspree.formId}`,
    },
    whatsapp: {
        number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '27000000000',
        getLink: (message: string) =>
            `https://wa.me/${config.whatsapp.number}?text=${encodeURIComponent(message)}`,
    },
    analytics: {
        gaId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
};

export const trackEvent = (name: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', name, params);
    }
};
