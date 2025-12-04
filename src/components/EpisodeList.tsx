'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import { findStream } from '@/actions/findStream';

interface Episode {
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    still_path: string | null;
    runtime: number | null;
    air_date: string;
}

interface EpisodeListProps {
    episodes: Episode[];
    seasonNumber: number;
    showName?: string;
}

export default function EpisodeList({ episodes, seasonNumber, showName }: EpisodeListProps) {
    const [playingEpisode, setPlayingEpisode] = useState<{ url: string; title: string } | null>(null);

    if (!episodes || episodes.length === 0) {
        return (
            <div className="text-gray-400 text-center py-8">
                No episodes available for this season.
            </div>
        );
    }

    const handleEpisodeClick = async (episode: Episode) => {
        const seasonStr = 'S' + seasonNumber.toString().padStart(2, '0');
        const episodeStr = 'E' + episode.episode_number.toString().padStart(2, '0');
        const searchQuery = showName + ' ' + seasonStr + ' ' + episodeStr;

        const stream = await findStream(searchQuery);

        if (stream) {
            setPlayingEpisode({
                url: stream.url,
                title: showName + ' - ' + seasonStr + episodeStr + ' - ' + episode.name
            });
        } else {
            alert('Stream not available for this episode.\\nSearched for: ' + searchQuery);
        }
    };

    return (
        <>
            <div className="space-y-4">
                {episodes.map((episode) => (
                    <div
                        key={episode.id}
                        onClick={() => handleEpisodeClick(episode)}
                        className="group flex gap-4 bg-[#2a2a2a] rounded-md overflow-hidden hover:bg-[#3a3a3a] transition-colors cursor-pointer"
                    >
                        <div className="relative w-40 h-24 flex-shrink-0">
                            {episode.still_path ? (
                                <Image
                                    src={'https://image.tmdb.org/t/p/w300' + episode.still_path}
                                    alt={episode.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                                    <Play className="w-8 h-8 text-gray-600" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        <div className="flex-1 py-3 pr-4">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-white font-semibold">
                                    {episode.episode_number}. {episode.name}
                                </h3>
                                {episode.runtime && (
                                    <span className="text-gray-400 text-sm">{episode.runtime}m</span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">
                                {episode.overview || 'No description available.'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {playingEpisode && (
                <VideoPlayer
                    src={playingEpisode.url}
                    onClose={() => setPlayingEpisode(null)}
                />
            )}
        </>
    );
}
