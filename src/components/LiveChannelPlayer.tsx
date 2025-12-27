'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { M3UEntry } from '@/lib/m3u';
import Hls from 'hls.js';
import { searchContent } from '@/actions/searchContent';
import { MediaItem } from '@/types/tmdb';


interface LiveChannelPlayerProps {
    channel: M3UEntry;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function LiveChannelPlayer({ channel, onClose, onNext, onPrev }: LiveChannelPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const mpegtsRef = useRef<any | null>(null);
    const [metadata, setMetadata] = useState<MediaItem | null>(null);

    // Helper to clean filename/title
    const cleanTitle = (raw: string) => {
        return raw
            .replace(/^(US|UK|CA|FR|DE|IT|ES|AU)\s*[:|-]?\s*/i, '')
            .replace(/\(.*\)/g, '')
            .replace(/\[.*\]/g, '')
            .replace(/\b(HD|FHD|4K|SD|HEVC)\b/gi, '')
            .replace(/\bS\d{1,2}E\d{1,2}\b/gi, '')
            .replace(/[._-]/g, ' ')
            .trim();
    };

    useEffect(() => {
        const fetchMetadata = async () => {
            // Only search if not already set or channel changed
            const cleaned = cleanTitle(channel.rawTitle);
            if (cleaned.length > 2) {
                const results = await searchContent(cleaned);
                if (results && results.length > 0) {
                    setMetadata(results[0]);
                } else {
                    setMetadata(null);
                }
            }
        };
        fetchMetadata();
    }, [channel.rawTitle]);

    useEffect(() => {
        // Close on ESC key and handle Zapping
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowUp') {
                if (onPrev) {
                    e.preventDefault();
                    onPrev();
                }
            } else if (e.key === 'ArrowDown') {
                if (onNext) {
                    e.preventDefault();
                    onNext();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNext, onPrev]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const url = channel.url;
        setError(null);

        const cleanup = () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (mpegtsRef.current) {
                mpegtsRef.current.destroy();
                mpegtsRef.current = null;
            }
            video.removeAttribute('src');
            video.load();
        };

        cleanup();

        const tryNative = () => {
            console.log("Attempting Native playback...");
            video.src = url;
            video.play().catch(e => {
                if (e.name === 'AbortError') return;
                console.error("Native playback failed:", e);
                setError('Playback failed: ' + e.message);
            });
        };

        const tryMpegTs = async () => {
            console.log("Attempting MPEG-TS playback...");
            try {
                // @ts-ignore
                const mpegts = (await import('mpegts.js')).default;

                if (mpegts.getFeatureList().mseLivePlayback) {
                    try {
                        // Disable internal logging
                        if (mpegts.LoggingControl) {
                            mpegts.LoggingControl.enableAll = false;
                            mpegts.LoggingControl.enableDebug = false;
                            mpegts.LoggingControl.enableVerbose = false;
                        }

                        const player = mpegts.createPlayer({
                            type: 'mpegts',
                            url: url,
                            isLive: true,
                            cors: true,
                        });
                        mpegtsRef.current = player;
                        player.attachMediaElement(video);
                        player.load();

                        const playPromise = player.play();
                        if (playPromise !== undefined) {
                            playPromise.catch((e: any) => {
                                if (e.name === 'AbortError') return;
                                console.warn("MPEG-TS play error:", e);
                                tryNative();
                            });
                        }

                        player.on(mpegts.Events.ERROR, (type: any, details: any, data: any) => {
                            console.warn("MPEG-TS Error:", type, details, data);
                            if (type === mpegts.ErrorTypes.NETWORK_ERROR || type === mpegts.ErrorTypes.MEDIA_ERROR) {
                                if (mpegtsRef.current) {
                                    mpegtsRef.current.destroy();
                                    mpegtsRef.current = null;
                                }
                                tryNative();
                            }
                        });
                    } catch (e) {
                        console.warn("MPEG-TS setup failed:", e);
                        tryNative();
                    }
                } else {
                    tryNative();
                }
            } catch (err) {
                console.error("Failed to load mpegts.js dynamically:", err);
                tryNative();
            }
        };

        const tryHls = () => {
            console.log("Attempting HLS playback...");
            if (Hls.isSupported()) {
                const hls = new Hls();
                hlsRef.current = hls;
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(e => {
                        if (e.name === 'AbortError') return;
                        console.error("HLS play error:", e)
                    });
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("HLS Fatal Error:", data);
                        hls.destroy();
                        hlsRef.current = null;
                        // Fallback to MPEG-TS or Native
                        if (url.includes('.ts') || !url.includes('.')) {
                            tryMpegTs();
                        } else {
                            tryNative();
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = url;
                video.play().catch(e => {
                    if (e.name === 'AbortError') return;
                    console.error("Native HLS play error:", e);
                    tryNative(); // Try generic native as last resort
                });
            } else {
                // Fallback attempt
                if (url.includes('.ts') || !url.includes('.')) {
                    tryMpegTs();
                } else {
                    tryNative();
                }
            }
        };

        // Router logic
        if (url.includes('.m3u8')) {
            tryHls();
        } else {
            // Default to MPEG-TS for others, then Native
            tryMpegTs();
        }

        return cleanup;
    }, [channel.url]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center group">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-black rounded-full p-3 transition-colors"
                aria-label="Close player"
            >
                <X className="h-6 w-6 text-white" />
            </button>

            {/* Channel Info & Metadata Overlay */}
            <div className="absolute top-0 left-0 w-full p-8 z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="max-w-4xl">
                    <h2 className="text-white font-bold text-3xl drop-shadow-md">
                        {metadata ? ((metadata as any).title || (metadata as any).name) : channel.rawTitle}
                    </h2>

                    {metadata && (
                        <div className="mt-2 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
                            {(metadata as any).poster_path && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${(metadata as any).poster_path}`}
                                    alt="Poster"
                                    className="w-24 rounded shadow-lg hidden sm:block"
                                />
                            )}
                            <div>
                                <p className="text-gray-300 text-sm line-clamp-3 max-w-xl drop-shadow-sm">
                                    {(metadata as any).overview}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {(metadata as any).vote_average > 0 && (
                                        <span className="text-[#46d369] font-bold text-sm">
                                            {Math.round((metadata as any).vote_average * 10)}% Match
                                        </span>
                                    )}
                                    {(metadata as any).release_date && (
                                        <span className="text-gray-400 text-sm">
                                            {((metadata as any).release_date as string).split('-')[0]}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!metadata && channel.group && (
                        <p className="text-gray-400 text-sm mt-1">{channel.group}</p>
                    )}
                </div>
            </div>

            {/* Video Player */}
            <div className="w-full h-full flex items-center justify-center">
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    playsInline
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600/90 rounded-lg px-6 py-3 backdrop-blur-sm">
                    <p className="text-white text-sm font-medium">
                        {error}
                    </p>
                    <p className="text-white/70 text-xs mt-1 text-center">
                        Trying fallback players...
                    </p>
                </div>
            )}
        </div>
    );
}
