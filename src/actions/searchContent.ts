'use server';

import { tmdb } from "@/lib/tmdb";

export async function searchContent(query: string) {
    try {
        const results = await tmdb.search(query);
        return results.results;
    } catch (error) {
        console.error("Error searching TMDB:", error);
        return [];
    }
}
