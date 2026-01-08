import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const [totalEntries, movieCount, tvCount, liveCount, lastUpdate] = await Promise.all([
            db.m3UEntry.count(),
            db.m3UEntry.count({ where: { mediaType: 'movie' } }),
            db.m3UEntry.count({ where: { mediaType: 'tv' } }),
            db.m3UEntry.count({ where: { mediaType: 'live' } }),
            db.m3UEntry.findFirst({
                orderBy: { updatedAt: 'desc' },
                select: { updatedAt: true }
            })
        ]);

        const groupStats = await db.m3UEntry.groupBy({
            by: ['group'],
            _count: {
                _all: true
            },
            take: 10,
            orderBy: {
                _count: {
                    group: 'desc'
                }
            }
        });

        return NextResponse.json({
            total: totalEntries,
            movies: movieCount,
            series: tvCount,
            live: liveCount,
            lastSynced: lastUpdate?.updatedAt || null,
            topGroups: groupStats.map(g => ({
                name: g.group || 'Uncategorized',
                count: g._count._all
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
