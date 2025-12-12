import { getGroupedTVSeries, getUniqueSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";
import TVShowsClient from "@/components/TVShowsClient";

export default async function TVShowsPage() {
    const groupedData = await getGroupedTVSeries();

    // Limit to first 20 languages for initial load performance if needed, 
    // but user wants all. Let's try to load all but limit items per category.
    // To avoid timeout, we might need to be careful.

    // We Map over the groupedData to build the rows
    const groupedSeries = await Promise.all(groupedData.map(async group => {
        const rows = await Promise.all(group.categories.map(async category => {
            const entries = (await getUniqueSeriesByCategory(category)).slice(0, 20); // 20 items per row
            // We need to map M3USeries to MediaItem too.
            // mapM3UToMediaItem expects M3UEntry, but we now have (M3UEntry | M3USeries).
            // We need to handle this type diff.
            const movies = entries.map(entry => {
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
                    return mapM3UToMediaItem(entry);
                }
            });
            return {
                title: category,
                movies
            };
        }));

        return {
            language: group.language,
            rows: rows.filter(row => row.movies.length > 0)
        };
    }));

    const validGroupedSeries = groupedSeries.filter(group => group.rows.length > 0); // Only languages with content

    return <TVShowsClient groupedSeries={validGroupedSeries} />;
}
