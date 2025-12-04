"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import MovieRow from "@/components/MovieRow";
import { MediaItem } from "@/types/tmdb";
import { getMyList } from "@/lib/myList";

interface HomeClientProps {
    trendingMovies: MediaItem[];
    topRatedMovies: MediaItem[];
    actionMovies: MediaItem[];
    comedyMovies: MediaItem[];
    horrorMovies: MediaItem[];
    romanceMovies: MediaItem[];
    documentaries: MediaItem[];
}

export default function HomeClient({
    trendingMovies,
    topRatedMovies,
    actionMovies,
    comedyMovies,
    horrorMovies,
    romanceMovies,
    documentaries,
}: HomeClientProps) {
    const [selectedMovie, setSelectedMovie] = useState<MediaItem>(trendingMovies[0]);
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
                    <MovieRow
                        title="Trending Now"
                        movies={trendingMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Top Rated"
                        movies={topRatedMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Action Thrillers"
                        movies={actionMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Comedies"
                        movies={comedyMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Scary Movies"
                        movies={horrorMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Romance Movies"
                        movies={romanceMovies}
                        onMovieClick={setSelectedMovie}
                    />
                    <MovieRow
                        title="Documentaries"
                        movies={documentaries}
                        onMovieClick={setSelectedMovie}
                    />
                </section>
            </main>
        </div>
    );
}
