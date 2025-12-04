'use client';

import { Tv } from 'lucide-react';

interface CategoryCardProps {
    category: string;
    channelCount: number;
    onClick: () => void;
}

export default function CategoryCard({ category, channelCount, onClick }: CategoryCardProps) {
    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-600/30 border border-gray-700 hover:border-red-600"
        >
            {/* Icon */}
            <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full bg-red-600/20 p-4 group-hover:bg-red-600/30 transition-colors">
                    <Tv className="h-8 w-8 text-red-600" />
                </div>
            </div>

            {/* Category Name */}
            <h3 className="text-white text-lg font-bold text-center mb-2 line-clamp-2">
                {category}
            </h3>

            {/* Channel Count */}
            <p className="text-gray-400 text-sm text-center">
                {channelCount} {channelCount === 1 ? 'channel' : 'channels'}
            </p>

            {/* Hover Arrow */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </div>
    );
}
