'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
    src: string;
    onClose: () => void;
}

export default function VideoPlayer({ src, onClose }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Error playing video:", error);
            });
        }
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
            >
                <X className="w-8 h-8" />
            </button>

            <div className="w-full max-w-6xl aspect-video bg-black relative">
                <video
                    ref={videoRef}
                    src={src}
                    controls
                    className="w-full h-full"
                    autoPlay
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
}
