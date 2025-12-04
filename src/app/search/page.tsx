import Navbar from "@/components/Navbar";
import MovieCard from "@/components/MovieCard";
import { tmdb } from "@/lib/tmdb";
import SearchBar from "@/components/SearchBar";

interface PageProps {
    searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
    const { q } = await searchParams;
    const results = q ? await tmdb.search(q) : { results: [] };

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />
            <div className="pt-24 px-4 md:px-16">
                <SearchBar />

                {q && (
                    <h1 className="text-2xl text-white mb-8">
                        Results for &quot;{q}&quot;
                    </h1>
                )}

                {results.results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {results.results.map((item) => (
                            <MovieCard key={item.id} movie={item} className="w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-400 text-center mt-20">
                        No results found. Try searching for something else.
                    </div>
                )}
            </div>
        </div>
    );
}
