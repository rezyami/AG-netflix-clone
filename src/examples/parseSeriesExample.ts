import { parseSeriesInfo } from "@/lib/m3u";

// Example usage of the enhanced parseSeriesInfo
const examples = [
    "CH - Taiwan Crime Stories S01 E01",
    "FR - L'EXORCISTE S02 E01",
    "Breaking Bad S01 E01",
    "EN - Game of Thrones S05 E10",
];

examples.forEach((title) => {
    const info = parseSeriesInfo(title);
    if (info) {
        console.log("Original Title:", title);
        console.log("Parsed Info:", {
            language: info.language || "Not specified",
            fullName: info.name,
            cleanTitle: info.cleanTitle, // Use this for TMDB searches!
            season: info.season,
            episode: info.episode,
        });
        console.log("---");
    }
});

/* Expected output:
Original Title: CH - Taiwan Crime Stories S01 E01
Parsed Info: {
  language: 'CH',
  fullName: 'CH - Taiwan Crime Stories',
  cleanTitle: 'Taiwan Crime Stories', // <- Use this for TMDB!
  season: 1,
  episode: 1
}
---
Original Title: FR - L'EXORCISTE S02 E01
Parsed Info: {
  language: 'FR',
  fullName: 'FR - L\'EXORCISTE',
  cleanTitle: 'L\'EXORCISTE', // <- Use this for TMDB!
  season: 2,
  episode: 1
}
---
Original Title: Breaking Bad S01 E01
Parsed Info: {
  language: 'Not specified',
  fullName: 'Breaking Bad',
  cleanTitle: 'Breaking Bad', // <- Use this for TMDB!
  season: 1,
  episode: 1
}
---
*/
