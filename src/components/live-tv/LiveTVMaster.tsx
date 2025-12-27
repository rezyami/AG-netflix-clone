'use client';

import { useState, useEffect } from 'react';
import { M3UEntry } from '@/lib/m3u';
import LiveTVSidebar from './LiveTVSidebar';
import ChannelListPane from './ChannelListPane';
import EPGPreviewPane from './EPGPreviewPane';
import LiveTVControls from './LiveTVControls';
import LiveChannelPlayer from '@/components/LiveChannelPlayer';

interface LiveTVMasterProps {
    categories: { category: string; count: number }[];
    initialCategory?: string;
}

export default function LiveTVMaster({ categories, initialCategory }: LiveTVMasterProps) {
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || categories[0]?.category || '');
    const [channels, setChannels] = useState<M3UEntry[]>([]);
    const [focusedChannel, setFocusedChannel] = useState<M3UEntry | null>(null);
    const [selectedChannel, setSelectedChannel] = useState<M3UEntry | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (selectedCategory) {
            setIsLoading(true);
            fetch(`/api/live-tv/channels?category=${encodeURIComponent(selectedCategory)}`)
                .then(res => res.json())
                .then(data => {
                    setChannels(data);
                    // Autofocus first channel in new category
                    if (data.length > 0) {
                        setFocusedChannel(data[0]);
                    }
                })
                .finally(() => setIsLoading(false));
        }
    }, [selectedCategory]);

    const handleChannelSelect = (channel: M3UEntry) => {
        setSelectedChannel(channel);
    };

    return (
        <div className="h-screen w-screen bg-black flex flex-col text-white overflow-hidden select-none">
            {/* Minimal Navbar or Header */}
            <div className="h-16 flex items-center px-12 z-20">
                <h1 className="text-2xl font-black italic text-cyan-500 tracking-tighter">
                    IPTV <span className="text-white/20 mx-2">/</span> <span className="text-white font-bold not-italic tracking-normal text-xl">{selectedCategory}</span>
                </h1>
            </div>

            <main className="flex-1 flex overflow-hidden">
                <LiveTVSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={setSelectedCategory}
                />

                <ChannelListPane
                    channels={channels}
                    selectedChannel={selectedChannel}
                    focusedChannel={focusedChannel}
                    onChannelSelect={handleChannelSelect}
                    onChannelFocus={setFocusedChannel}
                />

                <EPGPreviewPane channel={focusedChannel} />
            </main>

            <LiveTVControls />

            {selectedChannel && (
                <LiveChannelPlayer
                    channel={selectedChannel}
                    onClose={() => setSelectedChannel(null)}
                    onNext={() => {
                        const idx = channels.findIndex(c => c.url === selectedChannel.url);
                        if (idx < channels.length - 1) setSelectedChannel(channels[idx + 1]);
                    }}
                    onPrev={() => {
                        const idx = channels.findIndex(c => c.url === selectedChannel.url);
                        if (idx > 0) setSelectedChannel(channels[idx - 1]);
                    }}
                />
            )}
        </div>
    );
}
