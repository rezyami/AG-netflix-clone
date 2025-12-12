import Navbar from "@/components/Navbar";
import MovieRow from "@/components/MovieRow";
import CastList from "@/components/CastList";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import { findStream, getM3UEntryById } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";
import MovieControls from "@/components/MovieControls";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function MovieDetailsPage({ params }: PageProps) {
    const { id } = await params;
    let movie: any;
    let streamEntry: any;

    try {
        const numericId = parseInt(id);
        if (isNaN(numericId)) throw new Error("Invalid ID");
        movie = await tmdb.getDetails("movie", numericId);
        streamEntry = await findStream(movie.title);
    } catch (error) {
        // Fallback to M3U ID lookup
        console.log(`TMDB lookup failed for ID ${id}, trying M3U lookup...`);
        const m3uEntry = await getM3UEntryById(parseInt(id));
        if (m3uEntry) {
            movie = mapM3UToMediaItem(m3uEntry);
            streamEntry = m3uEntry;
            // Ensure runtime exists (optional)
            if (!movie.runtime) movie.runtime = 0;
            // Ensure release_date exists
            if (!movie.release_date) movie.release_date = new Date().toISOString();
        } else {
            throw error; // Rethrow if not found
        }
    }

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full">
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full px-4 pb-12 md:px-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {movie.title}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                        <span className="text-green-500 font-semibold">{Math.round(movie.vote_average * 10)}% Match</span>
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                        <span className="border border-gray-500 px-1 rounded text-xs">HD</span>
                    </div>

                    <p className="max-w-2xl text-white text-lg mb-8 line-clamp-3 md:line-clamp-none">
                        {movie.overview}
                    </p>

                    <MovieControls streamUrl={streamEntry?.url} mediaItem={movie} />
                </div>
            </div>

            {/* Content */}
            <div className="pb-20">
                <CastList cast={movie.credits.cast} />

                <div className="mt-12">
                    <MovieRow title="More Like This" movies={movie.similar.results} />
                </div>
            </div>
        </div>
    );
}
