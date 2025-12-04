'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

import LiveChannelPlayer from '@/components/LiveChannelPlayer';
import { M3UEntry } from '@/lib/m3u';
import { ArrowLeft } from 'lucide-react';

interface CategoryChannelsClientProps {
    category: string;
    channels: M3UEntry[];
}

export default function CategoryChannelsClient({ category, channels }: CategoryChannelsClientProps) {
    const router = useRouter();
    const [selectedChannel, setSelectedChannel] = useState<M3UEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredChannels = channels.filter(channel =>
        channel.rawTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleChannelClick = (channel: M3UEntry) => {
        setSelectedChannel(channel);
    };

    const handleClosePlayer = () => {
        setSelectedChannel(null);
    };

    return (
        <>
            <div className="min-h-screen bg-[#000000] text-white font-sans">
                <Navbar />

                <main className="pt-24 pb-20 h-screen flex flex-col">
                    {/* Header Bar */}
                    <div className="bg-gradient-to-b from-[#2b5d9b] to-[#1a3a6c] px-4 py-2 flex items-center justify-between border-b border-[#4a7ec0] shadow-md mx-4 rounded-t-lg">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1 text-white hover:text-yellow-300 transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-bold text-shadow-sm">BACK</span>
                            </button>
                            <div className="h-6 w-px bg-[#4a7ec0]"></div>
                            <h1 className="text-xl font-bold text-white uppercase tracking-wide text-shadow-sm">
                                {category}
                            </h1>
                        </div>
                        <div className="text-sm font-medium text-gray-200">
                            {filteredChannels.length} RECORDS
                        </div>
                    </div>

                    {/* Search Bar (Styled to fit) */}
                    <div className="bg-[#112a4d] px-4 py-2 mx-4 border-x border-[#4a7ec0]">
                        <input
                            type="text"
                            placeholder="SEARCH CHANNELS..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#0a1a30] text-white px-3 py-1 rounded border border-[#2b5d9b] focus:border-yellow-400 focus:outline-none text-sm uppercase"
                        />
                    </div>

                    {/* Channels List */}
                    <div className="flex-1 overflow-y-auto mx-4 border-x border-b border-[#4a7ec0] bg-[#0a1a30] custom-scrollbar">
                        {filteredChannels.length > 0 ? (
                            <div className="flex flex-col">
                                {filteredChannels.map((channel, index) => {
                                    const isSelected = selectedChannel?.url === channel.url;
                                    return (
                                        <div
                                            key={`${channel.url}-${index}`}
                                            onClick={() => handleChannelClick(channel)}
                                            className={`
                                                flex items-center gap-2 px-2 py-1 cursor-pointer border-b border-[#2b5d9b]/50 select-none
                                                ${isSelected
                                                    ? 'bg-gradient-to-b from-[#ffffff] to-[#b0c4de] text-black'
                                                    : 'bg-gradient-to-b from-[#1e4b83] to-[#102a4d] hover:from-[#2b5d9b] hover:to-[#1a3a6c] text-white'}
                                            `}
                                        >
                                            {/* Index */}
                                            <div className={`
                                                w-10 h-6 flex items-center justify-center text-sm font-bold rounded shadow-inner border
                                                ${isSelected ? 'bg-[#d0e0f0] border-[#a0b0c0] text-black' : 'bg-[#e0e0e0] border-[#b0b0b0] text-black'}
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Logo/Icon Placeholder */}
                                            <div className="w-8 h-6 bg-black/20 rounded flex items-center justify-center overflow-hidden border border-white/10">
                                                {channel.logo ? (
                                                    <img src={channel.logo} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="text-[10px] opacity-50">TV</div>
                                                )}
                                            </div>

                                            {/* Icons */}
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <span className="text-xs">★</span> {/* Star */}
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-400">
                                                <span className="text-xs">🕒</span> {/* Clock */}
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 font-semibold text-sm truncate px-2 uppercase shadow-black drop-shadow-md">
                                                {channel.title}
                                            </div>

                                            {/* Type/Quality Badge */}
                                            <div className="text-[10px] font-bold px-1 rounded bg-white/10 border border-white/20">
                                                {channel.title.includes('HD') ? 'HD' : 'SD'}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <div className="text-4xl mb-2">🔍</div>
                                <p>NO CHANNELS FOUND</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Status Bar */}
                    <div className="mx-4 mt-1 bg-gradient-to-b from-[#e0e0e0] to-[#b0b0b0] px-4 py-1 rounded-b-lg flex items-center gap-4 border-t border-white/50 shadow-lg">
                        <button className="flex items-center gap-1 px-3 py-1 bg-gradient-to-b from-[#ff4444] to-[#cc0000] text-white text-xs font-bold rounded shadow border border-[#aa0000] active:translate-y-px">
                            <div className="w-2 h-2 rounded-full bg-red-900/50"></div>
                            VIEW
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-gradient-to-b from-[#44ff44] to-[#00cc00] text-white text-xs font-bold rounded shadow border border-[#00aa00] active:translate-y-px">
                            <div className="w-2 h-2 rounded-full bg-green-900/50"></div>
                            SORT
                        </button>
                        <div className="flex-1 text-right text-xs font-bold text-gray-700 shadow-white drop-shadow-sm">
                            PAGE 1 FROM 1. FOUND {filteredChannels.length} RECORDS.
                        </div>
                    </div>
                </main>
            </div>

            {/* Channel Player Modal */}
            {selectedChannel && (
                <LiveChannelPlayer
                    channel={selectedChannel}
                    onClose={handleClosePlayer}
                />
            )}
        </>
    );
}
