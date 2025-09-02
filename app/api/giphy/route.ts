import { NextRequest, NextResponse } from 'next/server';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const GIPHY_API_URL = 'https://api.giphy.com/v1';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'trending';
    const page = searchParams.get('page') || '0';
    const limit = searchParams.get('limit') || '20';

    if (!GIPHY_API_KEY) {
      return NextResponse.json(
        { error: 'Giphy API key not configured' },
        { status: 500 }
      );
    }

    let endpoint = '';
    let params = '';

    if (query === 'trending') {
      endpoint = '/gifs/trending';
      params = `?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${parseInt(page) * parseInt(limit)}&rating=g`;
    } else {
      endpoint = '/gifs/search';
      params = `?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&offset=${parseInt(page) * parseInt(limit)}&rating=g&lang=en`;
    }

    console.log(`Giphy API call: ${GIPHY_API_URL}${endpoint}${params}`);
    const response = await fetch(`${GIPHY_API_URL}${endpoint}${params}`);

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Giphy API response:', data);
    
    // Transform the data to match our needs
    const gifs = data.data.map((gif: any) => ({
      id: gif.id,
      url: gif.images.original.url,
      thumb: gif.images.fixed_height_small.url,
      alt: gif.title || 'GIF',
      credit: `by ${gif.username || 'Giphy'}`,
      width: parseInt(gif.images.original.width),
      height: parseInt(gif.images.original.height),
      type: 'gif',
    }));

    console.log('Transformed GIFs:', gifs);

    return NextResponse.json({
      gifs,
      total: data.pagination?.total_count || gifs.length,
      totalPages: Math.ceil((data.pagination?.total_count || gifs.length) / parseInt(limit)),
    });

  } catch (error) {
    console.error('Giphy API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GIFs from Giphy' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gifId } = await request.json();

    if (!GIPHY_API_KEY) {
      return NextResponse.json(
        { error: 'Giphy API key not configured' },
        { status: 500 }
      );
    }

    // Get GIF details
    const response = await fetch(
      `${GIPHY_API_URL}/gifs/${gifId}?api_key=${GIPHY_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Giphy API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      gif: data.data,
    });

  } catch (error) {
    console.error('Giphy API error:', error);
    return NextResponse.json(
      { error: 'Failed to process GIF' },
      { status: 500 }
    );
  }
}
