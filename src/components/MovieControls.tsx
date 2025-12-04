'use client';

import { Play, Plus, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './Button';
import VideoPlayer from './VideoPlayer';
import { MediaItem } from '@/types/tmdb';
import { toggleMyList, isInMyList } from '@/lib/myList';

interface MovieControlsProps {
    streamUrl?: string;
    mediaItem?: MediaItem;
    onPlayClick?: () => void;
}

export default function MovieControls({ streamUrl, mediaItem }: MovieControlsProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [inMyList, setInMyList] = useState(false);

    useEffect(() => {
        if (mediaItem) {
            setInMyList(isInMyList(mediaItem.id));
        }
    }, [mediaItem]);

    useEffect(() => {
        const handleMyListUpdate = () => {
            if (mediaItem) {
                setInMyList(isInMyList(mediaItem.id));
            }
        };

        window.addEventListener('myListUpdated', handleMyListUpdate);
        return () => window.removeEventListener('myListUpdated', handleMyListUpdate);
    }, [mediaItem]);

    const handlePlay = () => {
        if (streamUrl) {
            setIsPlaying(true);
        } else {
            // Fallback or notification if no stream is available
            alert("Stream not available for this title.");
        }
    };

    const handleMyListToggle = () => {
        if (mediaItem) {
            toggleMyList(mediaItem);
        }
    };

    return (
        <>
            <div className="flex items-center gap-4">
                <Button icon={Play} size="lg" onClick={handlePlay}>
                    Play
                </Button>
                <Button
                    variant="secondary"
                    icon={inMyList ? Check : Plus}
                    size="lg"
                    onClick={handleMyListToggle}
                    disabled={!mediaItem}
                >
                    {inMyList ? 'In My List' : 'My List'}
                </Button>
            </div>

            {isPlaying && streamUrl && (
                <VideoPlayer
                    src={streamUrl}
                    onClose={() => setIsPlaying(false)}
                />
            )}
        </>
    );
}
