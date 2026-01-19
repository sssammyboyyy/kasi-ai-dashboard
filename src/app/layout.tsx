import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { JsonLd, schemas } from "@/components/seo/JsonLd";
import { SkipLink } from "@/components/ui/SkipLink";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap"
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap"
});

// SEO-optimized metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://kasi.ai"),
  title: {
    default: "Kasi AI - B2B Lead Generation for South African Businesses",
    template: "%s | Kasi AI"
  },
  description: "Get verified B2B leads with email and phone numbers delivered to your WhatsApp. AI-powered lead generation built for South African hustlers. First 25 leads FREE.",
  keywords: [
    "B2B lead generation",
    "South Africa leads",
    "small business leads",
    "commercial cleaning leads",
    "WhatsApp marketing",
    "verified business contacts",
    "Kasi AI"
  ],
  authors: [{ name: "Kasi AI Team" }],
  creator: "Kasi AI",
  publisher: "Kasi AI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://kasi.ai",
    siteName: "Kasi AI",
    title: "Kasi AI - B2B Lead Generation for South African Businesses",
    description: "Get verified B2B leads with email and phone numbers delivered to your WhatsApp. First 25 leads FREE.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kasi AI - Your Leads, Delivered",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasi AI - B2B Lead Generation",
    description: "AI-powered lead generation for South African businesses. First 25 leads FREE.",
    images: ["/og-image.png"],
    creator: "@kasiai",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://kasi.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Global Schema Markup */}
        <JsonLd data={schemas.organization} />
        <JsonLd data={schemas.website} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${outfit.variable} font-sans antialiased`}>
        <SkipLink />
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
