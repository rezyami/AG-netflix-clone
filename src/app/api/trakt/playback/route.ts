import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { trakt } from "@/lib/trakt";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: "Unauthorized - Please sign in with Trakt" },
                { status: 401 }
            );
        }

        const playbackProgress = await trakt.getPlaybackProgress(session.accessToken);

        return NextResponse.json(playbackProgress);
    } catch (error) {
        console.error("Trakt playback progress error:", error);
        return NextResponse.json(
            { error: "Failed to get playback progress" },
            { status: 500 }
        );
    }
}
