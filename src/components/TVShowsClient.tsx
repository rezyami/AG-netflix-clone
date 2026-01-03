"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
import HeroMovie from "@/components/HeroMovie";
import { MediaItem } from "@/types/tmdb";

interface TVShowsClientProps {
    groupedSeries: {
        language: string;
        rows: {
            title: string;
            movies: MediaItem[];
            categoryLink?: string;
        }[];
    }[];
}

export default function TVShowsClient({ groupedSeries }: TVShowsClientProps) {
    const router = useRouter();

    // Find the first available series for the initial hero state
    const firstSeries = groupedSeries.find(g => g.rows.length > 0)
        ?.rows[0]?.movies[0] || null;

    const [selectedSeries, setSelectedSeries] = useState<MediaItem | null>(firstSeries);

    const handleMovieClick = (movie: MediaItem) => {
        router.push(`/tv/${movie.id}`);
    };

    return (
        <div className="relative min-h-screen bg-[#141414]">
            <Navbar />
            <main className="relative pl-4 pb-24 lg:space-y-24 lg:pl-16">
                <HeroMovie movie={selectedSeries} />

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 mt-8">TV Shows</h1>

                <div className="space-y-16">
                    {groupedSeries.map((group) => (
                        <div key={group.language} className="space-y-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-[#e5e5e5] border-l-4 border-red-600 pl-4">
                                {group.language}
                            </h2>
                            <div className="space-y-8 md:space-y-12">
                                {group.rows.map((row) => (
                                    <MovieRow
                                        key={row.title}
                                        title={row.title}
                                        movies={row.movies}
                                        categoryLink={row.categoryLink}
                                        onMovieClick={handleMovieClick}
                                        onMovieFocus={setSelectedSeries}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
