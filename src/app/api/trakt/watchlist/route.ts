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

        const watchlist = await trakt.getWatchlist(session.accessToken, type);

        return NextResponse.json(watchlist);
    } catch (error) {
        console.error("Trakt watchlist error:", error);
        return NextResponse.json(
            { error: "Failed to get watchlist" },
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
        const { type, traktId } = body;

        if (!type || !traktId) {
            return NextResponse.json(
                { error: "Missing required parameters: type and traktId" },
                { status: 400 }
            );
        }

        const result = await trakt.addToWatchlist(type, traktId, session.accessToken);

        return NextResponse.json(result);
    } catch (error) {
        console.error("Trakt add to watchlist error:", error);
        return NextResponse.json(
            { error: "Failed to add to watchlist" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized - Please sign in with Trakt" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type, traktId } = body;

        if (!type || !traktId) {
            return NextResponse.json(
                { error: "Missing required parameters: type and traktId" },
                { status: 400 }
            );
        }

        const result = await trakt.removeFromWatchlist(
            type,
            traktId,
            session.accessToken
        );

        return NextResponse.json(result);
    } catch (error) {
        console.error("Trakt remove from watchlist error:", error);
        return NextResponse.json(
            { error: "Failed to remove from watchlist" },
            { status: 500 }
        );
    }
}
