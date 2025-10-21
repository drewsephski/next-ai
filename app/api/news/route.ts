import { NextRequest, NextResponse } from 'next/server';
import { ExternalAPIService } from '@/lib/external-api';

// Force static generation for this API route
export const dynamic = 'force-static';

// News API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || 'technology';
    const limit = parseInt(searchParams.get('limit') || '5');

    const newsData = await ExternalAPIService.getNews(topic, limit);

    return NextResponse.json({
      topic,
      count: newsData.length,
      articles: newsData,
    });
  } catch (error) {
    console.error('News API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news data' },
      { status: 500 }
    );
  }
}
