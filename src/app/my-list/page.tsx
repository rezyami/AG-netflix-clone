'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import { MediaItem } from '@/types/tmdb';
import { getMyList, removeFromMyList } from '@/lib/myList';
import { X } from 'lucide-react';

export default function MyListPage() {
    const [myList, setMyList] = useState<MediaItem[]>([]);

    useEffect(() => {
        setMyList(getMyList());

        const handleMyListUpdate = () => {
            setMyList(getMyList());
        };

        window.addEventListener('myListUpdated', handleMyListUpdate);
        return () => window.removeEventListener('myListUpdated', handleMyListUpdate);
    }, []);

    const handleRemove = (id: number) => {
        removeFromMyList(id);
    };

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />

            <main className="px-4 pt-32 pb-20 md:px-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                    My List
                </h1>

                {myList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-center">
                            <div className="text-6xl mb-4">📋</div>
                            <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                                Your list is empty
                            </h2>
                            <p className="text-gray-400 text-lg max-w-md mx-auto">
                                Add movies and TV shows to your list to watch them later.
                                Click the + button on any title to get started.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {myList.map((item) => (
                            <div key={item.id} className="relative group">
                                <MovieCard movie={item} />
                                <button
                                    onClick={() => handleRemove(item.id)}
                                    className="absolute top-2 right-2 bg-black/80 hover:bg-black rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    title="Remove from My List"
                                >
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
