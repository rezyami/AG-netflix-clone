import { NextRequest, NextResponse } from 'next/server';
import { getChannelsByCategory } from '@/lib/m3u';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    if (!category) {
        return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    try {
        const channels = await getChannelsByCategory(category);
        return NextResponse.json(channels);
    } catch (error) {
        console.error('Error fetching channels:', error);
        return NextResponse.json({ error: 'Failed to fetch channels' }, { status: 500 });
    }
}
