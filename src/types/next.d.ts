// Type declarations for Next.js modules
// These declarations resolve TypeScript errors for Next.js internal modules

declare module 'next' {
    export interface Metadata {
        metadataBase?: URL;
        title?: string | { default: string; template: string };
        description?: string;
        keywords?: string[];
        authors?: { name: string; url?: string }[];
        creator?: string;
        publisher?: string;
        robots?: {
            index?: boolean;
            follow?: boolean;
            googleBot?: {
                index?: boolean;
                follow?: boolean;
                'max-video-preview'?: number;
                'max-image-preview'?: string;
                'max-snippet'?: number;
            };
        };
        openGraph?: {
            type?: string;
            locale?: string;
            url?: string;
            siteName?: string;
            title?: string;
            description?: string;
            images?: { url: string; width: number; height: number; alt: string }[];
        };
        twitter?: {
            card?: string;
            title?: string;
            description?: string;
            images?: string[];
            creator?: string;
        };
        icons?: {
            icon?: string;
            shortcut?: string;
            apple?: string;
        };
        manifest?: string;
        alternates?: {
            canonical?: string;
        };
    }

    export interface NextConfig {
        images?: {
            formats?: string[];
            deviceSizes?: number[];
            imageSizes?: number[];
            minimumCacheTTL?: number;
        };
        experimental?: {
            optimizeCss?: boolean;
        };
        compress?: boolean;
        poweredByHeader?: boolean;
        reactStrictMode?: boolean;
    }
}

declare module 'next/image';
declare module 'next/link';
declare module 'next/font/google';
