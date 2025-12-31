"use server";

const OPENSUBTITLES_API_URL = "https://api.opensubtitles.com/api/v1";

export async function searchSubtitles(params: {
    query?: string;
    tmdb_id?: number;
    parent_tmdb_id?: number;
    season_number?: number;
    episode_number?: number;
    language?: string;
}) {
    const apiKey = process.env.OPENSUBTITLES_API_KEY;
    if (!apiKey) {
        console.warn("OPENSUBTITLES_API_KEY is not defined");
        return { data: [] };
    }

    const url = new URL(`${OPENSUBTITLES_API_URL}/subtitles`);

    if (params.query) url.searchParams.append("query", params.query);
    if (params.tmdb_id) url.searchParams.append("tmdb_id", params.tmdb_id.toString());
    if (params.parent_tmdb_id) url.searchParams.append("parent_tmdb_id", params.parent_tmdb_id.toString());
    if (params.season_number) url.searchParams.append("season_number", params.season_number.toString());
    if (params.episode_number) url.searchParams.append("episode_number", params.episode_number.toString());
    if (params.language) url.searchParams.append("languages", params.language);

    // Sort by downloads descend
    url.searchParams.append("order_by", "download_count");
    url.searchParams.append("order_direction", "desc");

    try {
        const response = await fetch(url.toString(), {
            headers: {
                "Api-Key": apiKey,
                "Content-Type": "application/json",
                "User-Agent": "AG-Netflix-Clone v1.0.0"
            }
        });

        if (!response.ok) {
            throw new Error(`OpenSubtitles API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to search subtitles:", error);
        return { data: [] };
    }
}

export async function getDownloadLink(fileId: number) {
    const apiKey = process.env.OPENSUBTITLES_API_KEY;
    if (!apiKey) return null;

    try {
        const response = await fetch(`${OPENSUBTITLES_API_URL}/download`, {
            method: "POST",
            headers: {
                "Api-Key": apiKey,
                "Content-Type": "application/json",
                "User-Agent": "AG-Netflix-Clone v1.0.0"
            },
            body: JSON.stringify({ file_id: fileId })
        });

        if (!response.ok) {
            throw new Error(`OpenSubtitles Download error: ${response.status}`);
        }

        const result = await response.json();
        return result.link;
    } catch (error) {
        console.error("Failed to get download link:", error);
        return null;
    }
}
