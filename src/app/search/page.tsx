import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { tmdb } from "@/lib/tmdb";
import SearchBar from "@/components/SearchBar";

interface PageProps {
    searchParams: Promise<{ q: string }>;
}

import { searchM3USeries, getVODAndSeriesCategories } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

// ... existing imports ...

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    let results: any[] = [];
    const m3uCategories = await getVODAndSeriesCategories();
    const isM3UParams = m3uCategories.length > 0;

    if (q) {
        if (isM3UParams) {
            const m3uResults = await searchM3USeries(q);
            // mapM3UToMediaItem handles simple entries. We need to handle series manually or update mapper.
            // Let's do inline mapping similar to what we plan for Home page.
            results = m3uResults.map(entry => {
                if ('episodes' in entry) {
                    return {
                        id: entry.id,
                        title: entry.title,
                        original_title: entry.title,
                        overview: `Series - ${entry.episodes.length} Episodes`,
                        poster_path: entry.poster,
                        backdrop_path: entry.poster,
                        release_date: new Date().toISOString(),
                        vote_average: 0,
                        vote_count: 0,
                        popularity: 0,
                        genre_ids: [],
                        media_type: "tv",
                        adult: false
                    };
                } else {
                    return mapM3UToMediaItem(entry);
                }
            });
        } else {
            const tmdbResults = await tmdb.search(q);
            results = tmdbResults.results;
        }
    }

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />
            <div className="pt-24 px-4 md:px-16">
                <SearchBar />

                {q && (
                    <h1 className="text-2xl text-white mb-8">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        Results for "{q}"
                    </h1>
                )}

                {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.map((item) => (
                            <MovieCard key={item.id} movie={item} className="w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20">
                        No results found. Try searching for something else.
                    </div>
                )}
            </div>
        </div>
    );
}
