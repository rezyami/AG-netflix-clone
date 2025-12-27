"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlaybackItem {
    id: number;
    progress: number;
    paused_at: string;
    type: "movie" | "episode";
    movie?: {
        title: string;
        year: number;
        ids: {
            tmdb?: number;
            slug: string;
        };
    };
    episode?: {
        season: number;
        number: number;
        title: string;
        ids: {
            tmdb?: number;
        };
    };
    show?: {
        title: string;
        year: number;
        ids: {
            tmdb?: number;
            slug: string;
        };
    };
}

interface EnrichedItem extends PlaybackItem {
    posterPath?: string;
    backdropPath?: string;
}

export default function ContinueWatching() {
    const { data: session } = useSession();
    const [items, setItems] = useState<EnrichedItem[]>([]);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (!session) return;

        const fetchPlaybackProgress = async () => {
            setLoading(true);
            try {
                const response = await fetch("/api/trakt/playback");
                if (response.ok) {
                    const data: PlaybackItem[] = await response.json();

                    // Fetch TMDB data for each item
                    const enrichedItems = await Promise.all(
                        data.map(async (item) => {
                            const isMovie = item.type === "movie";
                            const tmdbId = isMovie
                                ? item.movie?.ids.tmdb
                                : item.show?.ids.tmdb;

                            if (!tmdbId) return item;

                            try {
                                const mediaType = isMovie ? "movie" : "tv";
                                const tmdbResponse = await fetch(
                                    `https://api.themoviedb.org/3/${mediaType}/${tmdbId}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
                                );

                                if (tmdbResponse.ok) {
                                    const tmdbData = await tmdbResponse.json();
                                    return {
                                        ...item,
                                        posterPath: tmdbData.poster_path,
                                        backdropPath: tmdbData.backdrop_path,
                                    };
                                }
                            } catch (error) {
                                console.error("Error fetching TMDB data:", error);
                            }

                            return item;
                        })
                    );

                    setItems(enrichedItems);
                }
            } catch (error) {
                console.error("Error fetching playback progress:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaybackProgress();
    }, [session]);

    if (!session || loading || items.length === 0) {
        return null;
    }

    return (
        <div className="h-80 space-y-0.5 md:space-y-2 px-4 md:px-12 mb-8">
            <div className="flex items-center justify-between group/header mb-2 md:mb-4">
                <h2 className="cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
                    Continue Watching
                </h2>
            </div>

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
                    {items.map((item) => {
                        const isMovie = item.type === "movie";
                        const title = isMovie
                            ? item.movie?.title || "Unknown"
                            : item.show?.title || "Unknown";
                        const tmdbId = isMovie
                            ? item.movie?.ids.tmdb
                            : item.show?.ids.tmdb;
                        const mediaType = isMovie ? "movie" : "tv";
                        const linkHref = tmdbId ? `/${mediaType}/${tmdbId}` : "#";

                        const imagePath = item.posterPath || item.backdropPath;
                        const imageUrl = imagePath
                            ? `https://image.tmdb.org/t/p/w500${imagePath}`
                            : null;

                        // Format episode info
                        let episodeInfo = "";
                        if (!isMovie && item.episode) {
                            episodeInfo = `S${item.episode.season} E${item.episode.number}`;
                        }

                        return (
                            <Link
                                key={item.id}
                                href={linkHref}
                                className="group relative h-40 min-w-[120px] cursor-pointer transition-transform duration-200 ease-out md:h-64 md:min-w-[180px] hover:z-50 hover:scale-110 focus:z-50 focus:scale-110 focus:outline-none"
                            >
                                {imageUrl ? (
                                    <Image
                                        src={imageUrl}
                                        alt={title}
                                        fill
                                        className="rounded-sm object-cover transition-all"
                                        sizes="(max-width: 768px) 120px, 180px"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-sm">
                                        <Play className="h-12 w-12 text-white/30" />
                                    </div>
                                )}

                                {/* Title overlay - always visible */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent rounded-sm pointer-events-none">
                                    <div className="absolute bottom-0 left-0 right-0 pb-1 px-2">
                                        {episodeInfo && (
                                            <p className="text-xs text-gray-300 mb-0.5">
                                                {episodeInfo}
                                            </p>
                                        )}
                                        <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-1 mb-1">
                                            {title}
                                        </h3>
                                        {/* Progress bar */}
                                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-600 transition-all"
                                                style={{ width: `${item.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Focus Ring */}
                                <div className="absolute inset-0 rounded-sm ring-2 ring-transparent group-focus-visible:ring-white" />
                            </Link>
                        );
                    })}
                </div>

                <ChevronRight
                    className="absolute bottom-0 right-2 top-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 bg-black/50 rounded-full p-1"
                    onClick={() => handleClick("right")}
                />
            </div>
        </div>
    );
}
