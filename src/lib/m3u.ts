import fs from 'fs';
import path from 'path';
import { generateId } from "@/lib/m3uMapper";

export interface M3UEntry {
    title: string;
    logo?: string;
    group?: string;
    url: string;
    rawTitle: string;
    epgId?: string;
    currentProgram?: {
        title: string;
        description: string;
        start: string;
        end: string;
        progress: number;
    };
    nextProgram?: {
        title: string;
    };
}

let cachedEntries: M3UEntry[] | null = null;

const CACHE_FILE_PATH = process.env.VERCEL ? path.join('/tmp', 'playlist.m3u') : path.join(process.cwd(), 'src', 'm3u', 'playlist.m3u');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const FETCH_TIMEOUT_MS = 30000; // 30 seconds

let fetchPromise: Promise<void> | null = null;

export async function ensureM3UFile(): Promise<string | null> {
    const m3uUrl = process.env.IPTV_M3U_URL;

    if (!m3uUrl) {
        console.warn("⚠️ IPTV_M3U_URL is not set. M3U features will be disabled.");
        return null;
    }

    // Ensure directory exists (only locally or in /tmp)
    const dir = path.dirname(CACHE_FILE_PATH);
    if (!fs.existsSync(dir)) {
        try {
            fs.mkdirSync(dir, { recursive: true });
        } catch (e) {
            console.error(`Error creating directory ${dir}:`, e);
        }
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

    if (shouldFetch) {
        // Prevent multiple concurrent fetches in the same worker/process
        if (fetchPromise) {
            console.log('⏳ Waiting for existing M3U fetch to complete...');
            await fetchPromise;
        } else {
            fetchPromise = (async () => {
                console.log(`📡 Fetching M3U from ${m3uUrl}...`);
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

                    const response = await fetch(m3uUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        console.error(`❌ Failed to fetch M3U: ${response.status} ${response.statusText}`);
                    } else {
                        const text = await response.text();
                        fs.writeFileSync(CACHE_FILE_PATH, text);
                        console.log('✅ M3U file cached successfully.');
                        // Clear cache after update
                        cachedEntries = null;
                        cachedGroupIndex = null;
                        cachedCategoriesVOD = null;
                        cachedCategoriesLive = null;
                    }
                } catch (error) {
                    const message = error instanceof Error && error.name === 'AbortError'
                        ? 'Fetch timed out'
                        : (error instanceof Error ? error.message : "Unknown error");
                    console.error('❌ Error fetching M3U:', message);
                } finally {
                    fetchPromise = null;
                }
            })();
            await fetchPromise;
        }
    }

    if (fs.existsSync(CACHE_FILE_PATH)) {
        return CACHE_FILE_PATH;
    }

    // Try fallback local file only if it actually exists (it's often gitignored)
    const fallbackPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    if (fs.existsSync(fallbackPath)) {
        console.log('Using fallback local file.');
        return fallbackPath;
    }

    return null;
}

export function parseM3U(filePath: string | null): M3UEntry[] {
    if (!filePath) return [];
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
                const epgIdMatch = metadata.match(/tvg-id="([^"]+)"/);

                const rawTitle = titleMatch ? titleMatch[1].trim() : 'Unknown';
                const logo = logoMatch ? logoMatch[1] : undefined;
                const group = groupMatch ? groupMatch[1] : undefined;
                const epgId = epgIdMatch ? epgIdMatch[1] : undefined;

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
                        epgId,
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
        .replace(/[^\p{L}\p{N}\s]/gu, '') // Remove special chars but keep Unicode letters and numbers
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
}

export async function findStream(movieTitle: string): Promise<M3UEntry | undefined> {
    const m3uPath = await ensureM3UFile();
    if (!m3uPath) return undefined;
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
    if (!m3uPath) return [];
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
    if (!m3uPath) {
        cachedGroupIndex = new Map();
        cachedCategoriesVOD = [];
        cachedCategoriesLive = [];
        return;
    }
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
    const channels = cachedGroupIndex?.get(category) || [];
    return channels.map(enhanceWithMockEPG);
}

