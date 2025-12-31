'use client';

import Image from 'next/image';
import { Play, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
    showTraktId?: number;
    showTmdbId?: number;
}

export default function EpisodeList({ episodes, seasonNumber, showName, showTraktId, showTmdbId }: EpisodeListProps) {
    const { data: session } = useSession();
    const [playingEpisode, setPlayingEpisode] = useState<{ url: string; title: string } | null>(null);
    const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set());

    // Fetch watched episodes from Trakt
    useEffect(() => {
        if (!session || !showTraktId) return;

        const fetchWatchedEpisodes = async () => {
            try {
                const response = await fetch(`/api/trakt/show-progress?showTraktId=${showTraktId}`);
                if (response.ok) {
                    const data = await response.json();

                    // Extract watched episode numbers for the current season
                    const watched = new Set<number>();
                    const currentSeason = data.seasons?.find((s: any) => s.number === seasonNumber);

                    if (currentSeason?.episodes) {
                        currentSeason.episodes.forEach((ep: any) => {
                            if (ep.completed) {
                                watched.add(ep.number);
                            }
                        });
                    }

                    setWatchedEpisodes(watched);
                }
            } catch (error) {
                console.error("Error fetching watched episodes:", error);
            }
        };

        fetchWatchedEpisodes();
    }, [session, showTraktId, seasonNumber]);

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
                {episodes.map((episode) => {
                    const isWatched = watchedEpisodes.has(episode.episode_number);

                    return (
                        <div
                            key={episode.id}
                            onClick={() => handleEpisodeClick(episode)}
                            className="group flex gap-4 bg-[#2a2a2a] rounded-md overflow-hidden hover:bg-[#3a3a3a] transition-colors cursor-pointer relative"
                        >
                            {/* Watched indicator */}
                            {isWatched && (
                                <div className="absolute top-2 left-2 z-10 bg-green-600 rounded-full p-1">
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                </div>
                            )}

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
                                    <h3 className={`font-semibold ${isWatched ? 'text-gray-400' : 'text-white'}`}>
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
                    );
                })}
            </div>

            {playingEpisode && (
                <VideoPlayer
                    src={playingEpisode.url}
                    title={playingEpisode.title}
                    onClose={() => setPlayingEpisode(null)}
                    tmdbId={showTmdbId}
                    mediaType="tv"
                    season={seasonNumber}
                    episode={episodes.find(e => playingEpisode.title.includes('E' + e.episode_number.toString().padStart(2, '0')))?.episode_number}
                />
            )}
        </>
    );
}
