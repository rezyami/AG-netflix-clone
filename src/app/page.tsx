import HomeClient from "@/components/HomeClient";
import { tmdb } from "@/lib/tmdb";

export default async function Home() {
  const trendingData = await tmdb.getTrending("all", "week");
  const topRatedMovies = await tmdb.getTopRated("movie");
  const actionMovies = await tmdb.getByGenre("movie", 28);
  const comedyMovies = await tmdb.getByGenre("movie", 35);
  const horrorMovies = await tmdb.getByGenre("movie", 27);
  const romanceMovies = await tmdb.getByGenre("movie", 10749);
  const documentaries = await tmdb.getByGenre("movie", 99);

  return (
    <HomeClient
      trendingMovies={trendingData.results}
      topRatedMovies={topRatedMovies.results}
      actionMovies={actionMovies.results}
      comedyMovies={comedyMovies.results}
      horrorMovies={horrorMovies.results}
      romanceMovies={romanceMovies.results}
      documentaries={documentaries.results}
    />
  );
}
