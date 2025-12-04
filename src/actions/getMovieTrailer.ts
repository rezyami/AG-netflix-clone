"use server";

import { tmdb } from "@/lib/tmdb";

export async function getMovieTrailer(mediaType: "movie" | "tv", id: number) {
    try {
        const details = await tmdb.getDetails(mediaType, id);
        const video = details.videos.results.find(
            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
        );
        return video ? video.key : null;
    } catch (error) {
        console.error("Failed to fetch video", error);
        return null;
    }
}
