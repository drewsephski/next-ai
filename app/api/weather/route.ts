import { NextRequest, NextResponse } from 'next/server';
import { ExternalAPIService } from '@/lib/external-api';

// Force static generation for this API route
export const dynamic = 'force-static';

// Weather API endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    const weatherData = await ExternalAPIService.getWeather(location);

    if (!weatherData) {
      return NextResponse.json(
        { error: 'Weather data not available for this location' },
        { status: 404 }
      );
    }

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}
