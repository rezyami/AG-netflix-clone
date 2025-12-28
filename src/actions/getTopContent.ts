"use server";

import { tmdb } from "@/lib/tmdb";

export async function getTopContent() {
    try {
        const trending = await tmdb.getTrending("all", "week");

        // Return top 10 trending items
        return trending.results.slice(0, 10);
    } catch (error) {
        console.error("Failed to fetch trending content:", error);
        return [];
    }
}
