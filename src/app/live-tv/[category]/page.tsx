import CategoryChannelsClient from '@/components/CategoryChannelsClient';
import { getChannelsByCategory } from '@/lib/m3u';

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryChannelsPage({ params }: PageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    const channels = getChannelsByCategory(decodedCategory);

    return <CategoryChannelsClient category={decodedCategory} channels={channels} />;
}
