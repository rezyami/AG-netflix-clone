import fs from 'fs';
import path from 'path';

export interface M3UEntry {
    title: string;
    logo?: string;
    group?: string;
    url: string;
    rawTitle: string;
}

let cachedEntries: M3UEntry[] | null = null;

const CACHE_FILE_PATH = path.join(process.cwd(), 'src', 'm3u', 'playlist.m3u');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function ensureM3UFile(): Promise<string> {
    const m3uUrl = process.env.IPTV_M3U_URL;

    // Ensure directory exists
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    let shouldFetch = false;

    if (!fs.existsSync(CACHE_FILE_PATH)) {
        shouldFetch = true;
    } else {
        const stats = fs.statSync(CACHE_FILE_PATH);
        const now = new Date().getTime();
        if (now - stats.mtimeMs > CACHE_DURATION_MS) {
            shouldFetch = true;
        }
    }

    if (shouldFetch && m3uUrl) {
        console.log('Fetching M3U from URL...');
        try {
            const response = await fetch(m3uUrl);
            if (!response.ok) throw new Error(`Failed to fetch M3U: ${response.statusText}`);
            const text = await response.text();
            fs.writeFileSync(CACHE_FILE_PATH, text);
            console.log('M3U file cached successfully.');
            // Clear cache after update
            cachedEntries = null;
            cachedGroupIndex = null;
            cachedCategoriesVOD = null;
            cachedCategoriesLive = null;
        } catch (error) {
            console.error('Error fetching M3U, falling back to existing cache if available:', error);
            if (!fs.existsSync(CACHE_FILE_PATH)) {
                // Determine fallback logic - maybe the original local file
                const fallbackPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
                if (fs.existsSync(fallbackPath)) {
                    console.log('Using fallback local file.');
                    return fallbackPath;
                }
                throw new Error('No M3U file available and fetch failed.');
            }
        }
    } else if (shouldFetch && !m3uUrl) {
        console.warn("IPTV_M3U_URL not set. Using local file if exists.");
        const fallbackPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
        if (fs.existsSync(fallbackPath)) {
            return fallbackPath;
        }
    }

    return fs.existsSync(CACHE_FILE_PATH) ? CACHE_FILE_PATH : path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
}

export function parseM3U(filePath: string): M3UEntry[] {
    if (cachedEntries) return cachedEntries;

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const lines = fileContent.split('\n');
        const entries: M3UEntry[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                // Parse metadata
                const metadata = line.substring(8);
                const titleMatch = metadata.match(/,(.+)$/);
                const logoMatch = metadata.match(/tvg-logo="([^"]+)"/);
                const groupMatch = metadata.match(/group-title="([^"]+)"/);

                const rawTitle = titleMatch ? titleMatch[1].trim() : 'Unknown';
                const logo = logoMatch ? logoMatch[1] : undefined;
                const group = groupMatch ? groupMatch[1] : undefined;

                // Get URL from next line
                let url = '';
                if (i + 1 < lines.length) {
                    url = lines[i + 1].trim();
                }

                if (url && !url.startsWith('#')) {
                    entries.push({
                        title: normalizeTitle(rawTitle),
                        rawTitle,
                        logo,
                        group,
                        url
                    });
                }
            }
        }

        cachedEntries = entries;
        return entries;
    } catch (error) {
        console.error('Error parsing M3U file:', error);
        return [];
    }
}

function normalizeTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/^(ear|ar|fr|en)\s*-\s*/i, '') // Remove prefixes like "EAR - ", "AR - "
        .replace(/\s*-\s*\d{4}.*$/, '') // Remove year and anything after (e.g. " - 2019")
        .replace(/\[.*?\]/g, '') // Remove brackets content like "[مدبلج مصري]"
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
}

export async function findStream(movieTitle: string): Promise<M3UEntry | undefined> {
    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);
    const normalizedMovieTitle = normalizeTitle(movieTitle);

    // Try exact match first
    const exactMatch = entries.find(entry => entry.title === normalizedMovieTitle);
    if (exactMatch) return exactMatch;

    // Try fuzzy match (contains)
    return entries.find(entry => entry.title.includes(normalizedMovieTitle) || normalizedMovieTitle.includes(entry.title));
}

export async function searchM3U(query: string): Promise<M3UEntry[]> {
    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);
    const normalizedQuery = normalizeTitle(query);

    if (!normalizedQuery) return [];

    return entries.filter(entry => entry.title.includes(normalizedQuery));
}

// Helper to check if a group name indicates VOD or Series
function isVODGroup(groupName: string): boolean {
    const group = groupName.toUpperCase();
    return group.includes('SRS') || group.includes('VOD') || group.includes('SERIES') || group.includes('MOVIES');
}

