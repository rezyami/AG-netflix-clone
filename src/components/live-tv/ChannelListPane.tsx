'use client';

import { M3UEntry } from "@/lib/m3u";
import { Focusable } from "../tv/Focusable";
import { Play, Lock, History, Star } from "lucide-react";

interface ChannelListPaneProps {
    channels: M3UEntry[];
    selectedChannel: M3UEntry | null;
    focusedChannel: M3UEntry | null;
    onChannelSelect: (channel: M3UEntry) => void;
    onChannelFocus: (channel: M3UEntry) => void;
}

export default function ChannelListPane({
    channels,
    selectedChannel,
    focusedChannel,
    onChannelSelect,
    onChannelFocus
}: ChannelListPaneProps) {
    return (
        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-md border-r border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center">
                <h2 className="text-xl font-black text-white italic tracking-tighter text-cyan-500">CHANNELS</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {channels.map((channel, index) => {
                    const isSelected = selectedChannel?.url === channel.url;
                    const isFocused = focusedChannel?.url === channel.url;

                    return (
                        <Focusable
                            key={`${channel.url}-${index}`}
                            focusKey={`channel-${index}`}
                            onPress={() => onChannelSelect(channel)}
                            onFocus={() => onChannelFocus(channel)}
                            className={`
                                group px-6 py-2.5 flex items-center gap-4 cursor-pointer transition-all outline-none
                                ${isSelected ? 'bg-cyan-500 text-black border-l-4 border-white' : 'hover:bg-zinc-800/50 text-white'}
                            `}
                            focusedClassName="bg-cyan-500/90 text-black ring-2 ring-white z-10"
                        >
                            <span className="w-8 text-[13px] font-bold opacity-70">
                                {(index + 1).toString().padStart(3, '0')}
                            </span>

                            <div className="flex-1 truncate font-medium text-[15px]">
                                {channel.title}
                            </div>

                            <div className="flex gap-2 items-center opacity-60 group-hover:opacity-100">
                                <History size={14} />
                                <Lock size={14} />
                                <Star size={14} />
                            </div>
                        </Focusable>
                    );
                })}
            </div>
        </div>
    );
}
