"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, Info, Volume2, VolumeX, Plus, Check, Star } from "lucide-react";
import { Button } from "@/components/Button";
import { MediaItem, Movie, TVShow } from "@/types/tmdb";
import { getMovieTrailer } from "@/actions/getMovieTrailer";
import { cn } from "@/lib/utils";
import { toggleMyList, isInMyList } from "@/lib/myList";
import { getGenreNames } from "@/lib/genres";

interface HeroProps {
    movie: MediaItem;
}

export default function Hero({ movie }: HeroProps) {
    const [trailer, setTrailer] = useState<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [inMyList, setInMyList] = useState(false);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!movie) return;

            // Reset states when movie changes
            setTrailer(null);
            setShowVideo(false);

            // 1. Use pre-fetched trailer key if available
            const trailerKey = (movie as any).trailer_key;
            if (trailerKey) {
                setTrailer(trailerKey);
                const timer = setTimeout(() => setShowVideo(true), 1500);
                return () => clearTimeout(timer);
            }

            // 2. Fallback to fetching via TMDB ID
            try {
                const targetId = (movie as any).tmdb_id || movie.id;

                // Only attempt if it looks like a real TMDB ID (usually < 1,000,000, whereas our M3U hashes are large)
                if (targetId && targetId < 5000000) {
                    const videoKey = await getMovieTrailer(movie.media_type as "movie" | "tv", targetId);
                    if (videoKey) {
                        setTrailer(videoKey);
                        const timer = setTimeout(() => setShowVideo(true), 2000);
                        return () => clearTimeout(timer);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch video", error);
            }
        };

        if (movie) {
            fetchVideo();
            setInMyList(isInMyList(movie.id));
        }
    }, [movie]);

    useEffect(() => {
        const handleMyListUpdate = () => {
            if (movie) {
                setInMyList(isInMyList(movie.id));
            }
        };

        window.addEventListener('myListUpdated', handleMyListUpdate);
        return () => window.removeEventListener('myListUpdated', handleMyListUpdate);
    }, [movie]);

    const handleMyListToggle = () => {
        if (movie) {
            toggleMyList(movie);
        }
    };

    if (!movie) return null;

    const title = (movie as Movie).title || (movie as TVShow).name;
    const backdrop = (movie as Movie | TVShow).backdrop_path;
    const overview = (movie as Movie).overview || (movie as TVShow).overview;
    const isPerson = movie.media_type === 'person';
    const releaseDate = !isPerson ? ((movie as Movie).release_date || (movie as TVShow).first_air_date) : null;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
    const rating = (!isPerson && movie.vote_average) ? Math.round(movie.vote_average * 10) : null;
    const genres = !isPerson ? getGenreNames(movie.genre_ids || [], movie.media_type as any) : [];

    return (
        <div className="relative h-[56.25vw] min-h-[80vh] w-full overflow-hidden">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-black">
                {/* Fallback Image */}
                {backdrop && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${backdrop}`}
                        alt={title || "Hero Image"}
                        fill
                        className={cn(
                            "object-cover transition-opacity duration-1000",
                            showVideo ? "opacity-0" : "opacity-100"
                        )}
                        priority
                    />
                )}

                {/* Video Player */}
                {showVideo && trailer && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <iframe
                            className="absolute top-1/2 left-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 object-cover"
                            src={`https://www.youtube.com/embed/${trailer}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailer}&rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&disablekb=1&fs=0`}
                            allow="autoplay; encrypted-media"
                            title="Hero Video"
                        />
                    </div>
                )}
            </div>

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent opacity-90" />
            <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-[#141414] to-transparent" />

            {/* Content */}
            <div className="absolute bottom-[30%] left-4 md:left-16 max-w-xl space-y-6 z-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl tracking-tight uppercase">
                    {title}
                </h1>

                <div className="flex items-center gap-3 text-white text-sm md:text-base font-semibold">
                    {rating && (
                        <span className="text-green-400">
                            {rating}% Match
                        </span>
                    )}
                    {year && (
                        <span>{year}</span>
                    )}
                    {movie.media_type === 'tv' && (
                        <span className="border border-white/40 px-1.5 py-0.5 text-xs rounded uppercase">
                            Series
                        </span>
                    )}
                    {genres.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-white/40">•</span>
                            <span className="flex items-center gap-2">
                                {genres.slice(0, 3).join(' • ')}
                            </span>
                        </div>
                    )}
                </div>

                <p className="text-base md:text-lg text-white drop-shadow-md line-clamp-3 font-medium text-shadow max-w-lg">
                    {overview}
                </p>
                <div className="flex items-center gap-4">
                    <Button icon={Play} size="lg" className="px-8 py-6 text-xl">
                        Play
                    </Button>
                    <Button variant="secondary" icon={Info} size="lg" className="px-8 py-6 text-xl bg-gray-500/40 hover:bg-gray-500/30">
                        More Info
                    </Button>
                    <button
                        onClick={handleMyListToggle}
                        className="rounded-full border-2 border-white/50 p-3 text-white hover:bg-white/10 hover:border-white transition bg-black/30 backdrop-blur-sm"
                        title={inMyList ? "Remove from My List" : "Add to My List"}
                    >
                        {inMyList ? <Check className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mute Control & Rating */}
            <div className="absolute bottom-[35%] right-0 flex items-center gap-4 z-20">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full border border-white/50 p-2.5 text-white hover:bg-white/10 hover:border-white transition bg-black/30 backdrop-blur-sm"
                >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <div className="bg-gray-500/30 border-l-4 border-white py-1 pl-3 pr-8 text-white backdrop-blur-sm font-semibold">
                    13+
                </div>
            </div>
        </div>
    );
}
