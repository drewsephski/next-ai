import { NextRequest, NextResponse } from 'next/server';
import { ExternalAPIService } from '@/lib/external-api';

// Force static generation for this API route
export const dynamic = 'force-static';

// General search API endpoint that determines data source based on query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter (q) is required' },
        { status: 400 }
      );
    }

    const searchResults = await ExternalAPIService.searchData(query);

    return NextResponse.json({
      query,
      results: searchResults,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search external data' },
      { status: 500 }
    );
  }
}