// Helper to check if a group name indicates Live TV
function isLiveTVGroup(groupName: string): boolean {
    const group = groupName.toUpperCase();
    return !group.includes('SRS') && !group.includes('VOD') && !groupName.startsWith('#####');
}

let cachedGroupIndex: Map<string, M3UEntry[]> | null = null;
let cachedCategoriesVOD: string[] | null = null;
let cachedCategoriesLive: string[] | null = null;

// Async loader
async function ensureDataLoaded() {
    if (cachedGroupIndex) return;

    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);

    cachedGroupIndex = new Map();
    const vodCats = new Set<string>();
    const liveCats = new Set<string>();

    entries.forEach(entry => {
        if (entry.group) {
            if (!cachedGroupIndex!.has(entry.group)) {
                cachedGroupIndex!.set(entry.group, []);

                // Categorize the group once
                if (isVODGroup(entry.group)) {
                    vodCats.add(entry.group);
                } else if (isLiveTVGroup(entry.group)) {
                    liveCats.add(entry.group);
                }
            }
            cachedGroupIndex!.get(entry.group)!.push(entry);
        }
    });

    cachedCategoriesVOD = Array.from(vodCats).sort();
    cachedCategoriesLive = Array.from(liveCats).sort();
}

// Get all unique channel categories from M3U
export async function getAllChannelCategories(): Promise<string[]> {
    await ensureDataLoaded();
    return cachedCategoriesLive || [];
}

// Get all channels for a specific category
export async function getChannelsByCategory(category: string): Promise<M3UEntry[]> {
    await ensureDataLoaded();
    return cachedGroupIndex?.get(category) || [];
}

// Get category statistics
export async function getCategoryStats(): Promise<{ category: string; count: number }[]> {
    await ensureDataLoaded();
    const stats: { category: string; count: number }[] = [];

    if (cachedCategoriesLive) {
        for (const cat of cachedCategoriesLive) {
            stats.push({
                category: cat,
                count: cachedGroupIndex?.get(cat)?.length || 0
            });
        }
    }

    return stats.sort((a, b) => a.category.localeCompare(b.category));
}

// Helper to check if a channel is VOD or Series (Legacy helper, kept if needed by other files, but implementation updated to use new string helper)
function isVODOrSeries(entry: M3UEntry): boolean {
    if (!entry.group) return false;
    return isVODGroup(entry.group);
}

// Get all unique VOD/Series categories from M3U
// Get all unique VOD/Series categories from M3U
export async function getVODAndSeriesCategories(): Promise<string[]> {
    await ensureDataLoaded();
    return cachedCategoriesVOD || [];
}

// Get all VOD/Series items for a specific category
export async function getVODAndSeriesByCategory(category: string): Promise<M3UEntry[]> {
    await ensureDataLoaded();
    return cachedGroupIndex?.get(category) || [];
}

// Get grouped Movies
export async function getGroupedMovies(): Promise<{ language: string; categories: string[] }[]> {
    await ensureDataLoaded();
    const grouped = new Map<string, Set<string>>();

    if (cachedCategoriesVOD) {
        for (const cat of cachedCategoriesVOD) {
            // Logic similar to Series but for VOD
            // Check if it's NOT a series category if possible, or just include all VOD?
            // The prompt implies "all pages that contains movie card", and simple "movies" route.
            // Usually VOD | LANGUAGE matches Movies. "SRS" matches Series.
            // Let's assume non-SRS VOD categories are movies.
            const isSeries = cat.toUpperCase().includes('SRS') || cat.toUpperCase().includes('SERIES');

            if (!isSeries && cat.startsWith('VOD |')) {
                // Extract language from "VOD | LANGUAGE [- OPTIONAL]"
                const parts = cat.split('|');
                if (parts.length >= 2) {
                    let language = parts[1].trim();

                    // Normalize language key: split by '-' or '[', take first part
                    language = language.split('-')[0].trim();
                    language = language.split('[')[0].trim();

                    // Same normalizations
                    if (language === 'EN') language = 'ENGLISH';
                    if (language === 'FR') language = 'FRENCH';
                    if (language === 'DE') language = 'GERMAN';
                    if (language === 'ES') language = 'SPANISH';
                    if (language === 'IT') language = 'ITALIAN';

                    if (!grouped.has(language)) {
                        grouped.set(language, new Set());
                    }
                    grouped.get(language)!.add(cat);
                }
            }
        }
    }

    // Convert to array and sort
    const result = Array.from(grouped.entries()).map(([language, categories]) => ({
        language,
        categories: Array.from(categories).sort()
    }));

    return result.sort((a, b) => a.language.localeCompare(b.language));
}

