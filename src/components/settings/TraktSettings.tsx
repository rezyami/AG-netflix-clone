"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Share2, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { Focusable } from "@/components/tv/Focusable";

export const TraktSettings: React.FC = () => {
    const { data: session, status } = useSession();
    const isConnected = !!session?.user;

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
            <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Connection Status</h2>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-xl ${isConnected ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'}`}>
                                <Share2 className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">{isConnected ? "Connected to Trakt.tv" : "Trakt.tv Not Connected"}</h3>
                                <p className="text-gray-400">
                                    {isConnected
                                        ? `Logged in as ${session?.user?.name || "User"}`
                                        : "Sync your watch history, ratings, and recommendations."}
                                </p>
                            </div>
                        </div>

                        <Focusable
                            focusKey="trakt-action"
                            onPress={() => isConnected ? signOut() : signIn("trakt")}
                            className={`px-6 py-3 rounded-lg font-bold uppercase tracking-wider flex items-center gap-2 transition-all outline-none ${isConnected
                                    ? "bg-white/10 text-white hover:bg-white/20"
                                    : "bg-[#ed1c24] text-white hover:bg-[#d01018]"
                                }`}
                            focusedClassName="ring-4 ring-white/20 scale-105"
                        >
                            {isConnected ? (
                                <>
                                    <LogOut className="w-5 h-5" />
                                    <span>Disconnect</span>
                                </>
                            ) : (
                                <span>Connect Trakt</span>
                            )}
                        </Focusable>
                    </div>
                </div>
            </section>

            {isConnected && (
                <section className="space-y-6">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Sync Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <span>Sync Watch History</span>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                <span>Sync Ratings</span>
                            </div>
                            <div className="w-10 h-5 bg-green-500 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="text-sm font-semibold text-yellow-300 uppercase">Information</p>
                    <p className="text-sm text-gray-300 italic">Watch history from Live TV (IPTV) is not currently synchronized with Trakt.tv. This feature is coming soon.</p>
                </div>
            </div>
        </div>
    );
};
