"use server";

import { tmdb } from "@/lib/tmdb";

export async function getSeason(tvId: number, seasonNumber: number) {
    try {
        return await tmdb.getSeason(tvId, seasonNumber);
    } catch (error) {
        console.error("Failed to fetch season:", error);
        return null;
    }
}