// Get grouped TV Series
export async function getGroupedTVSeries(): Promise<{ language: string; categories: string[] }[]> {
    await ensureDataLoaded();
    const grouped = new Map<string, Set<string>>();

    if (cachedCategoriesVOD) {
        for (const cat of cachedCategoriesVOD) {
            if (cat.startsWith('SRS |')) {
                // Extract language from "SRS | LANGUAGE [- OPTIONAL]"
                // e.g., "SRS | ENGLISH" or "SRS | ENGLISH - KIDS"
                const parts = cat.split('|');
                if (parts.length >= 2) {
                    let language = parts[1].trim();

                    // Normalize language key: split by '-' or '[', take first part
                    language = language.split('-')[0].trim();
                    language = language.split('[')[0].trim();

                    // Some manual normalizations if needed
                    if (language === 'EN') language = 'ENGLISH';
                    if (language === 'FR') language = 'FRENCH';
                    if (language === 'DE') language = 'GERMAN';
                    if (language === 'ES') language = 'SPANISH';
                    if (language === 'IT') language = 'ITALIAN';

                    if (!grouped.has(language)) {
                        grouped.set(language, new Set());
                    }
                    grouped.get(language)!.add(cat);
                }
            }
        }
    }

    // Convert to array and sort
    const result = Array.from(grouped.entries()).map(([language, categories]) => ({
        language,
        categories: Array.from(categories).sort()
    }));

    return result.sort((a, b) => a.language.localeCompare(b.language));
}

import { generateId } from "@/lib/m3uMapper";

// Get M3U Entry by ID (synthetic)
export async function getM3UEntryById(id: number): Promise<M3UEntry | undefined> {
    await ensureDataLoaded();
    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);

    // Check if it's a series ID first
    // This is a bit inefficient without an index, but we iterate to find a matching series representative
    // We need to iterate all entries, parse them, group them, and check if the group ID matches.
    // Optimization: We can check simple entry ID first.
    const entry = entries.find(entry => generateId(entry.title + entry.url) === id);
    if (entry) return entry;

    // If not a simple entry, it might be a series group ID. 
    // We need to find the series mapping.
    // For now, let's implement getM3USeriesById separately to keep this clean
    return undefined;
}

// Series Info Interface
export interface SeriesInfo {
    language?: string; // e.g., "CH", "FR", "EN"
    name: string; // Full name with language prefix (e.g., "CH - Taiwan Crime Stories")
    cleanTitle: string; // Title without language, season, episode (e.g., "Taiwan Crime Stories")
    season: number;
    episode: number;
}

export interface M3USeries {
    id: number; // Generated ID for the series
    title: string;
    poster?: string;
    group?: string;
    episodes: M3UEntry[];
}

// Helper to parse series info from title
export function parseSeriesInfo(title: string): SeriesInfo | null {
    // Regex for "Title Sxx Exx" or "Title Sxx Exx"
    // Also handles "Title Sxx - Exx" or similar variations
    // Example: "FR - L’EXORCISTE S02 E01" -> Name: "FR - L’EXORCISTE", S: 2, E: 1
    const match = title.match(/(.+?)\s+S(\d+)\s*[-_]?\s*E(\d+)/i);
    if (match) {
        return {
            name: match[1].trim(),
            season: parseInt(match[2]),
            episode: parseInt(match[3])
        };
    }
    return null;
}

// Search M3U returning grouped Series/Movies
export async function searchM3USeries(query: string): Promise<(M3UEntry | M3USeries)[]> {
    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);
    const normalizedQuery = normalizeTitle(query);

    if (!normalizedQuery) return [];

    // First find matching entries
    const matchingEntries = entries.filter(entry => entry.title.toLowerCase().includes(normalizedQuery.toLowerCase()));

    // Now group them if they belong to a series
    const seriesMap = new Map<string, M3USeries>();
    const uniqueItems: (M3UEntry | M3USeries)[] = [];

    // We only care about VOD/Series groups for this special "One Card" logic usually?
    // Or do we group everything? The prompt says "for serie show one card".

    // Logic: If entry has series info, group it. Else add as item.
    // BUT checking isVODGroup might be needed to avoid grouping Live TV channels that look like series?
    // Let's assume matches in VOD groups are what we want to group.

    matchingEntries.forEach(entry => {
        const isSeriesGroup = entry.group && isVODGroup(entry.group); // Only group if it's considered VOD content
        const info = isSeriesGroup ? parseSeriesInfo(entry.title) : null;

        if (info) {
            const seriesName = info.name;
            if (!seriesMap.has(seriesName)) {
                const seriesId = generateId(seriesName + "_SERIES_GROUP");
                const series: M3USeries = {
                    id: seriesId,
                    title: seriesName,
                    poster: entry.logo,
                    group: entry.group,
                    episodes: []
                };
                seriesMap.set(seriesName, series);
                uniqueItems.push(series);
            }
            seriesMap.get(seriesName)!.episodes.push(entry);
        } else {
            uniqueItems.push(entry);
        }
    });

    return uniqueItems;
}

