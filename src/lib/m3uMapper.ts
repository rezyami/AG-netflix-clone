import { M3UEntry } from "./m3u";
import { MediaItem } from "@/types/tmdb";

// Helper to generate a deterministic ID from a string
export function generateId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

// Helper to fix malformed URLs commonly found in M3U files
function normalizeUrl(url: string | undefined): string | null {
    if (!url) return null;

    // Fix missing slash after port (e.g., http://host:portimages/...)
    // This regex looks for :digits followed immediately by "images" or other common paths without a slash
    let fixedUrl = url.replace(/(:[0-9]+)(images\/)/, '$1/$2');

    // Ensure it starts with http/https
    if (!fixedUrl.startsWith('http')) {
        return null;
    }

    return fixedUrl;
}

export function mapM3UToMediaItem(entry: M3UEntry): MediaItem {
    // Determine media type based on group or title
    const isTV = entry.group?.toUpperCase().includes('SERIES') || entry.group?.toUpperCase().includes('SRS');

    return {
        id: generateId(entry.title + entry.url),
        title: entry.title,
        original_title: entry.rawTitle,
        overview: `Category: ${entry.group}`,
        poster_path: normalizeUrl(entry.logo),
        backdrop_path: normalizeUrl(entry.logo), // Use logo as backdrop if available
        release_date: new Date().toISOString(), // Placeholder
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        media_type: "movie", // Default to movie for now, or "tv" if we can determine it
        adult: false,
        // Add custom property for video URL if needed by the player component
        // For now, we are just mapping to MediaItem for display
    } as MediaItem;
}
