import HomeClient from "@/components/HomeClient";
import { tmdb } from "@/lib/tmdb";
import { getVODAndSeriesCategories, getVODAndSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

export default async function Home() {
  const trendingData = await tmdb.getTrending("all", "week");
  const topRatedMovies = await tmdb.getTopRated("movie");
  const actionMovies = await tmdb.getByGenre("movie", 28);
  const comedyMovies = await tmdb.getByGenre("movie", 35);
  const horrorMovies = await tmdb.getByGenre("movie", 27);
  const romanceMovies = await tmdb.getByGenre("movie", 10749);
  const documentaries = await tmdb.getByGenre("movie", 99);

  // Fetch M3U Data
  const m3uCategories = getVODAndSeriesCategories();
  const m3uRows = m3uCategories.map(category => {
    const entries = getVODAndSeriesByCategory(category);
    const movies = entries.map(mapM3UToMediaItem);
    return {
      title: category,
      movies
    };
  });

  return (
    <HomeClient
      trendingMovies={trendingData.results}
      topRatedMovies={topRatedMovies.results}
      actionMovies={actionMovies.results}
      comedyMovies={comedyMovies.results}
      horrorMovies={horrorMovies.results}
      romanceMovies={romanceMovies.results}
      documentaries={documentaries.results}
      m3uRows={m3uRows}
    />
  );
}
