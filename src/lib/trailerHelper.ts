"use server";

import { tmdb } from "./tmdb";

/**
 * Get trailer for a movie or TV show using clean title
 * @param cleanTitle The clean title without language prefix, season, or episode
 * @param mediaType "movie" or "tv"
 * @param year Optional year for better matching
 */
export async function getTrailerForTitle(
    cleanTitle: string,
    mediaType: "movie" | "tv" = "tv",
    year?: number
): Promise<string | null> {
    try {
        // Search TMDB using the clean title
        const searchResults = await tmdb.search(cleanTitle);

        if (!searchResults.results || searchResults.results.length === 0) {
            console.log(`No results found for: ${cleanTitle}`);
            return null;
        }

        // Filter results by media type
        const filteredResults = searchResults.results.filter(
            (result: any) => result.media_type === mediaType
        );

        if (filteredResults.length === 0) {
            console.log(`No ${mediaType} results found for: ${cleanTitle}`);
            return null;
        }

        // Get the first result (most relevant)
        const firstResult = filteredResults[0];
        const tmdbId = firstResult.id;

        // Get the details including videos
        const details = await tmdb.getDetails(mediaType, tmdbId);

        if (!details) return null;

        if (details.videos && details.videos.results) {
            // Find trailer
            const trailer = details.videos.results.find(
                (video: any) =>
                    video.type === "Trailer" &&
                    video.site === "YouTube"
            );

            if (trailer) {
                return `https://www.youtube.com/watch?v=${trailer.key}`;
            }
        }

        return null;
    } catch (error) {
        console.error(`Error fetching trailer for ${cleanTitle}:`, error);
        return null;
    }
}
