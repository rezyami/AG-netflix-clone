import LiveTVClient from '@/components/LiveTVClient';
import { getCategoryStats } from '@/lib/m3u';

export default async function LiveTVPage() {
    const categories = getCategoryStats();

    return <LiveTVClient categories={categories} />;
}
