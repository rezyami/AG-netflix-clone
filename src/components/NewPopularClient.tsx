"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
import { MediaItem } from "@/types/tmdb";
import { AppSidebarMenu } from "../../static/SidebarMenu";

interface NewPopularClientProps {
    newOnNetflix: MediaItem[];
    comingSoon: MediaItem[];
    topMovies: MediaItem[];
    topTV: MediaItem[];
}

export default function NewPopularClient({
    newOnNetflix,
    comingSoon,
    topMovies,
    topTV,
}: NewPopularClientProps) {
    const router = useRouter();

    const handleMovieClick = (movie: MediaItem) => {
        const type = movie.media_type === "tv" ? "tv" : "movie";
        router.push(`/${type}/${movie.id}`);
    };

    // No Hero section for this page, usually just rows or a different layout
    // Netflix's "New & Popular" often has a specific layout, but for now we'll match the Home style
    // with rows, maybe just starting with a row instead of a Hero.

    return (
        <div className="relative min-h-screen bg-[#141414]">
            <Navbar />
            <main className="relative pl-4 pb-24 pt-24 lg:space-y-24 lg:pl-16">
                {/*  We can add a page title if desired, but Netflix often just lists the rows */}

                <section className="space-y-12 md:space-y-24">
                    <MovieRow
                        title="New on Netflix"
                        movies={newOnNetflix}
                        onMovieClick={handleMovieClick}
                    />
                    <MovieRow
                        title="Coming Soon"
                        movies={comingSoon}
                        onMovieClick={handleMovieClick}
                    />
                    <MovieRow
                        title="Top 10 Movies Today"
                        movies={topMovies}
                        onMovieClick={handleMovieClick}
                    />
                    <MovieRow
                        title="Top 10 TV Shows Today"
                        movies={topTV}
                        onMovieClick={handleMovieClick}
                    />
                </section>
            </main>
            {/* Modal would go here if we implemented one, or just rely on the click handler doing something globally if setup */}
        </div>
    );
}
