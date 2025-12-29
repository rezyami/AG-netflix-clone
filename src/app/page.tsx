
import HomeClient from "@/components/HomeClient";
import { tmdb } from "@/lib/tmdb";
import { getVODAndSeriesCategories, getUniqueSeriesByCategory } from "@/lib/m3u";
import { replaceLanguageWrapper } from "@/lib/languages";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

export const dynamic = "force-dynamic";

export default async function Home() {
  const m3uCategories = await getVODAndSeriesCategories();

  if (m3uCategories.length > 0) {
    // M3U Mode
    // Helper to get M3U rows
    const getM3URow = async (category: string) => {
      // Use getUniqueSeriesByCategory to group episodes into single series cards
      const entries = await getUniqueSeriesByCategory(category);
      const sliced = entries.slice(0, 20);

      const movies = sliced.map(entry => {
        if ('episodes' in entry) {
          // It's a Series
          return {
            id: entry.id,
            title: entry.title,
            original_title: entry.title,
            overview: `Series - ${entry.episodes.length} Episodes`,
            poster_path: entry.poster,
            backdrop_path: entry.poster,
            release_date: new Date().toISOString(),
            vote_average: 0,
            vote_count: 0,
            popularity: 0,
            genre_ids: [],
            media_type: "tv",
            adult: false
          } as any;
        } else {
          // It's a Movie / Single Episode
          return mapM3UToMediaItem(entry);
        }
      });

      return {
        title: replaceLanguageWrapper(category),
        movies
      };
    };

    // We can't show ALL categories on home if there are hundreds.
    // Filter to ensure we only show "VOD" or "Series" explicit categories if possible
    // to avoid Live TV channels that might have "Movies" in their name (e.g. "UK | Movies") appearing here.
    const strictCategories = m3uCategories.filter(cat =>
      (cat.startsWith('VOD') ||
        cat.includes('SRS') ||
        cat.includes('SERIES')) &&
      cat !== 'EU | ES | CINE & SERIES'
    );

    // If strict filter leaves nothing (unlikely if standard conventions), fallback to original list but slice
    const categoriesToShow = (strictCategories.length > 0 ? strictCategories : m3uCategories).slice(0, 30);

    // Fetch rows in parallel
    const rowsPromise = categoriesToShow.map(cat => getM3URow(cat));
    const rows = await Promise.all(rowsPromise);
    const validRows = rows.filter(row => row.movies.length > 0);

    // Pick a random movie from the first row for the Hero
    const firstRowMovies = validRows[0]?.movies || [];
    const randomHero = firstRowMovies.length > 0
      ? firstRowMovies[Math.floor(Math.random() * firstRowMovies.length)]
      : null;

    if (validRows.length === 0) {
      // Fallback if M3U logic fails to produce items (shouldn't happen if categories exist)
      return <div>No content available in M3U.</div>;
    }

    return (
      <HomeClient
        heroMovie={randomHero || validRows[0].movies[0]}
        rows={validRows}
      />
    );
  }

  // Fallback: TMDB Mode (Original Logic)
  const trendingData = await tmdb.getTrending("all", "week");
  const topRatedMovies = await tmdb.getTopRated("movie");
  const topRatedSeries = await tmdb.getTopRated("tv");

  const rows = [
    {
      title: "Trending Now",
      movies: trendingData.results
    },
    {
      title: "Top 10 Movies",
      movies: topRatedMovies.results.slice(0, 10)
    },
    {
      title: "Top 10 Series",
      movies: topRatedSeries.results.slice(0, 10)
    }
  ];

  const validRows = rows.filter(row => row.movies.length > 0);

  return (
    <HomeClient
      heroMovie={trendingData.results[0]}
      rows={validRows}
    />
  );
}
