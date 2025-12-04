"use server";

import { findStream as findStreamUtil } from "@/lib/m3u";

export async function findStream(query: string) {
    try {
        return findStreamUtil(query);
    } catch (error) {
        console.error("Failed to find stream:", error);
        return null;
    }
}
