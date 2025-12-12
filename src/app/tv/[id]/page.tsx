import Navbar from "@/components/Navbar";
import CastList from "@/components/CastList";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import SeasonSelector from "@/components/SeasonSelector";
import MovieControls from "@/components/MovieControls";
import MovieRow from "@/components/MovieRow";
import { findStream, getM3UEntryById, getM3USeriesById, parseSeriesInfo } from "@/lib/m3u";
import { mapM3UToMediaItem, generateId } from "@/lib/m3uMapper";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TVDetailsPage({ params }: PageProps) {
    const { id } = await params;
    let show: any;
    let streamEntry: any;

    try {
        const numericId = parseInt(id);
        if (isNaN(numericId)) throw new Error("Invalid ID");
        show = await tmdb.getDetails("tv", numericId);
        streamEntry = await findStream(show.name);
    } catch (error) {
        // Fallback to M3U ID lookup
        console.log(`TMDB lookup failed for ID ${id}, trying M3U lookup...`);
        const numericId = parseInt(id);

        // Try to find if it's a Series Cluster first
        const m3uSeries = await getM3USeriesById(numericId);

        if (m3uSeries) {
            // It is a series with aggregated episodes
            console.log(`Found M3U Series: ${m3uSeries.title} with ${m3uSeries.episodes.length} episodes`);

            show = {
                id: m3uSeries.id,
                name: m3uSeries.title,
                original_name: m3uSeries.title,
                overview: `Series from M3U - ${m3uSeries.episodes.length} Episodes available.`,
                poster_path: m3uSeries.poster, // Use logo
                backdrop_path: m3uSeries.poster,
                first_air_date: new Date().toISOString(),
                vote_average: 0,
                vote_count: 0,
                seasons: [],
                credits: { cast: [], crew: [] },
                similar: { results: [] }
            };

            // Group episodes into seasons
            const seasonsMap = new Map<number, any>();
            m3uSeries.episodes.forEach(ep => {
                const info = parseSeriesInfo(ep.title);
                if (info) {
                    const seasonNum = info.season;
                    if (!seasonsMap.has(seasonNum)) {
                        seasonsMap.set(seasonNum, {
                            season_number: seasonNum,
                            name: `Season ${seasonNum}`,
                            episode_count: 0,
                            episodes: []
                        });
                    }
                    const season = seasonsMap.get(seasonNum);
                    season.episode_count++;
                    season.episodes.push({
                        id: ep.title + ep.url, // Using title+url as a simple ID
                        episode_number: info.episode,
                        name: ep.title,
                        overview: "",
                        still_path: ep.logo,
                        vote_average: 0,
                        air_date: new Date().toISOString(),
                        // We attach the URL here? The SeasonSelector/Episode list needs to handle playing.
                        // Usually MovieControls plays the main show. 
                        // For TV shows, we might need a way to pick instances. 
                        // Let's attach url to the episode object.
                        url: ep.url
                    });
                }
            });

            show.seasons = Array.from(seasonsMap.values()).sort((a: any, b: any) => a.season_number - b.season_number);

            // Set default stream to first episode of first season
            if (show.seasons.length > 0 && show.seasons[0].episodes.length > 0) {
                streamEntry = { url: show.seasons[0].episodes[0].url };
            }

        } else {
            // Try single entry fallback
            const m3uEntry = await getM3UEntryById(numericId);
            if (m3uEntry) {
                show = mapM3UToMediaItem(m3uEntry);
                streamEntry = m3uEntry;
                show.seasons = [];
                show.credits = { cast: [], crew: [] };
                show.similar = { results: [] };
                if (!show.first_air_date) show.first_air_date = new Date().toISOString();
            } else {
                throw error; // Rethrow
            }
        }
    }

    // Filter out season 0 (specials) and sort by season number
    const regularSeasons = (show as any).seasons?.filter((s: any) => s.season_number > 0) || [];

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full">
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                        alt={show.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full px-4 pb-12 md:px-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {show.name}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                        <span className="text-green-500 font-semibold">{Math.round(show.vote_average * 10)}% Match</span>
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                        <span className="border border-gray-500 px-1 rounded text-xs">HD</span>
                        {regularSeasons.length > 0 && (
                            <span>{regularSeasons.length} {regularSeasons.length === 1 ? 'Season' : 'Seasons'}</span>
                        )}
                    </div>

                    <p className="max-w-2xl text-white text-lg mb-8 line-clamp-3 md:line-clamp-none">
                        {show.overview}
                    </p>

                    <MovieControls streamUrl={streamEntry?.url} mediaItem={show} />
                </div>
            </div>

            {/* Content */}
            <div className="pb-20 px-4 md:px-12">
                {/* Seasons and Episodes */}
                {regularSeasons.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
                        <SeasonSelector tvId={parseInt(id)} seasons={regularSeasons} showName={show.name} />
                    </div>
                )}

                {/* Cast */}
                <CastList cast={show.credits.cast} />

                {/* Similar Shows */}
                <div className="mt-12">
                    <MovieRow title="More Like This" movies={show.similar.results} />
                </div>
            </div>
        </div>
    );
}
