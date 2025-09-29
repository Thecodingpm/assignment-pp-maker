import { NextRequest, NextResponse } from 'next/server';

// This API stores Google Font selections in a simple way
// In a real app, you'd store this in a database
// For now, we'll use localStorage on the client side

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fontFamily, fontUrl, weight, style } = body;

    if (!fontFamily || !fontUrl) {
      return NextResponse.json({ 
        error: 'Font family and URL are required' 
      }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Store the font selection in a database
    // 2. Associate it with the user
    // 3. Track usage analytics
    
    // For now, we'll just return success
    // The client will handle storing the selection locally
    
    const fontData = {
      id: `google-${fontFamily.toLowerCase().replace(/\s+/g, '-')}-${weight}-${style}`,
      family: fontFamily,
      weight: weight || '400',
      style: style || 'normal',
      url: fontUrl,
      source: 'google',
      addedDate: new Date().toISOString()
    };

    return NextResponse.json({ 
      success: true, 
      font: fontData,
      message: 'Google Font added to library'
    });
  } catch (error) {
    console.error('Error adding Google Font:', error);
    return NextResponse.json({ 
      error: 'Failed to add Google Font' 
    }, { status: 500 });
  }
}


