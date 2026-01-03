import { MediaItem, MediaDetails } from "@/types/tmdb";
import { tmdb } from "./tmdb";
import fs from 'fs';
import path from 'path';
import { getTMDBLanguageCode } from "./languages";

const CACHE_FILE = path.join(process.cwd(), 'src', 'lib', 'tmdb_m3u_cache.json');

interface CacheData {
    [key: string]: {
        tmdbId: number;
        mediaType: "movie" | "tv";
        timestamp: number;
        details?: MediaDetails;
    };
}

let cache: CacheData = {};

// Load cache on startup
try {
    if (fs.existsSync(CACHE_FILE)) {
        cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
} catch (e) {
    console.error("Failed to load TMDB M3U cache", e);
}

function saveCache() {
    try {
        const dir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
        console.error("Failed to save TMDB M3U cache", e);
    }
}

function cleanTitleForSearch(title: string): string {
    return title
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Remove emojis and flag symbols
        .replace(/[\[\(].*?[\]\)]/g, '') // Remove brackets/parentheses content
        .replace(/\b(4K|2K|1080P|720P|HD|UHD|MPEG|MULTI|DUAL|HEVC|H264|H265|X264|X265|BLURAY|WEB-DL|AMZN|NF|AR|FR|EN|DE|ES|IT|TR|RU|PT|NL|PL|CH|UK|US|CA|IN|LATINO|EXYU|ALB|BG|RO|MK|GR|ID|JP|KO|VN|TH|MY|IR|SE|BR|BE|AT|HU|CZ|SK|IL|PK|SC)\b/gi, '') // Remove tech/lang tags
        .replace(/\s+/g, ' ')
        .replace(/^\s+|\s+$/g, '') // Trim
        .replace(/\d{4}$/, '') // Remove trailing year
        .trim();
}

function detectLanguageHint(item: MediaItem): string | undefined {
    const itemTitle = (item as any).title || (item as any).name || "";
    const itemOriginalTitle = (item as any).original_title || (item as any).original_name || itemTitle;
    const overview = (item as any).overview || "";

    // Check original title for bracketed language or flag
    let hint = getTMDBLanguageCode(itemOriginalTitle);
    if (hint) return hint;

    // Check title (which might be the translated one)
    hint = getTMDBLanguageCode(itemTitle);
    if (hint) return hint;

    // Check overview (often contains "Category: VOD | FRENCH")
    hint = getTMDBLanguageCode(overview);
    return hint;
}

/**
 * Tries to find a matching TMDB item for an M3U media item and enriches it.
 */
export async function enrichMediaItem(item: MediaItem): Promise<MediaItem> {
    const itemTitle = (item as any).title || (item as any).name;
    const itemOriginalTitle = (item as any).original_title || (item as any).original_name || itemTitle;

    const cleanTitle = cleanTitleForSearch(itemOriginalTitle);
    const cacheKey = `${cleanTitle}_${item.media_type}`;

    // Check cache
    if (cache[cacheKey]) {
        const cached = cache[cacheKey];
        // If it's less than 30 days old and has details, return it
        if (Date.now() - cached.timestamp < 30 * 24 * 60 * 60 * 1000 && cached.details) {
            const details = cached.details;
            return {
                ...item,
                ...details,
                id: item.id, // Keep M3U ID
                tmdb_id: cached.tmdbId, // Explicitly keep TMDB ID
                media_type: cached.mediaType,
                poster_path: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : (item as any).poster_path,
                backdrop_path: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : (item as any).backdrop_path,
                trailer_key: details.videos?.results.find(v => v.type === "Trailer" && v.site === "YouTube")?.key
            } as any;
        }
    }

    try {
        const langHint = detectLanguageHint(item);
        console.log(`Searching TMDB for: "${cleanTitle}" (Hint: ${langHint || 'None'})`);

        let searchResults = await tmdb.search(cleanTitle, langHint);

        // Fallback to English if no results with localized search
        if (searchResults.results.length === 0 && langHint && langHint !== 'en-US') {
            console.log(`No results for "${cleanTitle}" with hint ${langHint}, falling back to English search.`);
            searchResults = await tmdb.search(cleanTitle, 'en-US');
        }

        if (searchResults.results.length > 0) {
            // Pick the best match
            // We search for a match in the results
            const match = searchResults.results.find(res => {
                const resTitle = (res as any).title || (res as any).name || "";
                const resOrigTitle = (res as any).original_title || (res as any).original_name || "";

                const lowerTitle = cleanTitle.toLowerCase();
                const lowerResTitle = resTitle.toLowerCase();
                const lowerResOrigTitle = resOrigTitle.toLowerCase();

                return lowerTitle === lowerResTitle ||
                    lowerTitle === lowerResOrigTitle ||
                    lowerResTitle.includes(lowerTitle) ||
                    lowerTitle.includes(lowerResTitle);
            }) || searchResults.results[0];

            if (match) {
                const details = await tmdb.getDetails(match.media_type as any, match.id);

                // Update cache
                cache[cacheKey] = {
                    tmdbId: match.id,
                    mediaType: match.media_type as any,
                    timestamp: Date.now(),
                    details
                };
                saveCache();

                return {
                    ...item,
                    ...details,
                    id: item.id, // Keep M3U ID
                    tmdb_id: match.id, // Explicitly keep TMDB ID
                    media_type: match.media_type as any,
                    poster_path: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : (item as any).poster_path,
                    backdrop_path: details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : (item as any).backdrop_path,
                    // Store trailer if available
                    trailer_key: details.videos?.results.find(v => v.type === "Trailer" && v.site === "YouTube")?.key
                } as any;
            }
        }
    } catch (error) {
        console.error(`Error enriching item "${itemTitle}":`, error);
    }

    return item;
}

/**
 * Enriches a list of MediaItems in parallel with a limit
 */
export async function enrichMediaItems(items: MediaItem[], limit: number = 5): Promise<MediaItem[]> {
    const results: MediaItem[] = [];
    for (let i = 0; i < items.length; i += limit) {
        const batch = items.slice(i, i + limit);
        const enrichedBatch = await Promise.all(batch.map(item => enrichMediaItem(item)));
        results.push(...enrichedBatch);
    }
    return results;
}
