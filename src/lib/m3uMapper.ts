import { M3UEntry } from "@/types/m3u";
import { MediaItem } from "@/types/tmdb";
import { replaceLanguageWrapper } from "./languages";

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
    const isTV = entry.group?.toUpperCase().includes('SERIES') ||
        entry.group?.toUpperCase().includes('SRS') ||
        entry.group?.toUpperCase().includes('SHOWS');

    const title = replaceLanguageWrapper(entry.rawTitle);
    const date = new Date().toISOString();

    return {
        id: generateId(entry.title + entry.url),
        title: title,
        name: title,
        original_title: entry.rawTitle,
        original_name: entry.rawTitle,
        overview: `Category: ${entry.group}`,
        poster_path: normalizeUrl(entry.logo),
        backdrop_path: normalizeUrl(entry.logo),
        release_date: date,
        first_air_date: date,
        vote_average: 0,
        vote_count: 0,
        popularity: 0,
        genre_ids: [],
        media_type: isTV ? "tv" : "movie",
        adult: false,
    } as any;
}
