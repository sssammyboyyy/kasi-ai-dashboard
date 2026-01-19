// Base path for GitHub Pages deployment
// This must match the basePath in next.config.ts
export const BASE_PATH = process.env.NODE_ENV === 'production' ? '/kasi-ai-dashboard' : '';

// Helper function to prefix asset paths
export function assetPath(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${normalizedPath}`;
}
