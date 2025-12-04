'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { M3UEntry } from '@/lib/m3u';
import Hls from 'hls.js';
import mpegts from 'mpegts.js';

interface LiveChannelPlayerProps {
    channel: M3UEntry;
    onClose: () => void;
}

export default function LiveChannelPlayer({ channel, onClose }: LiveChannelPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const mpegtsRef = useRef<mpegts.Player | null>(null);

    useEffect(() => {
        // Close on ESC key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const url = channel.url;
        const isM3U8 = url.includes('.m3u8');
        const isTS = url.includes('.ts') || !url.includes('.'); // Assume no extension is MPEG-TS/Xtream

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
        };

        cleanup();

        if (isM3U8) {
            if (Hls.isSupported()) {
                const hls = new Hls();
                hlsRef.current = hls;
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    video.play().catch(e => console.error("Play failed", e));
                });
                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        setError('Stream error: ' + data.details);
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                video.play().catch(e => console.error("Play failed", e));
            } else {
                setError('HLS not supported in this browser.');
            }
        } else if (isTS || true) { // Default to mpegts for others as it handles TS and FLV
            if (mpegts.getFeatureList().mseLivePlayback) {
                const player = mpegts.createPlayer({
                    type: 'mpegts',  // could also be 'flv'
                    url: url,
                    isLive: true,
                });
                mpegtsRef.current = player;
                player.attachMediaElement(video);
                player.load();

                const playPromise = player.play();
                if (playPromise !== undefined) {
                    playPromise.catch((e: Error) => console.error("Play failed", e));
                }

                player.on(mpegts.Events.ERROR, (e: any) => {
                    console.error('MPEGTS error', e);
                    setError('Stream error');
                });
            } else {
                // Fallback to native (might work for some formats)
                video.src = url;
                video.play().catch(e => console.error("Play failed", e));
            }
        }

        return cleanup;
    }, [channel.url]);

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 bg-black/80 hover:bg-black rounded-full p-3 transition-colors"
                aria-label="Close player"
            >
                <X className="h-6 w-6 text-white" />
            </button>

            {/* Channel Info */}
            <div className="absolute top-4 left-4 z-50 bg-black/80 rounded-lg px-4 py-2 backdrop-blur-sm">
                <h2 className="text-white font-semibold text-lg">
                    {channel.rawTitle}
                </h2>
                {channel.group && (
                    <p className="text-gray-400 text-sm">{channel.group}</p>
                )}
            </div>

            {/* Video Player */}
            <div className="w-full h-full flex items-center justify-center">
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600/90 rounded-lg px-6 py-3 backdrop-blur-sm">
                    <p className="text-white text-sm">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
