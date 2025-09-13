import { NextRequest, NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'nature';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '12';
    const quality = searchParams.get('quality') || 'medium';

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash access key not configured' },
        { status: 500 }
      );
    }

    const apiUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${limit}&client_id=${UNSPLASH_ACCESS_KEY}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform the data to match our needs
    const images = data.results.map((image: any) => {
      // Choose quality based on user preference
      let imageUrl = image.urls.regular; // Default to medium quality
      if (quality === 'high') {
        imageUrl = image.urls.full; // High quality but slower
      } else if (quality === 'low') {
        imageUrl = image.urls.small; // Low quality but faster
      }
      
      return {
        id: image.id,
        url: imageUrl,
        thumb: image.urls.small, // Always use small for thumbnails
        alt: image.alt_description || image.description || 'Unsplash Image',
        credit: `by ${image.user.name}`,
        downloadUrl: image.links.download,
        width: image.width,
        height: image.height,
      };
    });

    return NextResponse.json({
      images,
      total: data.total,
      totalPages: data.total_pages,
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

