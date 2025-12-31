import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch subtitle: ${response.status}`);
        }

        let text = await response.text();

        // Simple SRT to VTT conversion
        if (!text.startsWith("WEBVTT")) {
            // Replace comma with dot in timestamps
            text = text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
            text = "WEBVTT\n\n" + text;
        }

        return new NextResponse(text, {
            headers: {
                "Content-Type": "text/vtt",
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=3600"
            }
        });
    } catch (error: any) {
        console.error("Subtitle conversion error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
