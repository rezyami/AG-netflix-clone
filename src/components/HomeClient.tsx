"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import { MediaItem } from "@/types/tmdb";
import { getMyList } from "@/lib/myList";

interface HomeClientProps {
    heroMovie: MediaItem;
    rows: {
        title: string;
        movies: MediaItem[];
    }[];
}

export default function HomeClient({
    heroMovie,
    rows,
}: HomeClientProps) {
    const [selectedMovie, setSelectedMovie] = useState<MediaItem>(heroMovie);
    const [myListMovies, setMyListMovies] = useState<MediaItem[]>([]);

    useEffect(() => {
        // Load My List on mount
        setMyListMovies(getMyList());

        // Listen for My List updates
        const handleMyListUpdate = () => {
            setMyListMovies(getMyList());
        };

        window.addEventListener('myListUpdated', handleMyListUpdate);
        return () => window.removeEventListener('myListUpdated', handleMyListUpdate);
    }, []);

    return (
        <div className="relative h-screen bg-gradient-to-b from-gray-900/10 to-[#010511] lg:h-[140vh]">
            <Navbar />
            <main id="main-content" className="relative pl-4 pb-24 lg:space-y-24 lg:pl-16">
                <Hero movie={selectedMovie} />
                <section className="md:space-y-24">
                    {myListMovies.length > 0 && (
                        <MovieRow
                            title="My List"
                            movies={myListMovies}
                            onMovieClick={setSelectedMovie}
                        />
                    )}

                    {rows.map((row) => (
                        <MovieRow
                            key={row.title}
                            title={row.title}
                            movies={row.movies}
                            onMovieClick={setSelectedMovie}
                        />
                    ))}
                </section>
            </main>
        </div>
    );
}
