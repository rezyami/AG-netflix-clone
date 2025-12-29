'use client';

import { X, Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize, Minimize, Settings, Subtitles, Check, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface VideoPlayerProps {
    src: string;
    title?: string;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function VideoPlayer({ src, title, onClose, onNext, onPrev }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const mpegtsRef = useRef<any | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSettings, setShowSettings] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(false);

    const [subtitleTracks, setSubtitleTracks] = useState<any[]>([]);
    const [currentSubtitle, setCurrentSubtitle] = useState(-1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const playPromiseRef = useRef<Promise<void> | null>(null);

    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }, [isPlaying]);

    const safePlay = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            setIsLoading(true);
            playPromiseRef.current = video.play();
            await playPromiseRef.current;
            playPromiseRef.current = null;
            setIsLoading(false);
        } catch (error: any) {
            playPromiseRef.current = null;
            if (error.name === 'AbortError') {
                return;
            }
            console.error('SafePlay failed:', error);
            setError(`Playback failed: ${error.message}`);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const cleanup = () => {
            if (hlsRef.current) {
                hlsRef.current.detachMedia();
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (mpegtsRef.current) {
                mpegtsRef.current.destroy();
                mpegtsRef.current = null;
            }
            video.removeAttribute('src');
            try {
                video.load();
            } catch (e) { }
            setError(null);
            setIsLoading(true);
        };

        const setupHls = (url: string) => {
            console.log("Loading stream:", url);

            // Check for direct video formats (mp4, mkv, etc)
            const lowerSrc = src.toLowerCase();
            const isNativeFormat = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.mkv') || lowerSrc.endsWith('.webm') || lowerSrc.endsWith('.mov');

            if (isNativeFormat) {
                console.log("Using native playback for:", lowerSrc);
                video.src = url;
                const onLoaded = () => {
                    safePlay();
                };
                const onError = (e: any) => {
                    console.error("Native playback error:", e);
                    setError("Native playback failed. The video format may not be supported by your browser.");
                    setIsLoading(false);
                };

                video.addEventListener('loadedmetadata', onLoaded, { once: true });
                video.addEventListener('error', onError, { once: true });
                return;
            }

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90,
                    maxBufferLength: 60,
                    maxMaxBufferLength: 120,
                    // Increase timeouts for slower IPTV streams
                    manifestLoadingTimeOut: 30000,
                    manifestLoadingMaxRetry: 6,
                    fragLoadingTimeOut: 30000,
                    fragLoadingMaxRetry: 6,
                    levelLoadingTimeOut: 30000,
                    levelLoadingMaxRetry: 6,
                    xhrSetup: (xhr, url) => {
                        xhr.withCredentials = false;
                    }
                });
                hlsRef.current = hls;
                hls.loadSource(url);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    setSubtitleTracks(hls.subtitleTracks);
                    safePlay();
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        console.error("HLS Fatal Error:", JSON.stringify(data, null, 2));
                        const errorMsg = data.details || data.type || "Unknown HLS Error";
                        setError(`Stream Error: ${errorMsg}`);
                        setIsLoading(false);

                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.log("Network error, attempting recovery...");
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.log("Media error, attempting recovery...");
                                hls.recoverMediaError();
                                break;
                            default:
                                hls.destroy();
                                break;
                        }
                    }
                });

                hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
                    setSubtitleTracks(hls.subtitleTracks);
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.addEventListener('loadedmetadata', () => {
                    safePlay();
                }, { once: true });
            } else {
                setError("Browser does not support HLS playback.");
                setIsLoading(false);
            }
        };

        const useProxy = !src.startsWith('https://') && typeof window !== 'undefined';
        const effectiveUrl = useProxy ? `/api/proxy?url=${encodeURIComponent(src)}` : src;

        // Note: We don't call cleanup() here manually anymore.
        // React's cleanup return will handle destroying the previous instance.
        setupHls(effectiveUrl);

        return cleanup;
    }, [src, safePlay]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => setCurrentTime(video.currentTime);
        const updateDuration = () => setDuration(video.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (videoRef.current.paused) {
                safePlay();
            } else {
                videoRef.current.pause();
            }
        }
    };

    const skip = (amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (time: number) => {
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor((time / 60) % 60);
        const hours = Math.floor(time / 3600);

        const pad = (n: number) => n.toString().padStart(2, '0');

        if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
        return `${minutes}:${pad(seconds)}`;
    };

    const handleSubtitleChange = (index: number) => {
        setCurrentSubtitle(index);
        if (hlsRef.current) {
            hlsRef.current.subtitleTrack = index;
        }
        setShowSubtitles(false);
    };

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden cursor-none select-none"
            onMouseMove={handleMouseMove}
            style={{ cursor: showControls ? 'default' : 'none' }}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                onClick={togglePlay}
                playsInline
            />

            {/* Loading Spinner */}
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <div className="w-16 h-16 border-4 border-netflix-red border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-[60] p-8 text-center">
                    <div className="max-w-md space-y-4">
                        <div className="text-netflix-red font-bold text-xl uppercase tracking-widest">Playback Error</div>
                        <p className="text-white text-lg">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-netflix-red text-white rounded font-bold hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <div className={cn(
                "absolute top-8 left-8 z-50 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                <button onClick={onClose} className="text-white hover:scale-110 transition-transform">
                    <X className="w-10 h-10" />
                </button>
            </div>

            {/* Overlay Controls */}
            <div className={cn(
                "absolute inset-0 bg-black/40 flex flex-col justify-between transition-opacity duration-500",
                showControls ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                {/* Header info */}
                <div className="p-8 pt-12">
                    {title && <h2 className="text-white text-3xl font-bold">{title}</h2>}
                </div>

                {/* Center Play/Pause/Skip */}
                <div className="flex items-center justify-center gap-16 md:gap-32">
                    <button onClick={() => skip(-10)} className="text-white hover:scale-110 transition-transform">
                        <RotateCcw className="w-12 h-12 md:w-16 md:h-16" />
                    </button>
                    <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                        {isPlaying ? <Pause className="w-20 h-20 md:w-24 md:h-24 fill-current" /> : <Play className="w-20 h-20 md:w-24 md:h-24 fill-current" />}
                    </button>
                    <button onClick={() => skip(10)} className="text-white hover:scale-110 transition-transform">
                        <RotateCw className="w-12 h-12 md:w-16 md:h-16" />
                    </button>
                </div>

                {/* Footer Controls */}
                <div className="p-8 space-y-4 bg-gradient-to-t from-black/80 to-transparent">
                    {/* Progress Bar */}
                    <div className="group relative flex items-center w-full h-8">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            value={currentTime}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-netflix-red"
                            style={{
                                background: `linear-gradient(to right, #e50914 ${(currentTime / duration) * 100}%, #4b5563 0%)`
                            }}
                        />
                        <div className="absolute right-0 -top-6 text-white text-sm font-medium">
                            {formatTime(duration - currentTime)}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <button onClick={togglePlay} className="text-white">
                                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                            </button>

                            <div className="flex items-center gap-4 group/volume">
                                <button onClick={() => setIsMuted(!isMuted)} className="text-white">
                                    {isMuted || volume === 0 ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                                </button>
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setVolume(v);
                                        if (videoRef.current) videoRef.current.volume = v;
                                        setIsMuted(v === 0);
                                    }}
                                    className="w-0 group-hover/volume:w-24 transition-all duration-300 h-1 bg-gray-600 rounded-full appearance-none accent-white"
                                />
                            </div>

                            <span className="text-white font-medium">
                                {title || 'Playing Content'}
                            </span>
                        </div>

                        <div className="flex items-center gap-8 text-white relative">
                            <button
                                onClick={() => setShowSubtitles(!showSubtitles)}
                                className={cn("hover:scale-110 transition-transform", showSubtitles && "text-netflix-red")}
                            >
                                <Subtitles className="w-8 h-8" />
                            </button>

                            {showSubtitles && (
                                <div className="absolute bottom-12 right-0 bg-black/90 border border-white/20 rounded-lg p-4 w-64 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <h3 className="text-gray-400 text-sm font-bold mb-4 uppercase">Subtitles</h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => handleSubtitleChange(-1)}
                                            className="flex items-center justify-between w-full text-left p-2 hover:bg-white/10 rounded"
                                        >
                                            <span>Off</span>
                                            {currentSubtitle === -1 && <Check className="w-4 h-4 text-netflix-red" />}
                                        </button>
                                        {subtitleTracks.map((track, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSubtitleChange(i)}
                                                className="flex items-center justify-between w-full text-left p-2 hover:bg-white/10 rounded"
                                            >
                                                <span>{track.name || `Track ${i + 1}`}</span>
                                                {currentSubtitle === i && <Check className="w-4 h-4 text-netflix-red" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={toggleFullscreen}>
                                {isFullscreen ? <Minimize className="w-8 h-8" /> : <Maximize className="w-8 h-8" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Range Styles */}
            <style jsx>{`
                input[type='range']::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #e50914;
                    border-radius: 50%;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                input[type='range']:hover::-webkit-slider-thumb {
                    transform: scale(1.2);
                }
                input[type='range']::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    background: #e50914;
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                }
            `}</style>
        </div>
    );
}
