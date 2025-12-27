"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Plus, Check, Eye } from "lucide-react";

interface TraktActionsProps {
    mediaType: "movie" | "tv";
    title: string;
    year?: number;
    tmdbId?: number;
}

export default function TraktActions({
    mediaType,
    title,
    year,
    tmdbId,
}: TraktActionsProps) {
    const { data: session } = useSession();
    const [traktId, setTraktId] = useState<number | null>(null);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [isWatched, setIsWatched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);

    // Search for the item on Trakt to get the Trakt ID
    useEffect(() => {
        if (!session || !title) return;

        const searchTrakt = async () => {
            setSearchLoading(true);
            try {
                const type = mediaType === "tv" ? "show" : "movie";
                const response = await fetch(
                    `/api/trakt/search?type=${type}&title=${encodeURIComponent(
                        title
                    )}${year ? `&year=${year}` : ""}`
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.traktId) {
                        setTraktId(data.traktId);
                    }
                }
            } catch (error) {
                console.error("Error searching Trakt:", error);
            } finally {
                setSearchLoading(false);
            }
        };

        searchTrakt();
    }, [session, title, year, mediaType]);

    // Check if item is in watchlist or watched
    useEffect(() => {
        if (!session || !traktId) return;

        const checkStatus = async () => {
            try {
                const [watchlistRes, historyRes] = await Promise.all([
                    fetch(`/api/trakt/watchlist?type=${mediaType}`),
                    fetch(`/api/trakt/history?type=${mediaType}`),
                ]);

                if (watchlistRes.ok) {
                    const watchlist = await watchlistRes.json();
                    const inWatchlist = watchlist.some(
                        (item: any) =>
                            item[mediaType === "tv" ? "show" : "movie"]?.ids?.trakt ===
                            traktId
                    );
                    setIsInWatchlist(inWatchlist);
                }

                if (historyRes.ok) {
                    const history = await historyRes.json();
                    const watched = history.some(
                        (item: any) =>
                            item[mediaType === "tv" ? "show" : "movie"]?.ids?.trakt ===
                            traktId
                    );
                    setIsWatched(watched);
                }
            } catch (error) {
                console.error("Error checking Trakt status:", error);
            }
        };

        checkStatus();
    }, [session, traktId, mediaType]);

    const handleAddToWatchlist = async () => {
        if (!session || !traktId) return;

        setLoading(true);
        try {
            const response = await fetch("/api/trakt/watchlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: mediaType === "tv" ? "shows" : "movies",
                    traktId,
                }),
            });

            if (response.ok) {
                setIsInWatchlist(true);
                showNotification("Added to watchlist!");
            } else {
                throw new Error("Failed to add to watchlist");
            }
        } catch (error) {
            console.error("Error adding to watchlist:", error);
            showNotification("Failed to add to watchlist", true);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWatchlist = async () => {
        if (!session || !traktId) return;

        setLoading(true);
        try {
            const response = await fetch("/api/trakt/watchlist", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: mediaType === "tv" ? "shows" : "movies",
                    traktId,
                }),
            });

            if (response.ok) {
                setIsInWatchlist(false);
                showNotification("Removed from watchlist!");
            } else {
                throw new Error("Failed to remove from watchlist");
            }
        } catch (error) {
            console.error("Error removing from watchlist:", error);
            showNotification("Failed to remove from watchlist", true);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsWatched = async () => {
        if (!session || !traktId) return;

        setLoading(true);
        try {
            const response = await fetch("/api/trakt/watched", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: mediaType === "tv" ? "shows" : "movies",
                    traktId,
                }),
            });

            if (response.ok) {
                setIsWatched(true);
                showNotification("Marked as watched!");
            } else {
                throw new Error("Failed to mark as watched");
            }
        } catch (error) {
            console.error("Error marking as watched:", error);
            showNotification("Failed to mark as watched", true);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message: string, isError = false) => {
        // Simple notification - you can replace with a toast library
        const notification = document.createElement("div");
        notification.textContent = message;
        notification.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg text-white font-semibold ${isError ? "bg-red-600" : "bg-green-600"
            } shadow-lg transition-opacity duration-300`;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    };

    if (!session) {
        return (
            <div className="flex gap-2 text-sm text-gray-400">
                <span>Sign in with Trakt to track</span>
            </div>
        );
    }

    if (searchLoading || !traktId) {
        return (
            <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span className="text-sm text-gray-400">Loading Trakt data...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-3">
            {!isInWatchlist ? (
                <button
                    onClick={handleAddToWatchlist}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <Plus className="h-4 w-4" />
                    <span>Add to Watchlist</span>
                </button>
            ) : (
                <button
                    onClick={handleRemoveFromWatchlist}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border-2 border-green-500/50 bg-green-500/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-green-500/30 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                >
                    <Check className="h-4 w-4" />
                    <span>In Watchlist</span>
                </button>
            )}

            {!isWatched && (
                <button
                    onClick={handleMarkAsWatched}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border-2 border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                    <Eye className="h-4 w-4" />
                    <span>Mark as Watched</span>
                </button>
            )}

            {isWatched && (
                <div className="flex items-center gap-2 rounded-lg border-2 border-blue-500/50 bg-blue-500/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                    <Check className="h-4 w-4" />
                    <span>Watched</span>
                </div>
            )}
        </div>
    );
}
