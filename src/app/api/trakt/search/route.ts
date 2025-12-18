import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { trakt } from "@/lib/trakt";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized - Please sign in with Trakt" },
                { status: 401 }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") as "movie" | "show";
        const title = searchParams.get("title");
        const year = searchParams.get("year");

        if (!type || !title) {
            return NextResponse.json(
                { error: "Missing required parameters: type and title" },
                { status: 400 }
            );
        }

        const searchMethod = type === "movie" ? trakt.searchMovie : trakt.searchShow;
        const results = await searchMethod(
            title,
            year ? parseInt(year) : undefined,
            session.accessToken
        );

        // Return the first match's Trakt ID if found
        if (results && results.length > 0) {
            const item = results[0];
            const media = item.movie || item.show;
            return NextResponse.json({
                traktId: media?.ids.trakt,
                slug: media?.ids.slug,
                title: media?.title,
                year: media?.year,
            });
        }

        return NextResponse.json({ traktId: null });
    } catch (error) {
        console.error("Trakt search error:", error);
        return NextResponse.json(
            { error: "Failed to search Trakt" },
            { status: 500 }
        );
    }
}
