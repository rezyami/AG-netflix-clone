import { getGroupedMovies, getVODAndSeriesByCategory } from "@/lib/m3u";
import { replaceLanguageWrapper } from "@/lib/languages";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";
import MoviesClient from "@/components/MoviesClient";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
    const groupedData = await getGroupedMovies();

    // Mapping logic similar to TV Shows but simpler (no unique series grouping needed)
    const groupedMovies = await Promise.all(groupedData.map(async group => {
        const rows = await Promise.all(group.categories.map(async category => {
            const entries = (await getVODAndSeriesByCategory(category)).slice(0, 20); // 20 items per row

            const movies = entries.map(mapM3UToMediaItem);

            return {
                title: replaceLanguageWrapper(category),
                movies,
                categoryLink: `/movies/category/${encodeURIComponent(category)}`
            };
        }));

        return {
            language: group.language,
            // @ts-ignore
            rows: rows.filter(row => row.movies.length > 0)
        };
    }));

    const validGroupedMovies = groupedMovies.filter(group => group.rows.length > 0);

    return <MoviesClient groupedMovies={validGroupedMovies} />;
}
