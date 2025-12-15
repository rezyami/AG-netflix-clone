"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { MediaItem, Movie, TVShow, Person } from "@/types/tmdb";
import { cn } from "@/lib/utils";

interface MovieCardProps {
    movie: MediaItem;
    className?: string;
    onMovieClick?: (movie: MediaItem) => void;
}

export default function MovieCard({ movie, className, onMovieClick }: MovieCardProps) {
    const router = useRouter();
    const isPerson = movie.media_type === "person";

    // Valid types that have backdrop
    const hasBackdrop = !isPerson;

    // Priorities: 
    // 1. Person -> Profile
    // 2. Movie/Show -> Poster (Portrait)
    // 3. Fallback -> Backdrop
    const imagePath = isPerson
        ? (movie as Person).profile_path
        : (movie as Movie | TVShow).poster_path || (movie as Movie | TVShow).backdrop_path;

    const title = isPerson
        ? (movie as Person).name
        : (movie as Movie).title || (movie as TVShow).name;

    if (!imagePath) return null;

    const imageUrl = imagePath.startsWith('http')
        ? imagePath
        : `https://image.tmdb.org/t/p/w500${imagePath}`;

    const handleClick = (e: React.MouseEvent) => {
        if (onMovieClick) {
            e.preventDefault();
            onMovieClick(movie);
            // Scroll to top to see the hero
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (!isPerson) {
            // Navigate to details page
            const mediaType = movie.media_type === "movie" ? "movie" : "tv";
            router.push(`/${mediaType}/${movie.id}`);
        }
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "group relative h-40 min-w-[120px] cursor-pointer transition-transform duration-200 ease-out md:h-64 md:min-w-[180px] hover:z-50 hover:scale-110 focus:z-50 focus:scale-110 focus:outline-none",
                className
            )}
        >
            <Image
                src={imageUrl}
                alt={title || "Movie Poster"}
                fill
                className="rounded-sm object-cover transition-all"
                sizes="(max-width: 768px) 120px, 180px"
            />

            {/* Focus Ring (handled by global css :focus-visible, but we can add extra visual cue) */}
            <div className="absolute inset-0 rounded-sm ring-2 ring-transparent group-focus-visible:ring-white" />
        </button>
    );
}
