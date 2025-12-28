"use client";

import React from "react";
import { Tv, Globe, Settings2, ShieldCheck } from "lucide-react";

export const IPTVSettings: React.FC = () => {
    const m3uUrl = process.env.NEXT_PUBLIC_IPTV_M3U_URL || "";
    const isSetup = !!m3uUrl;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Status</h2>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10 flex items-center gap-6">
                    <div className={`p-4 rounded-full ${isSetup ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-500'}`}>
                        <Tv className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold">{isSetup ? "IPTV Connected" : "IPTV Not Configured"}</h3>
                        <p className="text-gray-400">
                            {isSetup
                                ? "Your M3U playlist is loaded and synchronized."
                                : "No M3U URL found in your environment variables."}
                        </p>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Configuration Details</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-semibold">M3U Playlist Source</p>
                                <p className="text-sm text-gray-400 font-mono truncate max-w-md">
                                    {m3uUrl || "Not defined"}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-tighter bg-white/10 px-2 py-1 rounded">Read Only</span>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-gray-400" />
                            <div>
                                <p className="font-semibold">Stream Proxy</p>
                                <p className="text-sm text-gray-400">Automatic SSL proxying for insecure streams is enabled.</p>
                            </div>
                        </div>
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    </div>
                </div>
            </section>

            <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                <Settings2 className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-300 uppercase">Pro Tip</p>
                    <p className="text-sm text-gray-300">To update your M3U URL, modify the <code className="bg-white/10 px-1 rounded">IPTV_M3U_URL</code> variable in your Vercel dashboard or <code className="bg-white/10 px-1 rounded">.env.local</code> file and restart the server.</p>
                </div>
            </div>
        </div>
    );
};
