'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

import LiveChannelPlayer from '@/components/LiveChannelPlayer';
import { M3UEntry } from '@/lib/m3u';
import { ArrowLeft, Play, Search } from 'lucide-react';

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
            <div className="min-h-screen bg-[#141414] text-white font-sans">
                <Navbar />

                <main className="pt-24 pb-20 h-screen flex flex-col">
                    {/* Header Bar */}
                    <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between border-b border-zinc-800 mx-4 rounded-t-md">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span className="font-medium text-sm">Back</span>
                            </button>
                            <div className="h-6 w-px bg-zinc-700"></div>
                            <h1 className="text-xl font-bold text-white tracking-tight">
                                {category}
                            </h1>
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                            {filteredChannels.length} Channels
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="bg-zinc-900 px-6 py-3 mx-4 border-x border-zinc-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search channels..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black text-white pl-10 pr-4 py-2 rounded border border-zinc-700 focus:border-white focus:outline-none text-sm transition-colors placeholder-gray-600"
                            />
                        </div>
                    </div>

                    {/* Channels List */}
                    <div className="flex-1 overflow-y-auto mx-4 border-x border-b border-zinc-800 bg-[#141414] custom-scrollbar">
                        {filteredChannels.length > 0 ? (
                            <div className="flex flex-col">
                                {filteredChannels.map((channel, index) => {
                                    const isSelected = selectedChannel?.url === channel.url;
                                    return (
                                        <div
                                            key={`${channel.url}-${index}`}
                                            onClick={() => handleChannelClick(channel)}
                                            className={`
                                                group flex items-center gap-4 px-6 py-3 cursor-pointer border-b border-zinc-800 transition-colors
                                                ${isSelected
                                                    ? 'bg-zinc-800'
                                                    : 'hover:bg-zinc-900'}
                                            `}
                                        >
                                            {/* Index */}
                                            <div className={`
                                                w-8 text-center text-sm font-medium
                                                ${isSelected ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}
                                            `}>
                                                {index + 1}
                                            </div>

                                            {/* Logo/Icon Placeholder */}
                                            <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center overflow-hidden border border-zinc-700 relative">
                                                {channel.logo ? (
                                                    <img src={channel.logo} alt="" className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <div className="text-[10px] text-gray-600 font-bold">TV</div>
                                                )}
                                                {/* Play overlay on hover */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <Play className="h-4 w-4 text-white fill-white" />
                                                </div>
                                            </div>

                                            {/* Name */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-medium text-sm truncate ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {channel.title}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {channel.title.includes('HD') && (
                                                        <span className="text-[10px] font-bold px-1 rounded border border-gray-600 text-gray-400">
                                                            HD
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Icon (Chevron or similar, optional) */}
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#E50914]"></div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                                <Search className="h-12 w-12 mb-4 opacity-20" />
                                <p>No channels found</p>
                            </div>
                        )}
                    </div>

                    {/* Footer / Status Bar */}
                    <div className="mx-4 mt-0 bg-zinc-900 px-6 py-3 rounded-b-md flex items-center gap-4 border-t border-zinc-800">
                        <button className="flex items-center gap-2 px-4 py-1.5 bg-[#E50914] hover:bg-[#b20710] text-white text-xs font-bold rounded transition-colors">
                            <Play className="h-3 w-3 fill-white" />
                            PLAY
                        </button>
                        <div className="flex-1 text-right text-xs font-medium text-gray-500">
                            {filteredChannels.length} Channels Available
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

