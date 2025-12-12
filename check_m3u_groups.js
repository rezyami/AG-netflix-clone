const fs = require('fs');
const path = require('path');

const m3uPath = path.join('src', 'm3u', 'playlist.m3u');
try {
    const content = fs.readFileSync(m3uPath, 'utf-8');
    const matches = content.match(/group-title="([^"]+)"/g);
    const groups = new Set(matches ? matches.map(m => m.split('"')[1]) : []);
    console.log(JSON.stringify([...groups].sort(), null, 2));
} catch (e) {
    console.error('Error:', e.message);
}
