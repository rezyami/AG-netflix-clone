"use client";

import React, { useState, useEffect } from "react";
import { Tv, Globe, Settings2, ShieldCheck, Save, RefreshCw, Loader2, Database, Film, MonitorPlay, Radio } from "lucide-react";

interface DBStats {
    total: number;
    movies: number;
    series: number;
    live: number;
    lastSynced: string | null;
    topGroups: { name: string; count: number }[];
}

export const IPTVSettings: React.FC = () => {
    const [m3uUrl, setM3uUrl] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [stats, setStats] = useState<DBStats | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            await Promise.all([fetchSettings(), fetchStats()]);
            setIsLoading(false);
        };
        load();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (data.IPTV_M3U_URL) {
                setM3uUrl(data.IPTV_M3U_URL);
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setStatus(null);
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'IPTV_M3U_URL', value: m3uUrl })
            });

            if (response.ok) {
                setStatus({ type: 'success', message: 'Settings saved successfully!' });
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        setStatus(null);
        try {
            const response = await fetch('/api/admin/sync');
            const data = await response.json();
            if (data.success) {
                setStatus({
                    type: 'success',
                    message: `Sync complete! Processed ${data.total} items.`
                });
                await fetchStats(); // Refresh stats after sync
            } else {
                throw new Error(data.error || 'Sync failed');
            }
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsSyncing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-netflix-red" />
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            {/* Database Status Section */}
            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Database Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 text-netflix-red mb-2">
                            <Database className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Total Items</span>
                        </div>
                        <p className="text-3xl font-black italic">{(stats?.total ?? 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            {stats?.lastSynced ? `Last sync: ${new Date(stats.lastSynced).toLocaleDateString()}` : "Never synced"}
                        </p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                            <Film className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Movies</span>
                        </div>
                        <p className="text-3xl font-black italic">{(stats?.movies ?? 0).toLocaleString()}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 text-purple-400 mb-2">
                            <MonitorPlay className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Series</span>
                        </div>
                        <p className="text-3xl font-black italic">{(stats?.series ?? 0).toLocaleString()}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3 text-green-400 mb-2">
                            <Radio className="w-5 h-5" />
                            <span className="text-xs font-bold uppercase tracking-wider">Live TV</span>
                        </div>
                        <p className="text-3xl font-black italic">{(stats?.live ?? 0).toLocaleString()}</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configuration</h2>
                    {status && (
                        <div className={`text-sm font-semibold px-3 py-1 rounded-full ${status.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                            }`}>
                            {status.message}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Globe className="w-5 h-5" />
                                <label htmlFor="m3uUrl" className="font-semibold text-white">M3U Playlist URL</label>
                            </div>
                            <input
                                id="m3uUrl"
                                type="text"
                                value={m3uUrl}
                                onChange={(e) => setM3uUrl(e.target.value)}
                                placeholder="https://example.com/playlist.m3u"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 outline-netflix-red transition-all font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {isSaving ? "Saving..." : "Save Configuration"}
                            </button>

                            <button
                                onClick={handleSync}
                                disabled={isSyncing || !m3uUrl}
                                className="flex-1 flex items-center justify-center gap-2 py-4 bg-netflix-red text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                                {isSyncing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                {isSyncing ? "Syncing..." : "Sync Database Now"}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-semibold">Stream Security</p>
                                <p className="text-sm text-gray-400">Automatic direct-to-database URI resolution is active.</p>
                            </div>
                        </div>
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>
            </section>

            {stats?.topGroups && stats.topGroups.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Largest Content Groups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.topGroups.map((group, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-sm font-medium truncate max-w-[80%]">{group.name}</span>
                                <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">{group.count}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                <Settings2 className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-300 uppercase tracking-tighter">Pro Tip</p>
                    <p className="text-sm text-gray-300">
                        Syncing the database downloads all media metadata once, allowing the rest of the app to load instantly without waiting for the large M3U file to parse.
                    </p>
                </div>
            </div>
        </div>
    );
};
