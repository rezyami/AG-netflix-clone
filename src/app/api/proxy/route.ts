import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
        return new Response('Missing url parameter', { status: 400 });
    }

    try {
        console.log(`[Proxy] Fetching: ${url}`);

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
            },
            // Disable cache to ensure we get live segments correctly
            cache: 'no-store',
            // @ts-ignore - Handle client abort
            signal: req.signal,
        });

        if (!response.ok) {
            console.error(`[Proxy] Failed to fetch source: ${response.status} ${response.statusText}`);
            return new Response(`Failed to fetch source: ${response.statusText}`, { status: response.status });
        }

        // Forward headers
        const headers = new Headers();
        const contentType = response.headers.get('Content-Type');
        if (contentType) headers.set('Content-Type', contentType);

        const contentRange = response.headers.get('Content-Range');
        if (contentRange) headers.set('Content-Range', contentRange);

        const acceptRanges = response.headers.get('Accept-Ranges');
        if (acceptRanges) headers.set('Accept-Ranges', acceptRanges);

        // Security / CORS
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');

        // Stream the response back
        return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
        });
    } catch (error) {
        console.error('[Proxy] Error proxying stream:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
