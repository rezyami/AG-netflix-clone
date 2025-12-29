export interface M3UEntry {
    title: string;
    logo?: string;
    group?: string;
    url: string;
    rawTitle: string;
    epgId?: string;
    currentProgram?: {
        title: string;
        description: string;
        start: string;
        end: string;
        progress: number;
    };
    nextProgram?: {
        title: string;
    };
}

export interface SeriesInfo {
    language?: string;
    name: string;
    cleanTitle: string;
    season: number;
    episode: number;
}

export interface M3USeries {
    id: number;
    title: string;
    poster?: string;
    group?: string;
    episodes: M3UEntry[];
}
