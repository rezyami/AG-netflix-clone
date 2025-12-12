import { tmdb } from "@/lib/tmdb";
import NewPopularClient from "@/components/NewPopularClient";

export default async function NewPopularPage() {
    const newOnNetflix = await tmdb.getOnTheAirTV();
    const comingSoon = await tmdb.getUpcomingMovies();
    const topMovies = await tmdb.getTopRated("movie");
    const topTV = await tmdb.getTopRated("tv");

    return (
        <NewPopularClient
            newOnNetflix={newOnNetflix.results.slice(0, 20)}
            comingSoon={comingSoon.results.slice(0, 20)}
            topMovies={topMovies.results.slice(0, 10)}
            topTV={topTV.results.slice(0, 10)}
        />
    );
}
