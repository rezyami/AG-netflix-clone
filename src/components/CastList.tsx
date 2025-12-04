import Image from "next/image";
import { Cast } from "@/types/tmdb";

interface CastListProps {
    cast: Cast[];
}

export default function CastList({ cast }: CastListProps) {
    if (!cast || cast.length === 0) return null;

    return (
        <div className="px-4 md:px-12 mt-8">
            <h3 className="text-white font-semibold text-lg mb-4">Cast</h3>
            <div className="flex overflow-x-scroll space-x-4 scrollbar-hide no-scrollbar pb-4">
                {cast.slice(0, 20).map((person) => (
                    <div key={person.id} className="min-w-[120px] md:min-w-[140px] text-center">
                        <div className="relative h-40 w-full mb-2">
                            {person.profile_path ? (
                                <Image
                                    src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                    alt={person.name}
                                    fill
                                    className="object-cover rounded-md"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-800 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                    No Image
                                </div>
                            )}
                        </div>
                        <p className="text-white text-sm font-medium truncate">{person.name}</p>
                        <p className="text-gray-400 text-xs truncate">{person.character}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