function enhanceWithMockEPG(entry: M3UEntry): M3UEntry {
    // Determine mock programs based on title to keep it consistent-ish
    const hash = generateId(entry.title);
    const programs = [
        { title: "Match en direct : Juventus Vs Ac Milan", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
        { title: "Journal Télévisé", desc: "Les dernières actualités nationales et internationales." },
        { title: "Film: Inception", desc: "Un voleur qui subtilise des secrets d'entreprise à travers l'utilisation de la technologie de partage de rêves." },
        { title: "Documentaire: Planète Terre", desc: "Une exploration des paysages les plus spectaculaires de notre planète." }
    ];

    const currentIdx = hash % programs.length;
    const nextIdx = (hash + 1) % programs.length;

    return {
        ...entry,
        currentProgram: {
            title: programs[currentIdx].title,
            description: programs[currentIdx].desc,
            start: "20:00",
            end: "22:00",
            progress: 45 // 45% progress
        },
        nextProgram: {
            title: programs[nextIdx].title
        }
    };
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

// Helper to check if a channel is VOD or Series
function isVODOrSeries(entry: M3UEntry): boolean {
    if (!entry.group) return false;
    return isVODGroup(entry.group);
}

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

// === LANGUAGE / FLAGS LOGIC ===

const LANGUAGE_FLAGS: Record<string, string> = {
    'AR': '🇸🇦', 'ARABIC': '🇸🇦',
    'FR': '🇫🇷', 'FRENCH': '🇫🇷',
    'EN': '🇺🇸', 'ENGLISH': '🇺🇸',
    'DE': '🇩🇪', 'GERMAN': '🇩🇪',
    'ES': '🇪🇸', 'SPANISH': '🇪🇸',
    'IT': '🇮🇹', 'ITALIAN': '🇮🇹', 'ITALY': '🇮🇹',
    'TR': '🇹🇷', 'TURKISH': '🇹🇷',
    'RU': '🇷🇺', 'RUSSIAN': '🇷🇺',
    'PT': '🇵🇹', 'PORTUGUESE': '🇵🇹',
    'NL': '🇳🇱', 'DUTCH': '🇳🇱',
    'PL': '🇵🇱', 'POLISH': '🇵🇱',
    'CH': '🇨🇳', 'CHINESE': '🇨🇳',
    'UK': '🇬🇧',
    'US': '🇺🇸',
    'CA': '🇨🇦',
    'IN': '🇮🇳', 'HINDI': '🇮🇳', 'INDIA': '🇮🇳',
    'LATINO': '🇲🇽',
    'EXYU': '🇧🇦',
    'ALB': '🇦🇱', 'ALBANIA': '🇦🇱',
    'BG': '🇧🇬', 'BULGARIAN': '🇧🇬',
    'RO': '🇷🇴', 'ROMANIAN': '🇷🇴',
    'MK': '🇲🇰', 'MACEDONIAN': '🇲🇰',
    'GR': '🇬🇷', 'GREEK': '🇬🇷',
    'ID': '🇮🇩', 'INDONESIA': '🇮🇩',
    'JP': '🇯🇵', 'JAPAN': '🇯🇵', 'JAPANESE': '🇯🇵',
    'KO': '🇰🇷', 'KOREA': '🇰🇷', 'KOREAN': '🇰🇷',
    'VN': '🇻🇳', 'VIETNAM': '🇻🇳', 'VIETNAMESE': '🇻🇳',
    'TH': '🇹🇭', 'THAILAND': '🇹🇭', 'THAI': '🇹🇭',
    'MY': '🇲🇾', 'MALAYSIA': '🇲🇾', 'MALAY': '🇲🇾',
    'IR': '🇮🇷', 'IRAN': '🇮🇷', 'PERSIAN': '🇮🇷', 'FA': '🇮🇷', 'FARSI': '🇮🇷', 'PR': '🇮🇷',
    'SE': '🇸🇪', 'SWEDEN': '🇸🇪', 'SWEDISH': '🇸🇪',
    'SC': '❄️', 'SCANDINAVIA': '❄️', 'SCANDINAVIAN': '❄️',
};

function getFlaggedLanguage(lang: string): string {
    const key = lang.toUpperCase().trim();
    if (LANGUAGE_FLAGS[key]) {
        return `${LANGUAGE_FLAGS[key]} ${key}`;
    }
    return lang;
}

const SPACE_SEPARATOR_BLOCKLIST = new Set(['IT', 'IN', 'US', 'AT', 'TO', 'IS', 'ON', 'AN', 'WE', 'MY', 'HE', 'ME', 'AS', 'BY', 'OF', 'OR', 'SO', 'UP', 'ID', 'SE']);

function replaceLanguageWrapper(text: string): string {
    // 1. Check for standard "CODE - " or "CODE | " (Strong signal)
    let match = text.match(/^([A-Z]{2,10})\s*[-|]\s*(.+)/i);
    if (match) {
        const langCode = match[1].toUpperCase();
        const rest = match[2];
        const flag = LANGUAGE_FLAGS[langCode];
        if (flag) {
            return `${flag} ${rest}`;
        }
    }

    // 2. Check for "CODE " (Weak signal, space only)
    // We only allow this for known flags that are NOT common words in the blocklist
    match = text.match(/^([A-Z]{2,10})\s+(.+)/i);
    if (match) {
        const langCode = match[1].toUpperCase();
        const rest = match[2]; // The rest of the title

        // Check if valid flag and not blocked
        if (LANGUAGE_FLAGS[langCode] && !SPACE_SEPARATOR_BLOCKLIST.has(langCode)) {
            return `${LANGUAGE_FLAGS[langCode]} ${rest}`;
        }
    }

    return text;
}

// Get grouped Movies
export async function getGroupedMovies(): Promise<{ language: string; categories: string[] }[]> {
    await ensureDataLoaded();
    const grouped = new Map<string, Set<string>>();

    if (cachedCategoriesVOD) {
        for (const cat of cachedCategoriesVOD) {
            const isSeries = cat.toUpperCase().includes('SRS') || cat.toUpperCase().includes('SERIES');

            if (!isSeries && cat.startsWith('VOD |')) {
                const parts = cat.split('|');
                if (parts.length >= 2) {
                    let language = parts[1].trim();
                    // Normalize key for grouping logic
                    // Take first part if dash implies sub-spec
                    let langKey = language.split('-')[0].trim();
                    langKey = langKey.split('[')[0].trim();

                    // Standardize keys to map common ones (EN -> ENGLISH) so they group together
                    // BUT for display we want to flagify. 

                    let normalized = langKey.toUpperCase();
                    if (normalized === 'EN') normalized = 'ENGLISH';
                    if (normalized === 'FR') normalized = 'FRENCH';
                    if (normalized === 'DE') normalized = 'GERMAN';
                    if (normalized === 'ES') normalized = 'SPANISH';
                    if (normalized === 'IT') normalized = 'ITALIAN';

                    const displayLang = getFlaggedLanguage(normalized);

                    if (!grouped.has(displayLang)) {
                        grouped.set(displayLang, new Set());
                    }
                    grouped.get(displayLang)!.add(cat);
                }
            }
        }
    }

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
                const parts = cat.split('|');
                if (parts.length >= 2) {
                    let langKey = parts[1].trim();
                    langKey = langKey.split('-')[0].trim();
                    langKey = langKey.split('[')[0].trim();

                    let normalized = langKey.toUpperCase();
                    if (normalized === 'EN') normalized = 'ENGLISH';
                    if (normalized === 'FR') normalized = 'FRENCH';
                    if (normalized === 'DE') normalized = 'GERMAN';
                    if (normalized === 'ES') normalized = 'SPANISH';
                    if (normalized === 'IT') normalized = 'ITALIAN';

                    const displayLang = getFlaggedLanguage(normalized);

                    if (!grouped.has(displayLang)) {
                        grouped.set(displayLang, new Set());
                    }
                    grouped.get(displayLang)!.add(cat);
                }
            }
        }
    }

    const result = Array.from(grouped.entries()).map(([language, categories]) => ({
        language,
        categories: Array.from(categories).sort()
    }));

    return result.sort((a, b) => a.language.localeCompare(b.language));
}

