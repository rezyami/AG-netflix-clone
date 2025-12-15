"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { MediaItem } from "@/types/tmdb";

interface ContentGridProps {
    title: string;
    items: MediaItem[];
}

export default function ContentGrid({ title, items }: ContentGridProps) {
    const router = useRouter();

    const handleMovieClick = (movie: MediaItem) => {
        const mediaType = movie.media_type === "movie" ? "movie" : "tv";
        router.push(`/${mediaType}/${movie.id}`);
    };

    return (
        <div className="relative min-h-screen bg-[#141414]">
            <Navbar />
            <main className="relative pl-4 pb-24 pt-24 lg:space-y-24 lg:pl-16 pr-4 lg:pr-16">
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">{title}</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-x-4 md:gap-y-8">
                    {items.map((item) => (
                        <MovieCard
                            key={item.id}
                            movie={item}
                            // Force portrait style if needed, though MovieCard now defaults to it
                            className="w-full h-auto aspect-[2/3]"
                            onMovieClick={handleMovieClick}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
