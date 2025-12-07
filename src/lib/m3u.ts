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

export function findStream(movieTitle: string): M3UEntry | undefined {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);
    const normalizedMovieTitle = normalizeTitle(movieTitle);

    // Try exact match first
    const exactMatch = entries.find(entry => entry.title === normalizedMovieTitle);
    if (exactMatch) return exactMatch;

    // Try fuzzy match (contains)
    return entries.find(entry => entry.title.includes(normalizedMovieTitle) || normalizedMovieTitle.includes(entry.title));
}

// Helper to check if a channel is Live TV (not VOD or Series)
function isLiveTVChannel(entry: M3UEntry): boolean {
    if (!entry.group) return false;
    const group = entry.group.toUpperCase();
    return !group.includes('SRS') && !group.includes('VOD') && !entry.rawTitle.startsWith('#####');
}

// Get all unique channel categories from M3U
export function getAllChannelCategories(): string[] {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);

    const categories = new Set<string>();
    entries.forEach(entry => {
        if (isLiveTVChannel(entry)) {
            categories.add(entry.group!);
        }
    });

    return Array.from(categories).sort();
}

// Get all channels for a specific category
export function getChannelsByCategory(category: string): M3UEntry[] {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);

    return entries.filter(entry =>
        entry.group === category &&
        isLiveTVChannel(entry)
    );
}

// Get category statistics
export function getCategoryStats(): { category: string; count: number }[] {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);

    const categoryMap = new Map<string, number>();

    entries.forEach(entry => {
        if (isLiveTVChannel(entry)) {
            categoryMap.set(entry.group!, (categoryMap.get(entry.group!) || 0) + 1);
        }
    });

    return Array.from(categoryMap.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => a.category.localeCompare(b.category));
}

// Helper to check if a channel is VOD or Series
function isVODOrSeries(entry: M3UEntry): boolean {
    if (!entry.group) return false;
    const group = entry.group.toUpperCase();
    // It is VOD or Series if it is NOT Live TV (so we invert the logic somewhat, or check for specific keywords if known)
    // Based on previous logic: Live TV was !SRS && !VOD. So VOD/Series is SRS or VOD.
    return group.includes('SRS') || group.includes('VOD') || group.includes('SERIES') || group.includes('MOVIES');
}

// Get all unique VOD/Series categories from M3U
export function getVODAndSeriesCategories(): string[] {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);

    const categories = new Set<string>();
    entries.forEach(entry => {
        if (isVODOrSeries(entry)) {
            categories.add(entry.group!);
        }
    });

    return Array.from(categories).sort();
}

// Get all VOD/Series items for a specific category
export function getVODAndSeriesByCategory(category: string): M3UEntry[] {
    const m3uPath = path.join(process.cwd(), 'src', 'm3u', 'tv_channels_F021502_plus.m3u');
    const entries = parseM3U(m3uPath);

    return entries.filter(entry =>
        entry.group === category &&
        isVODOrSeries(entry)
    );
}
