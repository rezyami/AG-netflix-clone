import { parseSeriesInfo } from "@/lib/m3u";

// Test the parser with the example
const testTitle = "CH - Taiwan Crime Stories S01 E01";
const info = parseSeriesInfo(testTitle);

if (info) {
    console.log("Parsed successfully!");
    console.log("Language:", info.language); // "CH"
    console.log("Full Name:", info.name); // "CH - Taiwan Crime Stories"
    console.log("Clean Title:", info.cleanTitle); // "Taiwan Crime Stories"
    console.log("Season:", info.season); // 1
    console.log("Episode:", info.episode); // 1

    console.log("\n✅ Use cleanTitle for TMDB searches:");
    console.log(`Search TMDB for: "${info.cleanTitle}"`);
    console.log("This will match: https://www.themoviedb.org/tv/197294");
    console.log("Trailer key from URL: nTuzLt-n-FM");
    console.log("YouTube URL: https://www.youtube.com/watch?v=nTuzLt-n-FM");
}
