import ContentGrid from "@/components/ContentGrid";
import { getVODAndSeriesByCategory } from "@/lib/m3u";
import { mapM3UToMediaItem } from "@/lib/m3uMapper";

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function MovieCategoryPage({ params }: PageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    // Fetch and map entries
    const entries = await getVODAndSeriesByCategory(decodedCategory);
    const movies = entries.map(mapM3UToMediaItem);

    return <ContentGrid title={decodedCategory} items={movies} />;
}
