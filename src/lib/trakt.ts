import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
    TraktSearchResult,
    TraktWatchlistItem,
    TraktHistoryItem,
    TraktSyncResponse,
} from "@/types/trakt";

const TRAKT_API_BASE = "https://api.trakt.tv";
const TRAKT_API_VERSION = "2";
const TRAKT_CLIENT_ID = process.env.TRAKT_ID;

interface TraktRequestInit extends RequestInit {
    accessToken?: string;
}

async function fetchTrakt<T>(
    endpoint: string,
    options: TraktRequestInit = {}
): Promise<T> {
    const { accessToken, ...fetchOptions } = options;

    if (!TRAKT_CLIENT_ID) {
        throw new Error("TRAKT_ID is not configured");
    }

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "trakt-api-version": TRAKT_API_VERSION,
        "trakt-api-key": TRAKT_CLIENT_ID,
    };

    // Add authorization if access token is provided
    if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const url = `${TRAKT_API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...fetchOptions,
        headers: {
            ...headers,
            ...(fetchOptions.headers as Record<string, string>),
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Trakt API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
    }

    // Some endpoints return 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

/**
 * Get the current user's access token from the session
 */
export async function getUserAccessToken(): Promise<string | null> {
    const session = await getServerSession(authOptions);
    return session?.accessToken || null;
}

export const trakt = {
    /**
     * Search for a movie on Trakt by title and optional year
     */
    searchMovie: async (
        title: string,
        year?: number,
        accessToken?: string
    ): Promise<TraktSearchResult[]> => {
        const query = encodeURIComponent(title);
        const yearParam = year ? `&years=${year}` : "";
        return fetchTrakt<TraktSearchResult[]>(
            `/search/movie?query=${query}${yearParam}`,
            { accessToken }
        );
    },

    /**
     * Search for a TV show on Trakt by title and optional year
     */
    searchShow: async (
        title: string,
        year?: number,
        accessToken?: string
    ): Promise<TraktSearchResult[]> => {
        const query = encodeURIComponent(title);
        const yearParam = year ? `&years=${year}` : "";
        return fetchTrakt<TraktSearchResult[]>(
            `/search/show?query=${query}${yearParam}`,
            { accessToken }
        );
    },

    /**
     * Add a movie or show to the user's watchlist
     */
    addToWatchlist: async (
        type: "movies" | "shows",
        traktId: number,
        accessToken: string
    ): Promise<TraktSyncResponse> => {
        const body = {
            [type]: [{ ids: { trakt: traktId } }],
        };

        return fetchTrakt<TraktSyncResponse>("/sync/watchlist", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    /**
     * Remove a movie or show from the user's watchlist
     */
    removeFromWatchlist: async (
        type: "movies" | "shows",
        traktId: number,
        accessToken: string
    ): Promise<TraktSyncResponse> => {
        const body = {
            [type]: [{ ids: { trakt: traktId } }],
        };

        return fetchTrakt<TraktSyncResponse>("/sync/watchlist/remove", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    /**
     * Get the user's watchlist
     */
    getWatchlist: async (
        accessToken: string,
        type?: "movies" | "shows"
    ): Promise<TraktWatchlistItem[]> => {
        const typeParam = type ? `/${type}` : "";
        return fetchTrakt<TraktWatchlistItem[]>(
            `/sync/watchlist${typeParam}`,
            { accessToken }
        );
    },

    /**
     * Mark a movie as watched
     */
    markMovieAsWatched: async (
        traktId: number,
        accessToken: string,
        watchedAt?: string
    ): Promise<TraktSyncResponse> => {
        const body = {
            movies: [
                {
                    ids: { trakt: traktId },
                    watched_at: watchedAt || new Date().toISOString(),
                },
            ],
        };

        return fetchTrakt<TraktSyncResponse>("/sync/history", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    /**
     * Mark an episode as watched
     */
    markEpisodeAsWatched: async (
        showTraktId: number,
        season: number,
        episode: number,
        accessToken: string,
        watchedAt?: string
    ): Promise<TraktSyncResponse> => {
        const body = {
            shows: [
                {
                    ids: { trakt: showTraktId },
                    seasons: [
                        {
                            number: season,
                            episodes: [
                                {
                                    number: episode,
                                    watched_at: watchedAt || new Date().toISOString(),
                                },
                            ],
                        },
                    ],
                },
            ],
        };

        return fetchTrakt<TraktSyncResponse>("/sync/history", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    /**
     * Get the user's watch history
     */
    getWatchedHistory: async (
        accessToken: string,
        type?: "movies" | "shows"
    ): Promise<TraktHistoryItem[]> => {
        const typeParam = type ? `/${type}` : "";
        return fetchTrakt<TraktHistoryItem[]>(
            `/sync/history${typeParam}`,
            { accessToken }
        );
    },

    /**
     * Scrobble playback progress (for auto-syncing during video playback)
     */
    scrobbleStart: async (
        type: "movie" | "episode",
        traktId: number,
        progress: number,
        accessToken: string
    ): Promise<any> => {
        const body =
            type === "movie"
                ? {
                    movie: { ids: { trakt: traktId } },
                    progress,
                }
                : {
                    episode: { ids: { trakt: traktId } },
                    progress,
                };

        return fetchTrakt("/scrobble/start", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    scrobblePause: async (
        type: "movie" | "episode",
        traktId: number,
        progress: number,
        accessToken: string
    ): Promise<any> => {
        const body =
            type === "movie"
                ? {
                    movie: { ids: { trakt: traktId } },
                    progress,
                }
                : {
                    episode: { ids: { trakt: traktId } },
                    progress,
                };

        return fetchTrakt("/scrobble/pause", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    scrobbleStop: async (
        type: "movie" | "episode",
        traktId: number,
        progress: number,
        accessToken: string
    ): Promise<any> => {
        const body =
            type === "movie"
                ? {
                    movie: { ids: { trakt: traktId } },
                    progress,
                }
                : {
                    episode: { ids: { trakt: traktId } },
                    progress,
                };

        return fetchTrakt("/scrobble/stop", {
            method: "POST",
            body: JSON.stringify(body),
            accessToken,
        });
    },

    /**
     * Get playback progress for in-progress movies and episodes
     */
    getPlaybackProgress: async (accessToken: string): Promise<any[]> => {
        return fetchTrakt("/sync/playback", {
            accessToken,
        });
    },

    /**
     * Get all watched episodes for a specific show
     */
    getShowWatchedEpisodes: async (
        showTraktId: number,
        accessToken: string
    ): Promise<any> => {
        return fetchTrakt(`/shows/${showTraktId}/progress/watched`, {
            accessToken,
        });
    },
};
