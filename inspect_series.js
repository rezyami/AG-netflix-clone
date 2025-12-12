const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function processLineByLine() {
    const fileStream = fs.createReadStream(path.join('src', 'm3u', 'playlist.m3u'));

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let count = 0;
    for await (const line of rl) {
        if (line.includes('SRS |')) {
            console.log(line);
            count++;
            if (count >= 20) break;
        }
    }
}

processLineByLine();
