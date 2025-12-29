'use client';

import { Focusable } from "../tv/Focusable";
import { List } from 'lucide-react';
import { replaceLanguageWrapper } from '@/lib/languages';

interface LiveTVSidebarProps {
    categories: { category: string; count: number }[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
}

export default function LiveTVSidebar({ categories, selectedCategory, onCategorySelect }: LiveTVSidebarProps) {
    return (
        <div className="w-64 flex flex-col border-r border-zinc-800 bg-[#141414] overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center gap-3">
                <List className="text-red-600" size={24} />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Categories</h2>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {categories.map((cat, index) => (
                    <Focusable
                        key={cat.category}
                        focusKey={`sidebar-cat-${index}`}
                        onPress={() => onCategorySelect(cat.category)}
                        className={`
                            px-6 py-4 cursor-pointer transition-all duration-200 outline-none
                            ${selectedCategory === cat.category ? 'bg-cyan-500 text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}
                        `}
                        focusedClassName="bg-zinc-800 ring-2 ring-inset ring-white"
                    >
                        <div className="flex justify-between items-center text-sm">
                            <span className="truncate pr-2">{replaceLanguageWrapper(cat.category)}</span>
                            {/* <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedCategory === cat.category ? 'bg-black/20 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                                {cat.count}
                            </span> */}
                        </div>
                    </Focusable>
                ))}
            </div>
        </div>
    );
}
