
const fs = require('fs');
const path = require('path');

// Mock normalizeTitle from src/lib/m3u.ts
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .replace(/^(ear|ar|fr|en)\s*-\s*/i, '') // Remove prefixes like "EAR - ", "AR - "
        .replace(/\s*-\s*\d{4}.*$/, '') // Remove year and anything after (e.g. " - 2019")
        .replace(/\[.*?\]/g, '') // Remove brackets content
        .replace(/[^\w\s]/g, '') // Remove special chars
        .replace(/\s+/g, ' ') // Collapse spaces
        .trim();
}

const m3uLine = '#EXTINF:-1 tvg-id="" tvg-name="EN - Spirited Away - 2001" tvg-logo="https://image.tmdb.org/t/p/w600_and_h900_bestv2/2TeJfUZMGolfDdW6DKhfIWqvq8y.jpg" group-title="VOD | EN - ANIME",EN - Spirited Away - 2001';
const metadata = m3uLine.substring(8);
const titleMatch = metadata.match(/,(.+)$/);
const rawTitle = titleMatch ? titleMatch[1].trim() : 'Unknown';
const normalized = normalizeTitle(rawTitle);

console.log('Raw Title:', rawTitle);
console.log('Normalized Title:', normalized);

const searchTitle = "Spirited Away";
const normalizedSearch = normalizeTitle(searchTitle);
console.log('Search Title:', searchTitle);
console.log('Normalized Search:', normalizedSearch);

console.log('Match:', normalized === normalizedSearch);
