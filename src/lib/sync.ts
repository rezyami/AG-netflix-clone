import { db } from "./db";
import { ensureM3UFile, parseM3U } from "./m3u";

export async function syncM3UToDb() {
    console.log("🔄 Starting M3U to Database Sync...");

    const m3uPath = await ensureM3UFile();
    if (!m3uPath) {
        console.error("❌ Could not find M3U file for syncing.");
        return { success: false, error: "M3U file not found" };
    }

    const entries = parseM3U(m3uPath);
    console.log(`📡 Parsed ${entries.length} entries from M3U.`);

    // Helper to determine media type
    const getMediaType = (group?: string) => {
        if (!group) return "live";
        const g = group.toUpperCase();
        if (g.includes("SRS") || g.includes("SERIES")) return "tv";
        if (g.includes("VOD") || g.includes("MOVIES")) return "movie";
        return "live";
    };

    // Optimization: For huge M3U files (60k+ items), individual upserts are too slow on SQLite.
    // Instead, we'll clear the table and use createMany in large chunks.
    console.log("🧹 Clearing old entries...");
    try {
        await db.m3UEntry.deleteMany({});
    } catch (e) {
        console.error("Failed to clear entries", e);
    }

    const batchSize = 1000;
    let createdCount = 0;

    console.log(`🚀 Importing ${entries.length} items in batches of ${batchSize}...`);

    for (let i = 0; i < entries.length; i += batchSize) {
        const batch = entries.slice(i, i + batchSize);

        const data = batch.map(entry => ({
            title: entry.title,
            rawTitle: entry.rawTitle,
            url: entry.url,
            logo: entry.logo || null,
            group: entry.group || null,
            mediaType: getMediaType(entry.group),
        }));

        try {
            const result = await db.m3UEntry.createMany({
                data
            });
            createdCount += result.count;

            if (i % 5000 === 0 && i > 0) {
                console.log(`⏳ Progress: ${i}/${entries.length} items imported...`);
            }
        } catch (error) {
            console.error(`Failed to import batch starting at ${i}`, error);
        }
    }

    // Also update the sync timestamp in GlobalSetting
    await db.globalSetting.upsert({
        where: { key: "LAST_SYNC_TIMESTAMP" },
        update: { value: new Date().toISOString() },
        create: { key: "LAST_SYNC_TIMESTAMP", value: new Date().toISOString() }
    });

    console.log(`✅ Sync complete! Total items in DB: ${createdCount}`);
    return {
        success: true,
        total: entries.length,
        synced: createdCount
    };
}
