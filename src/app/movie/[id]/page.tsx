import Navbar from "@/components/Navbar";
export const dynamic = "force-dynamic";
import MovieRow from "@/components/MovieRow";
import CastList from "@/components/CastList";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import { findStream, getM3UEntryById, getVODAndSeriesCategories } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";
import { enrichMediaItem } from "@/lib/tmdbBinder";
import MovieControls from "@/components/MovieControls";
import TraktActions from "@/components/TraktActions";

interface PageProps {
    params: Promise<{ id: string }>;
}


export default async function MovieDetailsPage({ params }: PageProps) {
    const { id } = await params;
    let movie: any;
    let streamEntry: any;
    const m3uCategories = await getVODAndSeriesCategories();
    const isM3UParams = m3uCategories.length > 0;

    const fetchM3U = async () => {
        const m3uEntry = await getM3UEntryById(parseInt(id));
        if (m3uEntry) {
            const basicMovie = mapM3UToMediaItem(m3uEntry);
            movie = await enrichMediaItem(basicMovie) as any;
            streamEntry = m3uEntry;
            if (!movie.runtime) movie.runtime = 0;
            if (!movie.release_date) movie.release_date = new Date().toISOString();
            // M3U entries don't have credits or similar movies by default
            if (!movie.credits) movie.credits = { cast: [], crew: [] };
            if (!movie.similar) movie.similar = { results: [] };
            return true;
        }
        return false;
    };

    const fetchTMDB = async () => {
        try {
            const numericId = parseInt(id);
            if (isNaN(numericId)) return false;
            movie = await tmdb.getDetails("movie", numericId);
            if (!movie) return false;
            streamEntry = await findStream(movie.title);
            return true;
        } catch (e) {
            return false;
        }
    };

    if (isM3UParams) {
        // Try M3U first
        if (!(await fetchM3U())) {
            // Fallback to TMDB if M3U lookup fails (though unlikely if ID came from M3U list)
            // or maybe explicit "Don't show TMDB" if we are strictly M3U?
            // But let's allow fallback if it's a legacy link
            await fetchTMDB();
        }
    } else {
        // Validation/Standard TMDB
        if (!(await fetchTMDB())) {
            // Fallback for M3U if TMDB fails
            await fetchM3U();
        }
    }

    if (!movie) {
        // Handle not found
        return (
            <div className="min-h-screen bg-[#141414] text-white pt-24 px-4 text-center">
                <Navbar />
                <h1 className="text-2xl mb-4">Content Not Found</h1>
                <p>The requested content could not be found.</p>
            </div>
        );
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
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 uppercase">
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

                    <div className="mt-4">
                        <TraktActions
                            mediaType="movie"
                            title={movie.title}
                            year={movie.release_date ? new Date(movie.release_date).getFullYear() : undefined}
                            tmdbId={parseInt(id)}
                        />
                    </div>
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
