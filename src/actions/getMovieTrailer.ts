"use server";

import { tmdb } from "@/lib/tmdb";

export async function getMovieTrailer(mediaType: "movie" | "tv", id: number) {
    // If ID is very large, it's likely a generated M3U ID hash, not a TMDB ID.
    // TMDB IDs are currently all under 2 million.
    if (id > 5000000) {
        return null;
    }

    try {
        const details = await tmdb.getDetails(mediaType, id);
        const video = details.videos.results.find(
            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        return video ? video.key : null;
    } catch (error: any) {
        if (error.message?.includes("404")) {
            console.warn(`Trailer not found on TMDB for ${mediaType} ID: ${id}`);
        } else {
            console.error("Failed to fetch video", error);
        }
        return null;
    }
}
