'use client';

import { M3UEntry } from "@/lib/m3u";
import { Play } from "lucide-react";

interface EPGPreviewPaneProps {
    channel: M3UEntry | null;
}

export default function EPGPreviewPane({ channel }: EPGPreviewPaneProps) {
    if (!channel) {
        return (
            <div className="flex-[2] flex items-center justify-center bg-black/60">
                <div className="text-zinc-600 text-center">
                    <Play size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xl font-bold">Select a channel to preview</p>
                </div>
            </div>
        );
    }

    const { currentProgram, nextProgram } = channel;

    return (
        <div className="flex-[2.5] relative flex flex-col overflow-hidden bg-black">
            {/* Background Image / Placeholder */}
            {channel.logo && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={channel.logo}
                        alt=""
                        className="w-full h-full object-cover opacity-20 blur-xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
            )}

            {/* EPG Overlay Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end p-12 space-y-8">
                {currentProgram && (
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <span className="text-cyan-400 font-bold uppercase text-sm tracking-widest">En cours</span>
                        </div>

                        <h1 className="text-5xl font-black text-white leading-tight">
                            {currentProgram.title}
                        </h1>

                        <div className="flex items-center gap-4 text-white/90">
                            <span className="font-bold text-lg">{currentProgram.start}</span>

                            <div className="flex-1 max-w-xs h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all duration-1000"
                                    style={{ width: `${currentProgram.progress}%` }}
                                />
                            </div>

                            <span className="font-bold text-lg opacity-60">{currentProgram.end}</span>
                        </div>

                        <p className="text-xl text-zinc-300 leading-relaxed line-clamp-4">
                            {currentProgram.description}
                        </p>
                    </div>
                )}

                {nextProgram && (
                    <div className="pt-8 border-t border-zinc-800/50 max-w-2xl">
                        <div className="space-y-1">
                            <span className="text-cyan-400 font-bold uppercase text-[10px] tracking-[0.2em]">Suivant</span>
                            <h3 className="text-2xl font-bold text-white opacity-90">
                                {nextProgram.title}
                            </h3>
                        </div>
                    </div>
                )}
            </div>

            {/* Top Right Options */}
            <div className="absolute top-12 right-12 z-20 flex flex-col items-end gap-2">
                <div className="text-gray-400 text-sm font-bold tracking-widest">15:02</div>
                <div className="mt-12 flex items-center gap-2 group cursor-pointer text-white/60 hover:text-white transition-colors">
                    <span className="text-xl font-bold uppercase tracking-tight">OPTIONS</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Play Button Overlay (Optional hint) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* This could be a static image preview if we had one */}
                {channel.logo && (
                    <img
                        src={channel.logo}
                        alt=""
                        className="w-1/3 max-h-[40%] object-contain opacity-40 grayscale"
                    />
                )}
            </div>
        </div>
    );
}
