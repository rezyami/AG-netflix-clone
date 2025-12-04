'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CategoryCard from '@/components/CategoryCard';

interface LiveTVClientProps {
    categories: { category: string; count: number }[];
}

export default function LiveTVClient({ categories }: LiveTVClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(cat =>
        cat.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCategoryClick = (category: string) => {
        // Encode the category for URL
        const encodedCategory = encodeURIComponent(category);
        router.push(`/live-tv/${encodedCategory}`);
    };

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />

            <main className="px-4 pt-32 pb-20 md:px-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Live TV Channels
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Browse {categories.length} categories with thousands of live channels
                    </p>
                </div>

                {/* Search */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-colors"
                    />
                </div>

                {/* Categories Grid */}
                {filteredCategories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredCategories.map(({ category, count }) => (
                            <CategoryCard
                                key={category}
                                category={category}
                                channelCount={count}
                                onClick={() => handleCategoryClick(category)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="text-6xl mb-4">📺</div>
                        <h2 className="text-2xl font-semibold text-white mb-2">
                            No categories found
                        </h2>
                        <p className="text-gray-400">
                            Try adjusting your search query
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
