"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
import { MediaItem } from "@/types/tmdb";

interface MoviesClientProps {
    groupedMovies: {
        language: string;
        rows: {
            title: string;
            movies: MediaItem[];
            categoryLink?: string;
        }[];
    }[];
}

export default function MoviesClient({ groupedMovies }: MoviesClientProps) {
    const router = useRouter();

    const handleMovieClick = (movie: MediaItem) => {
        router.push(`/movie/${movie.id}`);
    };

    return (
        <div className="relative min-h-screen bg-[#141414]">
            <Navbar />
            <main className="relative pl-4 pb-24 pt-24 lg:space-y-24 lg:pl-16">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">Movies</h1>

                <div className="space-y-16">
                    {groupedMovies.map((group) => (
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
