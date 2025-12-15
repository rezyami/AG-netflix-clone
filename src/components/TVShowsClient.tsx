"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
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

    const handleMovieClick = (movie: MediaItem) => {
        // For M3U series, the media_type might default to movie in the mapper,
        // but since we are in TV Shows route and these are SRS categories,
        // we should treat them as TV.
        // The m3uMapper sets media_type based on group name logic which might be imperfect,
        // so we force 'tv' logic if needed or rely on the mapper correct detection.
        // Check finding: m3uMapper sets media_type to "movie" by default unless changed.
        // Let's assume we handle it as TV.
        router.push(`/tv/${movie.id}`);
    };

    return (
        <div className="relative min-h-screen bg-[#141414]">
            <Navbar />
            <main className="relative pl-4 pb-24 pt-24 lg:space-y-24 lg:pl-16">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">TV Shows</h1>

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
