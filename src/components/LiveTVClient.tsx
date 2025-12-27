'use client';

import LiveTVMaster from './live-tv/LiveTVMaster';

interface LiveTVClientProps {
    categories: { category: string; count: number }[];
}

export default function LiveTVClient({ categories }: LiveTVClientProps) {
    return <LiveTVMaster categories={categories} />;
}
