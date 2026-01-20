// Base path configuration
// For Vercel deployment: no prefix needed (served from root)
// For GitHub Pages: would be '/kasi-ai-dashboard'
export const BASE_PATH = '';

// Helper function to prefix asset paths
export function assetPath(path: string): string {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${BASE_PATH}${normalizedPath}`;
}

