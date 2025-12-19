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
        const showTraktId = searchParams.get("showTraktId");

        if (!showTraktId) {
            return NextResponse.json(
                { error: "Missing required parameter: showTraktId" },
                { status: 400 }
            );
        }

        const watchedProgress = await trakt.getShowWatchedEpisodes(
            parseInt(showTraktId),
            session.accessToken
        );

        return NextResponse.json(watchedProgress);
    } catch (error) {
        console.error("Trakt show progress error:", error);
        return NextResponse.json(
            { error: "Failed to get show progress" },
            { status: 500 }
        );
    }
}
