'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';


interface VideoPlayerProps {
    src: string;
    onClose: () => void;
    onNext?: () => void;
    onPrev?: () => void;
}

export default function VideoPlayer({ src, onClose, onNext, onPrev }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mpegtsRef = useRef<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("Initializing...");

    // Handle Remote Control / Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.stopPropagation(); // Stop global focus nav

            const video = videoRef.current;
            if (!video) return;

            switch (e.key) {
                case "Enter":
                case " ":
                    if (video.paused) video.play();
                    else video.pause();
                    break;
                case "ArrowLeft":
                    if (onPrev) onPrev();
                    else video.currentTime -= 10;
                    break;
                case "ArrowRight":
                    if (onNext) onNext();
                    else video.currentTime += 10;
                    break;
                case "ArrowUp":
                    if (onPrev) onPrev();
                    break;
                case "ArrowDown":
                    if (onNext) onNext();
                    break;
                case "Escape":
                case "Backspace":
                    onClose();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown); // Use capture to ensure we get it first? Or just normal
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onNext, onPrev, onClose]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        console.log("Attempting to play URL:", src);
        setError(null);
        setStatus("Loading...");

        // Cleanup previous instances
        const cleanup = () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if (mpegtsRef.current) {
                mpegtsRef.current.destroy();
                mpegtsRef.current = null;
            }
            // Detach native error listeners if possible? 
            // We can't easily remove anonymous listeners, but we can recreate the element or ignore old events.
            // For now, react's effect cleanup is enough for refs.
            video.removeAttribute('src');
            video.load();
        };

        cleanup();

        // Strategy 1: Try HLS first (Standard for M3U8, and often needed for adaptive streaming)
        const tryHLS = () => {
            setStatus("Trying HLS...");
            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    // Determine if we should treat extensionless as HLS?
                    // hls.js usually auto-detects.
                });
                hlsRef.current = hls;

                hls.loadSource(src);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    console.log("HLS Manifest parsed, playing...");
                    setStatus("Playing (HLS)");
                    video.play().catch(e => {
                        if (e.name === 'AbortError') return;
                        console.error("Play error:", e)
                    });
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    console.warn("HLS Error:", data.type, data.details);
                    if (data.fatal) {
                        // On Fatal error (like manifestLoadError), switch strategy
                        console.warn("HLS Fatal Error, trying fallback...");
                        hls.destroy();
                        hlsRef.current = null;
                        tryMpegTS();
                    }
                });
            } else {
                tryNative(); // Safari or non-MSE
            }
        };

        // Strategy 2: Try MPEG-TS (Common for IPTV raw streams)
        const tryMpegTS = async () => {
            console.log("Switching to MPEG-TS player...");
            setStatus("Trying MPEG-TS...");

            try {
                // Dynamic import to avoid SSR window error
                // @ts-ignore
                const mpegts = (await import('mpegts.js')).default;

                if (mpegts.getFeatureList().mseLivePlayback) {
                    try {
                        // Disable internal logging to prevent console spam
                        if (mpegts.LoggingControl) {
                            mpegts.LoggingControl.enableAll = false;
                            mpegts.LoggingControl.enableDebug = false;
                            mpegts.LoggingControl.enableVerbose = false;
                        }

                        const player = mpegts.createPlayer({
                            type: 'mpegts',
                            url: src,
                            isLive: true,
                            cors: true, // Try to request with CORS
                        });
                        mpegtsRef.current = player;
                        player.attachMediaElement(video);
                        player.load();

                        // Safe play call
                        try {
                            const playPromise = player.play();
                            if (playPromise && typeof playPromise.then === 'function') {
                                playPromise
                                    .then(() => setStatus("Playing (MPEG-TS)"))
                                    .catch((e: any) => {
                                        if (e.name === 'AbortError') return;
                                        console.warn("MPEG-TS play promise error:", e);
                                        // Don't immediately fallback on play error, wait for error event?
                                        // actually play error is usually fatal for autoplay.
                                        tryNative();
                                    });
                            } else {
                                setStatus("Playing (MPEG-TS)");
                            }
                        } catch (e) {
                            console.warn("MPEG-TS synchronous play error:", e);
                            tryNative();
                        }

                        player.on(mpegts.Events.ERROR, (type: any, details: any, data: any) => {
                            console.warn("MPEG-TS Error:", type, details, data);
                            // On any error, try to destroy and fallback
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

        // Strategy 3: Native Video Tag (Last resort)
        const tryNative = () => {
            console.log("Switching to Native player...");
            setStatus("Trying Native Player...");
            video.src = src;

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setStatus("Playing (Native)"))
                    .catch(e => {
                        if (e.name === 'AbortError') return;
                        console.error("Native play error:", e);
                        setError(`Playback Failed (Native): ${e.message}. Possible CORS, Format, or Decoding issue.`);
                        setStatus("Failed");
                    });
            }
        };

        // Start chain
        tryHLS();

        return () => {
            cleanup();
        };
    }, [src]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full"
                style={{ zIndex: 60 }}
            >
                <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-6xl aspect-video bg-black relative flex items-center justify-center">
                {error ? (
                    <div className="text-white text-center p-8 bg-red-900/50 rounded max-w-lg">
                        <h3 className="text-xl font-bold mb-2">Playback Error</h3>
                        <p className="font-mono text-sm break-all mb-4">{error}</p>
                        <hr className="border-white/20 my-4" />
                        <div className="text-left text-sm space-y-2 text-gray-300">
                            <p><strong>Troubleshooting:</strong></p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>CORS Blocked:</strong> If debugging locally, streams from external servers are often blocked by browser security. Try installing a "Allow CORS" extension.</li>
                                <li><strong>Format Support:</strong> The stream might be an unsupported format (like raw MPEG-TS) for this browser.</li>
                                <li><strong>Broken Link:</strong> The stream URL might be expired or offline.</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full group">
                        <video
                            ref={videoRef}
                            controls
                            className="w-full h-full"
                            playsInline
                        >
                            Your browser does not support the video tag.
                        </video>
                        {/* Status Indicator overlay */}
                        <div className="absolute top-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity opacity-0 group-hover:opacity-100">
                            Status: {status}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
