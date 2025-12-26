import { MediaDetails, MediaItem, PaginatedResponse, Genre } from "@/types/tmdb";

const BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    if (!BASE_URL) throw new Error("TMDB_BASE_URL is not defined");

    // During build, some vars might be missing. We allow it to fail silently or log a warning
    // to prevent build crashes if these are purely for runtime.
    if (!API_KEY && !ACCESS_TOKEN) {
        console.warn("⚠️ TMDB API Key or Access Token is missing. TMDB requests may fail.");
    }

    const url = new URL(`${BASE_URL}${endpoint}`);

    // Append query params
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    // Default params
    url.searchParams.append("language", "en-US");
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

    if (!res.ok) {
        throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
    }

    return res.json();
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

    search: async (query: string) => {
        return fetchTMDB<PaginatedResponse<MediaItem>>("/search/multi", {
            query,
        });
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
