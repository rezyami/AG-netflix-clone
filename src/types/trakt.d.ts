// Trakt.tv API type definitions

export interface TraktIds {
    trakt: number;
    slug: string;
    imdb?: string;
    tmdb?: number;
    tvdb?: number;
}

export interface TraktMovie {
    title: string;
    year: number;
    ids: TraktIds;
}

export interface TraktShow {
    title: string;
    year: number;
    ids: TraktIds;
}

export interface TraktEpisode {
    season: number;
    number: number;
    title: string;
    ids: TraktIds;
}

export interface TraktSearchResult {
    type: "movie" | "show" | "episode";
    score: number;
    movie?: TraktMovie;
    show?: TraktShow;
    episode?: TraktEpisode;
}

export interface TraktWatchlistItem {
    rank: number;
    listed_at: string;
    type: "movie" | "show";
    movie?: TraktMovie;
    show?: TraktShow;
}

export interface TraktHistoryItem {
    id: number;
    watched_at: string;
    action: "watch" | "checkin" | "scrobble";
    type: "movie" | "episode";
    movie?: TraktMovie;
    episode?: TraktEpisode;
    show?: TraktShow;
}

export interface TraktSyncResponse {
    added: {
        movies: number;
        episodes: number;
    };
    existing: {
        movies: number;
        episodes: number;
    };
    not_found: {
        movies: Array<{ ids: Partial<TraktIds> }>;
        episodes: Array<{ ids: Partial<TraktIds> }>;
    };
}

export interface TraktUser {
    username: string;
    private: boolean;
    name: string;
    vip: boolean;
    vip_ep: boolean;
    ids: {
        slug: string;
    };
    images?: {
        avatar?: {
            full: string;
        };
    };
}

export interface TraktUserSettings {
    user: TraktUser;
    account: {
        timezone: string;
        date_format: string;
        time_24hr: boolean;
    };
}

export interface TraktPlaybackProgress {
    id: number;
    progress: number;
    paused_at: string;
    type: "movie" | "episode";
    movie?: TraktMovie;
    episode?: TraktEpisode;
    show?: TraktShow;
}
