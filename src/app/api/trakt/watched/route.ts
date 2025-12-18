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
        const type = searchParams.get("type") as "movies" | "shows" | undefined;

        const history = await trakt.getWatchedHistory(session.accessToken, type);

        return NextResponse.json(history);
    } catch (error) {
        console.error("Trakt history error:", error);
        return NextResponse.json(
            { error: "Failed to get watch history" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized - Please sign in with Trakt" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type, traktId, season, episode } = body;

        if (!type || !traktId) {
            return NextResponse.json(
                { error: "Missing required parameters: type and traktId" },
                { status: 400 }
            );
        }

        let result;

        if (type === "movies") {
            result = await trakt.markMovieAsWatched(traktId, session.accessToken);
        } else if (type === "shows" && season !== undefined && episode !== undefined) {
            result = await trakt.markEpisodeAsWatched(
                traktId,
                season,
                episode,
                session.accessToken
            );
        } else {
            return NextResponse.json(
                { error: "Invalid parameters for marking as watched" },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("Trakt mark as watched error:", error);
        return NextResponse.json(
            { error: "Failed to mark as watched" },
            { status: 500 }
        );
    }
}
