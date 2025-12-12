import HomeClient from "@/components/HomeClient";
import { tmdb } from "@/lib/tmdb";
import { getVODAndSeriesCategories, getVODAndSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

export default async function Home() {
  const trendingData = await tmdb.getTrending("all", "week");
  const topRatedMovies = await tmdb.getTopRated("movie");
  const topRatedSeries = await tmdb.getTopRated("tv");

  // Helper to get M3U rows
  const getM3URow = async (title: string, groupName: string) => {
    const entries = await getVODAndSeriesByCategory(groupName);
    const sliced = entries.slice(0, 20);
    return {
      title,
      movies: sliced.map(mapM3UToMediaItem)
    };
  };

  const rows = [
    {
      title: "Trending Now",
      movies: trendingData.results
    },
    await getM3URow("Action & Adventure", "VOD | EN - ACTION & WAR"),
    await getM3URow("Anime", "VOD | EN - ANIME"),
    await getM3URow("Children & Family", "VOD | EN - KIDS & FAMILY"),
    await getM3URow("Comedies", "VOD | EN - COMEDY"),
    await getM3URow("Documentaries", "VOD | EN - HISTORY & DOCUMENTARY"),
    await getM3URow("Dramas", "VOD | EN - DRAMA & ROMANCE"),
    {
      title: "Top 10 Movies",
      movies: topRatedMovies.results.slice(0, 10)
    },
    {
      title: "Top 10 Series",
      movies: topRatedSeries.results.slice(0, 10)
    }
  ];

  // Filter out empty rows
  const validRows = rows.filter(row => row.movies.length > 0);

  return (
    <HomeClient
      heroMovie={trendingData.results[0]}
      rows={validRows}
    />
  );
}