// Get M3U Entry by ID (synthetic)
export async function getM3UEntryById(id: number): Promise<M3UEntry | undefined> {
    await ensureDataLoaded();
    const m3uPath = await ensureM3UFile();
    if (!m3uPath) return undefined;
    const entries = parseM3U(m3uPath);

    const entry = entries.find(entry => generateId(entry.title + entry.url) === id);
    if (entry) return entry;
    // Series support needed for ID search?
    return undefined;
}

export interface SeriesInfo {
    language?: string;
    name: string;
    cleanTitle: string;
    season: number;
    episode: number;
}

export interface M3USeries {
    id: number;
    title: string;
    poster?: string;
    group?: string;
    episodes: M3UEntry[];
}

export function parseSeriesInfo(title: string): SeriesInfo | null {
    const match = title.match(/(.+?)\s+S(\d+)\s*[-_]?\s*E(\d+)/i);
    if (match) {
        let name = match[1].trim();
        // Flagify the series name
        name = replaceLanguageWrapper(name);

        return {
            name: name,
            cleanTitle: name, // Approximation
            season: parseInt(match[2]),
            episode: parseInt(match[3])
        };
    }
    return null;
}

export async function searchM3USeries(query: string): Promise<(M3UEntry | M3USeries)[]> {
    const m3uPath = await ensureM3UFile();
    if (!m3uPath) return [];
    const entries = parseM3U(m3uPath);
    const normalizedQuery = normalizeTitle(query);

    if (!normalizedQuery) return [];

    const matchingEntries = entries.filter(entry => entry.title.toLowerCase().includes(normalizedQuery.toLowerCase()));
    const seriesMap = new Map<string, M3USeries>();
    const uniqueItems: (M3UEntry | M3USeries)[] = [];

    matchingEntries.forEach(entry => {
        const isSeriesGroup = entry.group && isVODGroup(entry.group);
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

export async function getUniqueSeriesByCategory(category: string): Promise<(M3UEntry | M3USeries)[]> {
    const entries = await getChannelsByCategory(category);
    const seriesMap = new Map<string, M3USeries>();
    const uniqueItems: (M3UEntry | M3USeries)[] = [];

    entries.forEach(entry => {
        const info = parseSeriesInfo(entry.title);
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

export async function getM3USeriesById(id: number): Promise<M3USeries | undefined> {
    await ensureDataLoaded();
    const m3uPath = await ensureM3UFile();
    if (!m3uPath) return undefined;
    const entries = parseM3U(m3uPath);

    let targetSeriesName: string | null = null;
    let targetSeries: M3USeries | null = null;

    for (const entry of entries) {
        if (!entry.group || !isVODGroup(entry.group)) continue;
        const info = parseSeriesInfo(entry.title);
        if (info) {
            // Flagify inside parsing now
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
                break;
            }
        }
    }

    if (targetSeries && targetSeriesName) {
        for (const entry of entries) {
            if (!entry.group || !isVODGroup(entry.group)) continue;
            const info = parseSeriesInfo(entry.title);
            if (info && info.name === targetSeriesName) {
                targetSeries.episodes.push(entry);
            }
        }

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
