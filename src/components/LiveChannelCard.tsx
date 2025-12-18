'use client';

import Image from 'next/image';
import { M3UEntry } from '@/lib/m3u';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { Focusable } from "./tv/Focusable";

interface LiveChannelCardProps {
    channel: M3UEntry;
    onClick: (channel: M3UEntry) => void;
}

export default function LiveChannelCard({ channel, onClick }: LiveChannelCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <Focusable
            focusKey={`channel-${channel.url}-${channel.rawTitle}`}
            onPress={() => onClick(channel)}
            className="group relative cursor-pointer rounded-lg overflow-hidden bg-gray-800 transition-transform duration-300 hover:scale-105 hover:ring-2 hover:ring-red-600 focus:scale-105 focus:ring-4 focus:ring-red-600"
        >
            {/* Channel Logo */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                {channel.logo && !imageError ? (
                    <Image
                        src={channel.logo}
                        alt={channel.rawTitle}
                        fill
                        className="object-contain p-4"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full p-4">
                        <span className="text-white text-center font-semibold text-sm line-clamp-3">
                            {channel.rawTitle}
                        </span>
                    </div>
                )}

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="rounded-full bg-red-600 p-4">
                        <Play className="h-8 w-8 text-white fill-white" />
                    </div>
                </div>
            </div>

            {/* Channel Name */}
            <div className="p-3 bg-gray-900/90">
                <h3 className="text-white text-sm font-medium line-clamp-2 text-center">
                    {channel.rawTitle}
                </h3>
            </div>
        </Focusable>
    );
}
