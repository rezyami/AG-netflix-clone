import Navbar from "@/components/Navbar";
import CastList from "@/components/CastList";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import SeasonSelector from "@/components/SeasonSelector";
import MovieControls from "@/components/MovieControls";
import { findStream } from "@/lib/m3u";
import MovieRow from "@/components/MovieRow";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TVDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const show = await tmdb.getDetails("tv", parseInt(id));
    const streamEntry = findStream(show.name);

    // Filter out season 0 (specials) and sort by season number
    const regularSeasons = (show as any).seasons?.filter((s: any) => s.season_number > 0) || [];

    return (
        <div className="min-h-screen bg-[#141414]">
            <Navbar />

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full">
                <div className="absolute inset-0">
                    <Image
                        src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
                        alt={show.name}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-black/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full px-4 pb-12 md:px-12">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {show.name}
                    </h1>

                    <div className="flex items-center gap-4 text-sm text-gray-300 mb-6">
                        <span className="text-green-500 font-semibold">{Math.round(show.vote_average * 10)}% Match</span>
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                        <span className="border border-gray-500 px-1 rounded text-xs">HD</span>
                        {regularSeasons.length > 0 && (
                            <span>{regularSeasons.length} {regularSeasons.length === 1 ? 'Season' : 'Seasons'}</span>
                        )}
                    </div>

                    <p className="max-w-2xl text-white text-lg mb-8 line-clamp-3 md:line-clamp-none">
                        {show.overview}
                    </p>

                    <MovieControls streamUrl={streamEntry?.url} mediaItem={show} />
                </div>
            </div>

            {/* Content */}
            <div className="pb-20 px-4 md:px-12">
                {/* Seasons and Episodes */}
                {regularSeasons.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-4">Episodes</h2>
                        <SeasonSelector tvId={parseInt(id)} seasons={regularSeasons} showName={show.name} />
                    </div>
                )}

                {/* Cast */}
                <CastList cast={show.credits.cast} />

                {/* Similar Shows */}
                <div className="mt-12">
                    <MovieRow title="More Like This" movies={show.similar.results} />
                </div>
            </div>
        </div>
    );
}
