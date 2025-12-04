'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);

    // Simple debounce implementation inside the component to avoid creating a new file for now
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query !== initialQuery) {
                if (query) {
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                } else {
                    router.push('/search');
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, router, initialQuery]);

    return (
        <div className="relative w-full max-w-2xl mx-auto mb-8">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-transparent rounded-md leading-5 bg-[#333] text-gray-100 placeholder-gray-400 focus:outline-none focus:bg-[#444] focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search movies, TV shows, genres..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
            />
        </div>
    );
}
