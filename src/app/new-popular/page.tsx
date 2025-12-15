import { tmdb } from "@/lib/tmdb";
import NewPopularClient from "@/components/NewPopularClient";
import { getVODAndSeriesCategories, getVODAndSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

export default async function NewPopularPage() {
    // Check if M3U content is available
    const m3uCategories = await getVODAndSeriesCategories();

    if (m3uCategories.length > 0) {
        // M3U Mode
        // We try to simulate "New" and "Popular" using available VOD categories
        // Since we don't have real "New" metadata, we can just display some categories
        // or try to find "2024" / "2025" in titles if needed.
        // For simplicity, let's map a few diverse categories to these sections.

        // Helper to fetch valid row
        const getM3URow = async (category: string) => {
            const entries = await getVODAndSeriesByCategory(category);
            return entries.slice(0, 20).map(mapM3UToMediaItem);
        };

        // Try to find categories that might fit "New" or "Popular" genres
        // Or just pick the first few.
        const cat1 = m3uCategories.find(c => c.includes("ACTION") || c.includes("MOVIES")) || m3uCategories[0];
        const cat2 = m3uCategories.find(c => c.includes("SERIES") || c.includes("SRS")) || m3uCategories[1];
        const cat3 = m3uCategories.find(c => c.includes("COMEDY") || c.includes("DRAMA")) || m3uCategories[2];
        const cat4 = m3uCategories.find(c => c.includes("DOCU") || c.includes("HISTORY")) || m3uCategories[3];

        const [row1, row2, row3, row4] = await Promise.all([
            getM3URow(cat1),
            getM3URow(cat2),
            getM3URow(cat3),
            getM3URow(cat4)
        ]);

        return (
            <NewPopularClient
                newOnNetflix={row1}
                comingSoon={row2}
                topMovies={row3}
                topTV={row4}
            />
        );
    }

    // TMDB Fallback
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
