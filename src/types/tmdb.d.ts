export interface Movie {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    media_type: "movie";
    adult: boolean;
}

export interface TVShow {
    id: number;
    name: string;
    original_name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    genre_ids: number[];
    media_type: "tv";
}

export interface Person {
    id: number;
    name: string;
    profile_path: string | null;
    known_for_department: string;
    media_type: "person";
}

export type MediaItem = Movie | TVShow | Person;

export interface Genre {
    id: number;
    name: string;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface MediaDetails extends Movie, TVShow {
    genres: Genre[];
    videos: {
        results: Video[];
    };
    credits: {
        cast: Cast[];
        crew: any[];
    };
    similar: {
        results: MediaItem[];
    };
}

export interface PaginatedResponse<T> {
    page: number;
    results: T[];
    total_pages: number;
    total_results: number;
}
