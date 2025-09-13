import { NextRequest, NextResponse } from 'next/server';

const TENOR_API_KEY = process.env.TENOR_API_KEY;
const TENOR_API_URL = 'https://tenor.googleapis.com/v2';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'trending';
    const page = searchParams.get('page') || '0';
    const limit = searchParams.get('limit') || '20';
    const quality = searchParams.get('quality') || 'medium';

    if (!TENOR_API_KEY) {
      console.error('Tenor API key not configured');
      return NextResponse.json(
        { error: 'Tenor API key not configured' },
        { status: 500 }
      );
    }

    let endpoint = '';
    let params = '';

    if (query === 'trending' || query === '') {
      endpoint = '/featured';
      params = `?key=${TENOR_API_KEY}&limit=${limit}&pos=${page}`;
    } else {
      endpoint = '/search';
      params = `?q=${encodeURIComponent(query)}&key=${TENOR_API_KEY}&limit=${limit}&pos=${page}`;
    }

    const apiUrl = `${TENOR_API_URL}${endpoint}${params}`;
    console.log(`Tenor API call: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; PresentationApp/1.0)'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Tenor API error: ${response.status} - ${errorText}`);
      throw new Error(`Tenor API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Tenor API response data:', {
      results: data.results?.length || 0,
      next: data.next,
      hasResults: !!data.results
    });
    
    if (!data.results || data.results.length === 0) {
      console.warn('No results from Tenor API');
      return NextResponse.json({
        gifs: [],
        total: 0,
        totalPages: 0,
      });
    }
    
    // Transform the data to match our needs
    const gifs = data.results.map((gif: any) => {
      // Choose quality based on user preference
      let bestUrl = gif.media_formats.gif.url;
      let bestThumb = gif.media_formats.gif.url;
      
      if (quality === 'high' && gif.media_formats.gif_high) {
        bestUrl = gif.media_formats.gif_high.url;
        bestThumb = gif.media_formats.gif_high.url;
      } else if (quality === 'low' && gif.media_formats.tinygif) {
        bestUrl = gif.media_formats.tinygif.url;
        bestThumb = gif.media_formats.tinygif.url;
      }
      
      return {
        id: gif.id,
        url: bestUrl, // Quality-based GIF
        thumb: bestThumb, // Quality-based thumbnail
        alt: gif.title || 'GIF',
        credit: `by ${gif.username || 'Tenor'}`,
        width: parseInt(gif.media_formats.gif.dims[0]),
        height: parseInt(gif.media_formats.gif.dims[1]),
        type: 'gif',
      };
    });

    console.log('Transformed Tenor GIFs:', gifs.length, 'GIFs found');

    return NextResponse.json({
      gifs,
      total: data.next || gifs.length,
      totalPages: Math.ceil((data.next || gifs.length) / parseInt(limit)),
    });

  } catch (error) {
    console.error('Tenor API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch GIFs from Tenor: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { gifId } = await request.json();

    if (!TENOR_API_KEY) {
      return NextResponse.json(
        { error: 'Tenor API key not configured' },
        { status: 500 }
      );
    }

    // Get GIF details
    const response = await fetch(
      `${TENOR_API_URL}/posts/${gifId}?key=${TENOR_API_KEY}`,
    );

    if (!response.ok) {
      throw new Error(`Tenor API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      gif: data.results[0],
    });

  } catch (error) {
    console.error('Tenor API error:', error);
    return NextResponse.json(
      { error: 'Failed to process GIF' },
      { status: 500 }
    );
  }
}
