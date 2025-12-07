const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'm3u', 'tv_channels_F021502_plusP.m3u');

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /tvg-logo="([^"]+)"/g;
  let match;
  const hostnames = new Set();

  while ((match = regex.exec(content)) !== null) {
    try {
      const url = new URL(match[1]);
      hostnames.add(url.hostname);
    } catch (e) {
      // Ignore invalid URLs
    }
  }

  console.log(JSON.stringify(Array.from(hostnames), null, 2));
} catch (err) {
  console.error('Error reading file:', err);
}