// Get unique series for a category
export async function getUniqueSeriesByCategory(category: string): Promise<(M3UEntry | M3USeries)[]> {
    const entries = await getChannelsByCategory(category);
    const seriesMap = new Map<string, M3USeries>();
    const uniqueItems: (M3UEntry | M3USeries)[] = [];

    entries.forEach(entry => {
        const info = parseSeriesInfo(entry.title);
        if (info) {
            const seriesName = info.name;
            if (!seriesMap.has(seriesName)) {
                // Create new series entry
                const seriesId = generateId(seriesName + "_SERIES_GROUP");
                const series: M3USeries = {
                    id: seriesId,
                    title: seriesName,
                    poster: entry.logo,
                    group: entry.group,
                    episodes: []
                };
                seriesMap.set(seriesName, series);
                uniqueItems.push(series);
            }
            seriesMap.get(seriesName)!.episodes.push(entry);
        } else {
            // Not a recognized series format, add as single item
            uniqueItems.push(entry);
        }
    });

    return uniqueItems;
}

// Get M3U Series by ID
export async function getM3USeriesById(id: number): Promise<M3USeries | undefined> {
    await ensureDataLoaded();
    const m3uPath = await ensureM3UFile();
    const entries = parseM3U(m3uPath);

    // We have to iterate all entries to reconstruct the series grouping
    // This is slow for large playlists, but we filter by SRS groups to optimize slightly if possible.
    // Better: Iterate all entries, find if any series generates this ID.

    const seriesMap = new Map<string, M3USeries>();

    for (const entry of entries) {
        if (entry.group && isVODGroup(entry.group)) {
            const info = parseSeriesInfo(entry.title);
            if (info) {
                const seriesName = info.name;
                if (!seriesMap.has(seriesName)) {
                    const seriesId = generateId(seriesName + "_SERIES_GROUP");
                    // Optimization: check ID immediately
                    if (seriesId === id) {
                        // We found the series, but we need to collect ALL episodes.
                        // So we create it and continue loop to fill episodes.
                        seriesMap.set(seriesName, {
                            id: seriesId,
                            title: seriesName,
                            poster: entry.logo,
                            group: entry.group,
                            episodes: []
                        });
                    }
                }
                // If we have started tracking this series (because ID matched), add episode
                // But wait, we need to handle the case where we don't know the ID matches until we generate it.
                // Correct logic: We must group everything or filter smarter.
            }
        }
    }

    // optimized approach:
    // 1. We know the ID we are looking for.
    // 2. We scan entries. extract series name. Generate ID. matches? -> Found Target Series Name.
    // 3. Then scan all entries again (or in same pass) to collect episodes for that Target Series Name.

    let targetSeriesName: string | null = null;
    let targetSeries: M3USeries | null = null;

    // Pass 1: Find the series name
    for (const entry of entries) {
        if (!entry.group || !isVODGroup(entry.group)) continue;
        const info = parseSeriesInfo(entry.title);
        if (info) {
            const seriesId = generateId(info.name + "_SERIES_GROUP");
            if (seriesId === id) {
                targetSeriesName = info.name;
                targetSeries = {
                    id: seriesId,
                    title: info.name,
                    poster: entry.logo,
                    group: entry.group,
                    episodes: []
                };
                break; // Found the name, now we can just filter
            }
        }
    }

    if (targetSeries && targetSeriesName) {
        // Pass 2: Collect all episodes
        for (const entry of entries) {
            if (!entry.group || !isVODGroup(entry.group)) continue;
            const info = parseSeriesInfo(entry.title);
            if (info && info.name === targetSeriesName) {
                targetSeries.episodes.push(entry);
            }
        }

        // Sort episodes
        targetSeries.episodes.sort((a, b) => {
            const infoA = parseSeriesInfo(a.title);
            const infoB = parseSeriesInfo(b.title);
            if (!infoA || !infoB) return 0;
            if (infoA.season !== infoB.season) return infoA.season - infoB.season;
            return infoA.episode - infoB.episode;
        });

        return targetSeries;
    }

    return undefined;
}

