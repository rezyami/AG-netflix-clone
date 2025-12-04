"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/types/tmdb";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
    title: string;
    movies: MediaItem[];
    onMovieClick?: (movie: MediaItem) => void;
}

export default function MovieRow({ title, movies, onMovieClick }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null);
    const [isMoved, setIsMoved] = useState(false);

    const handleClick = (direction: "left" | "right") => {
        setIsMoved(true);
        if (rowRef.current) {
            const { scrollLeft, clientWidth } = rowRef.current;
            const scrollTo =
                direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;

            rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <div className="h-40 space-y-0.5 md:space-y-2 px-4 md:px-12 mb-8">
            <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
                {title}
            </h2>

            <div className="group relative md:-ml-2">
                <ChevronLeft
                    className={cn(
                        "absolute bottom-0 left-2 top-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1",
                        !isMoved && "hidden"
                    )}
                    onClick={() => handleClick("left")}
                />

                <div
                    ref={rowRef}
                    className="flex items-center space-x-2.5 overflow-x-scroll scrollbar-hide md:space-x-4 md:p-2 no-scrollbar"
                >
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onMovieClick={onMovieClick}
                        />
                    ))}
                </div>

                <ChevronRight
                    className="absolute bottom-0 right-2 top-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1"
                    onClick={() => handleClick("right")}
                />
            </div>
        </div>
    );
}
