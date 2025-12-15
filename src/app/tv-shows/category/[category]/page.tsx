import ContentGrid from "@/components/ContentGrid";
import { getUniqueSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function TVShowCategoryPage({ params }: PageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    const entries = await getUniqueSeriesByCategory(decodedCategory);

    // Map same logic as the main page for dealing with Series objects vs M3U Entries
    const movies = entries.map(entry => {
        if ('episodes' in entry) {
            // It's a Series (M3USeries)
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
            // It's a standard M3UEntry (Single movie or loose episode)
            return mapM3UToMediaItem(entry);
        }
    });

    return <ContentGrid title={decodedCategory} items={movies} />;
}
