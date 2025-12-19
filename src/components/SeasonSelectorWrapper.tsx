"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import SeasonSelector from "./SeasonSelector";

interface Season {
    id: number;
    name: string;
    season_number: number;
}

interface SeasonSelectorWrapperProps {
    tvId: number;
    seasons: Season[];
    showName: string;
    showYear?: number;
}

export default function SeasonSelectorWrapper({
    tvId,
    seasons,
    showName,
    showYear,
}: SeasonSelectorWrapperProps) {
    const { data: session } = useSession();
    const [traktId, setTraktId] = useState<number | null>(null);

    // Fetch Trakt ID for the show
    useEffect(() => {
        if (!session || !showName) return;

        const fetchTraktId = async () => {
            try {
                const response = await fetch(
                    `/api/trakt/search?type=show&title=${encodeURIComponent(showName)}${showYear ? `&year=${showYear}` : ""
                    }`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.traktId) {
                        setTraktId(data.traktId);
                    }
                }
            } catch (error) {
                console.error("Error fetching Trakt ID:", error);
            }
        };

        fetchTraktId();
    }, [session, showName, showYear]);

    return (
        <SeasonSelector
            tvId={tvId}
            seasons={seasons}
            showName={showName}
            showTraktId={traktId}
        />
    );
}
