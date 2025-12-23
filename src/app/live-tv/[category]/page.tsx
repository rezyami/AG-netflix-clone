import LiveTVMaster from '@/components/live-tv/LiveTVMaster';
import { getCategoryStats } from '@/lib/m3u';

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryChannelsPage({ params }: PageProps) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    const categories = await getCategoryStats();

    return <LiveTVMaster categories={categories} initialCategory={decodedCategory} />;
}
