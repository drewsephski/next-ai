import { NextRequest, NextResponse } from 'next/server';
import { ExternalAPIService } from '@/lib/external-api';

// Currency exchange API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to') || 'USD';

    if (!from) {
      return NextResponse.json(
        { error: 'From currency parameter is required' },
        { status: 400 }
      );
    }

    const exchangeData = await ExternalAPIService.getExchangeRate(from.toUpperCase(), to.toUpperCase());

    if (!exchangeData) {
      return NextResponse.json(
        { error: 'Exchange rate data not available' },
        { status: 404 }
      );
    }

    return NextResponse.json(exchangeData);
  } catch (error) {
    console.error('Exchange rate API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rate data' },
      { status: 500 }
    );
  }
}
