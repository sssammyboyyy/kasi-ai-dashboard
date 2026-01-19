"use client";

import Script from "next/script";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function GoogleAnalytics() {
    if (!GA_MEASUREMENT_ID) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
            </Script>
        </>
    );
}

// Track custom events
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", eventName, params);
    }
}

// Common events for Kasi AI
export const analytics = {
    surveyStarted: () => trackEvent("survey_started"),
    surveyStep: (step: number, questionId: string) =>
        trackEvent("survey_step", { step, question_id: questionId }),
    surveyCompleted: (businessName: string) =>
        trackEvent("survey_completed", { business_name: businessName }),
    npsSubmitted: (score: number) =>
        trackEvent("nps_submitted", { score }),
    ctaClicked: (name: string) =>
        trackEvent("cta_clicked", { cta_name: name }),
};
