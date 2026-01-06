
import HomeClient from "@/components/HomeClient";
import { tmdb } from "@/lib/tmdb";
import { getVODAndSeriesCategories, getUniqueSeriesByCategory } from "@/lib/m3u";
import { replaceLanguageWrapper } from "@/lib/languages";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";
import { enrichMediaItem, enrichMediaItems } from "@/lib/tmdbBinder";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const m3uCategories = await getVODAndSeriesCategories();

    if (m3uCategories.length > 0) {
      // M3U Mode
      const getM3URow = async (category: string) => {
        const entries = await getUniqueSeriesByCategory(category);
        const sliced = entries.slice(0, 20);

        const movies = sliced.map(entry => {
          if ('episodes' in entry) {
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
            return mapM3UToMediaItem(entry);
          }
        });

        return {
          title: replaceLanguageWrapper(category),
          movies
        };
      };

      const strictCategories = m3uCategories.filter(cat =>
        (cat.startsWith('VOD') || cat.includes('SRS') || cat.includes('SERIES')) &&
        cat !== 'EU | ES | CINE & SERIES'
      );

      const categoriesToShow = (strictCategories.length > 0 ? strictCategories : m3uCategories).slice(0, 30);
      const rowsPromise = categoriesToShow.map(cat => getM3URow(cat));
      const rows = await Promise.all(rowsPromise);
      const validRows = rows.filter(row => row.movies.length > 0);

      const rowsToEnrich = 3;
      const enrichedRows = await Promise.all(validRows.map(async (row, idx) => {
        if (idx < rowsToEnrich) {
          const itemsToEnrich = row.movies.slice(0, 10);
          const otherItems = row.movies.slice(10);
          const enrichedItems = await enrichMediaItems(itemsToEnrich, 5);
          return { ...row, movies: [...enrichedItems, ...otherItems] };
        }
        return row;
      }));

      const firstRowMovies = enrichedRows[0]?.movies || [];
      let randomHero = firstRowMovies.length > 0
        ? firstRowMovies[Math.floor(Math.random() * firstRowMovies.length)]
        : null;

      if (randomHero) {
        randomHero = await enrichMediaItem(randomHero);
      }

      if (enrichedRows.length > 0) {
        return (
          <HomeClient
            heroMovie={randomHero || enrichedRows[0].movies[0]}
            rows={enrichedRows}
          />
        );
      }
    }

    // Fallback: TMDB Mode (Original Logic)
    let trendingData = { results: [] as any[] };
    let topRatedMovies = { results: [] as any[] };
    let topRatedSeries = { results: [] as any[] };

    try { trendingData = await tmdb.getTrending("all", "week"); } catch (e) { console.error("Failed to fetch trending:", e); }
    try { topRatedMovies = await tmdb.getTopRated("movie"); } catch (e) { console.error("Failed to fetch top movies:", e); }
    try { topRatedSeries = await tmdb.getTopRated("tv"); } catch (e) { console.error("Failed to fetch top series:", e); }

    const rows = [
      {
        title: "Trending Now",
        movies: trendingData?.results || []
      },
      {
        title: "Top 10 Movies",
        movies: (topRatedMovies?.results || []).slice(0, 10)
      },
      {
        title: "Top 10 Series",
        movies: (topRatedSeries?.results || []).slice(0, 10)
      }
    ];

    const validRows = rows.filter(row => row.movies.length > 0);

    if (validRows.length === 0 && m3uCategories.length === 0) {
      throw new Error("No content available. Please check your TMDB API Key and M3U URL configuration.");
    }

    return (
      <HomeClient
        heroMovie={trendingData?.results?.[0] || topRatedMovies?.results?.[0]}
        rows={validRows}
      />
    );
  } catch (error: any) {
    console.error("Critical error in Home page:", error);
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-12 text-center text-white">
        <h1 className="text-4xl font-bold text-[#E50914] mb-6">NETFLIX</h1>
        <h2 className="text-2xl font-bold mb-4">Application Error</h2>
        <p className="text-lg max-w-2xl mb-8 opacity-70">
          The application encountered a problem while retrieving content. This is usually due to missing configuration in your deployment environment.
        </p>
        <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/10 text-left mb-8 max-w-3xl overflow-auto w-full backdrop-blur-md">
          <p className="text-red-500 font-bold mb-2 uppercase text-xs tracking-widest">Error Trace</p>
          <code className="text-sm opacity-90 break-all">{error.message}</code>
        </div>
        <div className="text-zinc-400 text-sm space-y-2">
          <p>If you are the developer, verify that the following <strong>Environment Variables</strong> are defined in Vercel:</p>
          <div className="flex justify-center gap-4 pt-2">
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">TMDB_API_KEY</span>
            <span className="bg-white/5 px-2 py-1 rounded border border-white/10">IPTV_M3U_URL</span>
          </div>
        </div>
        <a
          href="/"
          className="mt-12 bg-white text-black px-8 py-2 rounded font-bold hover:bg-zinc-200 transition-colors inline-block"
        >
          Try Again
        </a>
      </div>
    );
  }
}
