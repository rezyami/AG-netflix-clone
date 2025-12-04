"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (query) {
                router.push(`/search?q=${encodeURIComponent(query)}`);
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [query, router]);

    const toggleSearch = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    return (
        <div className={cn("flex items-center border border-transparent transition-all duration-300", isOpen ? "border-white bg-black/80 px-2 py-1" : "")}>
            <button
                onClick={toggleSearch}
                className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full p-1"
            >
                <Search className="h-6 w-6 text-white" />
            </button>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Titles, people, genres"
                className={cn(
                    "bg-transparent text-white placeholder-gray-400 outline-none transition-all duration-300",
                    isOpen ? "ml-2 w-48 md:w-64" : "w-0"
                )}
            />
        </div>
    );
}
