import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'nature';
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('per_page') || '20';

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our needs
    const images = data.results.map((photo: any) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumb: photo.urls.thumb,
      alt: photo.alt_description || photo.description || 'Unsplash image',
      credit: `by ${photo.user.name}`,
      downloadUrl: photo.links.download,
      width: photo.width,
      height: photo.height,
    }));

    return NextResponse.json({
      images,
      total: data.total,
      totalPages: Math.ceil(data.total / parseInt(perPage)),
    });

  } catch (error) {
    console.error('Unsplash API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Unsplash' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageId } = await request.json();

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      );
    }

    // Trigger a download for the image (required by Unsplash API)
    const response = await fetch(
      `${UNSPLASH_API_URL}/photos/${imageId}/download`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash download API error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      downloadUrl: data.url,
    });

  } catch (error) {
    console.error('Unsplash download error:', error);
    return NextResponse.json(
      { error: 'Failed to process image download' },
      { status: 500 }
    );
  }
}
