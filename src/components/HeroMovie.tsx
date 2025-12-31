"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Info, Volume2, VolumeX, Plus, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { MediaItem, Movie, TVShow } from "@/types/tmdb";
import { getTrailerForTitle } from "@/lib/trailerHelper";
import { cn } from "@/lib/utils";
import { toggleMyList, isInMyList } from "@/lib/myList";

interface HeroMovieProps {
    movie: MediaItem | null;
}

export default function HeroMovie({ movie }: HeroMovieProps) {
    const [trailer, setTrailer] = useState<string | null>(null);
    const [showVideo, setShowVideo] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [inMyList, setInMyList] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let timer: NodeJS.Timeout;

        const fetchVideo = async () => {
            if (!movie) return;

            // Reset states when movie changes
            setTrailer(null);
            setShowVideo(false);

            // Use pre-fetched trailer key if available (from enrichment)
            if ((movie as any).trailer_key) {
                setTrailer((movie as any).trailer_key);
                timer = setTimeout(() => setShowVideo(true), 1500); // Faster start if we already have it
                return;
            }

            try {
                // Safely access title
                const movieTitle = (movie as Movie).title || (movie as TVShow).name || (movie as any).original_title;
                if (!movieTitle) return;

                const trailerUrl = await getTrailerForTitle(movieTitle, movie.media_type as any);

                if (trailerUrl) {
                    // Extract video ID from URL
                    // Format: https://www.youtube.com/watch?v=VIDEO_ID
                    const videoId = trailerUrl.split("v=")[1];

                    if (videoId) {
                        setTrailer(videoId);
                        // Delay playing to allow user to settle on the card
                        timer = setTimeout(() => setShowVideo(true), 2000);
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

        return () => {
            if (timer) clearTimeout(timer);
        };
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

    const handlePlay = () => {
        if (movie) {
            router.push(`/movie/${movie.id}`);
        }
    };

    const handleMoreInfo = () => {
        if (movie) {
            router.push(`/movie/${movie.id}`);
        }
    };

    if (!movie) return null;

    const title = (movie as Movie).title || (movie as TVShow).name;
    const backdrop = (movie as Movie | TVShow).backdrop_path || (movie as Movie | TVShow).poster_path;
    const overview = (movie as Movie).overview || (movie as TVShow).overview;

    return (
        <div className="relative h-[56.25vw] min-h-[80vh] w-full overflow-hidden transition-all duration-500">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-black">
                {/* Fallback Image */}
                {backdrop && (
                    <Image
                        src={backdrop.startsWith('http') ? backdrop : `https://image.tmdb.org/t/p/original${backdrop}`}
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
                <p className="text-base md:text-lg text-white drop-shadow-md line-clamp-3 font-medium text-shadow">
                    {overview}
                </p>
                <div className="flex items-center gap-4">
                    <Button
                        icon={Play}
                        size="lg"
                        className="px-8 py-6 text-xl"
                        onClick={handlePlay}
                    >
                        Play
                    </Button>
                    <Button
                        variant="secondary"
                        icon={Info}
                        size="lg"
                        className="px-8 py-6 text-xl bg-gray-500/40 hover:bg-gray-500/30"
                        onClick={handleMoreInfo}
                    >
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
