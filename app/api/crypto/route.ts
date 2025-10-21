import { NextRequest, NextResponse } from 'next/server';
import { ExternalAPIService } from '@/lib/external-api';

// Force static generation for this API route
export const dynamic = 'force-static';

// Cryptocurrency API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coins = searchParams.get('coins')?.split(',') || ['bitcoin', 'ethereum'];

    const cryptoData = await ExternalAPIService.getCryptoPrices(coins);

    return NextResponse.json({
      count: cryptoData.length,
      cryptocurrencies: cryptoData,
    });
  } catch (error) {
    console.error('Crypto API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cryptocurrency data' },
      { status: 500 }
    );
  }
}
