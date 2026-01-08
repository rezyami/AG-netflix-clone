import { MediaDetails, MediaItem, PaginatedResponse, Genre } from "@/types/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

class Semaphore {
    private tasks: (() => void)[] = [];
    private activeCount = 0;

    constructor(private maxConcurrency: number) { }

    async acquire() {
        if (this.activeCount < this.maxConcurrency) {
            this.activeCount++;
            return;
        }
        await new Promise<void>(resolve => this.tasks.push(resolve));
    }

    release() {
        this.activeCount--;
        if (this.tasks.length > 0) {
            this.activeCount++;
            const nextTask = this.tasks.shift();
            nextTask?.();
        }
    }
}

const tmdbSemaphore = new Semaphore(10); // Limit to 10 concurrent requests

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}, retries = 3, backoff = 1000, language?: string): Promise<T> {
    const cleanBaseUrl = BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    // During build, some vars might be missing. We allow it to fail silently or log a warning
    // to prevent build crashes if these are purely for runtime.
    if (!API_KEY && !ACCESS_TOKEN) {
        console.warn("⚠️ TMDB API Key or Access Token is missing. TMDB requests may fail.");
    }

    await tmdbSemaphore.acquire();

    try {
        const url = new URL(`${cleanBaseUrl}${cleanEndpoint}`);

        // Append query params
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });

        // Default params
        if (!url.searchParams.has("language")) {
            url.searchParams.append("language", language || "en-US");
        }
        if (API_KEY) {
            url.searchParams.append("api_key", API_KEY);
        }

        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        if (ACCESS_TOKEN) {
            headers["Authorization"] = `Bearer ${ACCESS_TOKEN}`;
        }

        const res = await fetch(url.toString(), {
            headers,
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (res.status === 429 && retries > 0) {
            console.warn(`TMDB API 429 Error. Retrying in ${backoff}ms... (${retries} retries left)`);
            await sleep(backoff);
            tmdbSemaphore.release(); // Release before retrying to avoid deadlocks in some scenarios, though acquire is called again
            return fetchTMDB<T>(endpoint, params, retries - 1, backoff * 2, language);
        }

        if (!res.ok) {
            // Handle 404 Not Found gracefully
            if (res.status === 404) {
                return null as any;
            }

            const errorText = await res.text();
            if (res.status === 401 || res.status === 403) {
                throw new Error(`TMDB AUTH ERROR: ${res.status}. Check API Key.`);
            }
            throw new Error(`TMDB API Error: ${res.status} - ${errorText}`);
        }

        return res.json();
    } finally {
        tmdbSemaphore.release();
    }
}

export const tmdb = {
    getTrending: async (mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") => {
        return fetchTMDB<PaginatedResponse<MediaItem>>(`/trending/${mediaType}/${timeWindow}`);
    },

    getTopRated: async (mediaType: "movie" | "tv" = "movie") => {
        const data = await fetchTMDB<PaginatedResponse<MediaItem>>(`/${mediaType}/top_rated`);
        return {
            ...data,
            results: data.results.map((item) => ({ ...item, media_type: mediaType } as MediaItem)),
        };
    },

    getPopular: async (mediaType: "movie" | "tv" = "movie") => {
        const data = await fetchTMDB<PaginatedResponse<MediaItem>>(`/${mediaType}/popular`);
        return {
            ...data,
            results: data.results.map((item) => ({ ...item, media_type: mediaType } as MediaItem)),
        };
    },

    getByGenre: async (mediaType: "movie" | "tv", genreId: number) => {
        const data = await fetchTMDB<PaginatedResponse<MediaItem>>(`/discover/${mediaType}`, {
            with_genres: genreId.toString(),
            sort_by: "popularity.desc",
        });
        return {
            ...data,
            results: data.results.map((item) => ({ ...item, media_type: mediaType } as MediaItem)),
        };
    },

    getDetails: async (mediaType: "movie" | "tv", id: number) => {
        return fetchTMDB<MediaDetails>(`/${mediaType}/${id}`, {
            append_to_response: "videos,credits,similar",
        });
    },

    search: async (query: string, language?: string) => {
        return fetchTMDB<PaginatedResponse<MediaItem>>("/search/multi", {
            query,
        }, 3, 1000, language);
    },

    getSeason: async (tvId: number, seasonNumber: number) => {
        return fetchTMDB<any>(`/tv/${tvId}/season/${seasonNumber}`);
    },

    getGenres: async (mediaType: "movie" | "tv") => {
        const res = await fetchTMDB<{ genres: Genre[] }>(`/genre/${mediaType}/list`);
        return res.genres;
    },
    getUpcomingMovies: async () => {
        const data = await fetchTMDB<PaginatedResponse<MediaItem>>("/movie/upcoming");
        return {
            ...data,
            results: data.results.map((item) => ({ ...item, media_type: "movie" } as MediaItem)),
        };
    },

    getOnTheAirTV: async () => {
        const data = await fetchTMDB<PaginatedResponse<MediaItem>>("/tv/on_the_air");
        return {
            ...data,
            results: data.results.map((item) => ({ ...item, media_type: "tv" } as MediaItem)),
        };
    },
};
