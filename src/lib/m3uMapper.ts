import { M3UEntry } from "./m3u";
import { MediaItem } from "@/types/tmdb";

// Helper to generate a deterministic ID from a string
function generateId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

export function mapM3UToMediaItem(entry: M3UEntry): MediaItem {
    // Determine media type based on group or title
    const isTV = entry.group?.toUpperCase().includes('SERIES') || entry.group?.toUpperCase().includes('SRS');

    return {
        id: generateId(entry.title),
        title: entry.title,
        original_title: entry.rawTitle,
        overview: `Category: ${entry.group}`,
        poster_path: entry.logo || null,
        backdrop_path: entry.logo || null, // Use logo as backdrop if available
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
