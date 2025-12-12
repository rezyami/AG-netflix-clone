'use client';

import { useState, useEffect } from 'react';
import EpisodeList from './EpisodeList';
import { getSeason } from '@/actions/getSeason';

interface Season {
    id: number;
    name: string;
    season_number: number;
}

interface SeasonSelectorProps {
    tvId: number;
    seasons: Season[];
    showName: string;
}

export default function SeasonSelector({ tvId, seasons, showName }: SeasonSelectorProps) {
    const [activeSeason, setActiveSeason] = useState(seasons[0]?.season_number || 1);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEpisodes = async () => {
            // Check if active season already has episodes (populated from M3U)
            const currentSeason = seasons.find(s => s.season_number === activeSeason);
            if (currentSeason && (currentSeason as any).episodes && (currentSeason as any).episodes.length > 0) {
                setEpisodes((currentSeason as any).episodes);
                return;
            }

            setLoading(true);
            try {
                const seasonData = await getSeason(tvId, activeSeason);
                setEpisodes(seasonData?.episodes || []);
            } catch (error) {
                console.error('Failed to fetch episodes:', error);
                setEpisodes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEpisodes();
    }, [tvId, activeSeason, seasons]);

    if (!seasons || seasons.length === 0) {
        return null;
    }

    return (
        <div className="mt-8">
            {/* Season Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {seasons.map((season) => (
                    <button
                        key={season.id}
                        onClick={() => setActiveSeason(season.season_number)}
                        className={`px-6 py-2 rounded-md font-semibold whitespace-nowrap transition-colors ${activeSeason === season.season_number
                            ? 'bg-white text-black'
                            : 'bg-[#2a2a2a] text-white hover:bg-[#3a3a3a]'
                            }`}
                    >
                        {season.name}
                    </button>
                ))}
            </div>

            {/* Episodes */}
            {loading ? (
                <div className="text-gray-400 text-center py-8">Loading episodes...</div>
            ) : (
                <EpisodeList episodes={episodes} seasonNumber={activeSeason} showName={showName} />
            )}
        </div>
    );
}
