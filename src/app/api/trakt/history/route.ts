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
