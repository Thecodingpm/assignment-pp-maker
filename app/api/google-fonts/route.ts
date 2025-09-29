import { NextRequest, NextResponse } from 'next/server';

const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY || 'AIzaSyBvQZ4q1qQqQqQqQqQqQqQqQqQqQqQqQqQ'; // You'll need to get this from Google
const GOOGLE_FONTS_API_URL = 'https://www.googleapis.com/webfonts/v1/webfonts';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get('sort') || 'popularity';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // Build Google Fonts API URL
    let apiUrl = `${GOOGLE_FONTS_API_URL}?key=${GOOGLE_FONTS_API_KEY}&sort=${sort}`;
    
    if (category) {
      apiUrl += `&category=${category}`;
    }

    console.log('Fetching Google Fonts from:', apiUrl);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Google Fonts API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter fonts based on search query
    let fonts = data.items || [];
    
    if (search) {
      fonts = fonts.filter((font: any) => 
        font.family.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Transform Google Fonts data to our format and limit to 50 fonts to avoid caching issues
    const transformedFonts = fonts.slice(0, 50).map((font: any) => ({
      id: font.family.toLowerCase().replace(/\s+/g, '-'),
      family: font.family,
      category: font.category,
      variants: font.variants,
      subsets: font.subsets,
      version: font.version,
      lastModified: font.lastModified,
      files: font.files,
      // Generate preview URLs for different weights
      previewUrls: {
        '300': font.files['300'] || font.files.regular,
        '400': font.files.regular,
        '500': font.files['500'] || font.files.regular,
        '600': font.files['600'] || font.files.regular,
        '700': font.files['700'] || font.files.bold,
        '800': font.files['800'] || font.files.bold,
        '900': font.files['900'] || font.files.bold
      }
    }));

    return NextResponse.json({ 
      success: true, 
      fonts: transformedFonts,
      total: transformedFonts.length
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching Google Fonts:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Google Fonts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
