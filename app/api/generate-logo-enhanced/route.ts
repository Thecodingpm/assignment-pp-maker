import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options = {} } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced options with shape control
    const {
      style = 'professional',
      color = 'modern',
      industry = 'general',
      shape = 'circle', // circle, square, hexagon, triangle
      upscale = true,
      convert_to_svg = false,
      width = 512,
      height = 512
    } = options;

    // Use your enhanced Google Colab Stable Diffusion XL + ControlNet API
    const ENHANCED_COLAB_API_URL = process.env.ENHANCED_COLAB_API_URL || 'https://YOUR_ENHANCED_NGROK_URL_HERE';
    
    // Test if enhanced Colab API is reachable
    console.log('🔗 Testing Enhanced Colab API connection...');
    let colabReachable = true;
    try {
      const healthResponse = await fetch(`${ENHANCED_COLAB_API_URL}/health`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      console.log('🏥 Enhanced API health check status:', healthResponse.status);
      colabReachable = healthResponse.ok;
    } catch (healthError) {
      console.error('❌ Enhanced Colab API not reachable:', healthError);
      colabReachable = false;
    }

    // If enhanced SDXL is required, do not allow mock fallback
    const REQUIRE_ENHANCED_SDXL = process.env.REQUIRE_ENHANCED_SDXL === 'true';
    if (REQUIRE_ENHANCED_SDXL && !colabReachable) {
      return NextResponse.json({ 
        error: 'Enhanced SDXL+ControlNet server is required but not reachable. Set ENHANCED_COLAB_API_URL and ensure the server is running.' 
      }, { status: 503 });
    }
    
    // Enhanced mock response for testing (remove this when you have enhanced Colab set up)
    if (!REQUIRE_ENHANCED_SDXL && (ENHANCED_COLAB_API_URL.includes('YOUR_ENHANCED_NGROK_URL_HERE') || !colabReachable)) {
      console.log('🎨 Using enhanced mock logo response for testing...');
      
      // Generate different mock logos based on shape
      const shapeLogos = {
        circle: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzYzNjZGMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhCNUNCNiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9InVybCgjZykiLz48Y2lyY2xlIGN4PSI1MTIiIGN5PSI1MTIiIHI9IjIwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PGNpcmNsZSBjeD0iNTEyIiBjeT0iNTEyIiByPSIxNTAiIGZpbGw9IiMzMzMiLz48L3N2Zz4=',
        square: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iI0ZGNjM0NyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0ZGQzkwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9InVybCgjZykiLz48cmVjdCB4PSIyNTYiIHk9IjI1NiIgd2lkdGg9IjUxMiIgaGVpZ2h0PSI1MTIiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjxyZWN0IHg9IjM1NiIgeT0iMzU2IiB3aWR0aD0iMzEyIiBoZWlnaHQ9IjMxMiIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==',
        hexagon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzAwQkI3NyIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzRAREI3NyIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9InVybCgjZykiLz48cG9seWdvbiBwb2ludHM9IjUxMiwxMDAgNzAwLDMwMCA1MTIsNTAwIDMyNCwzMDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjxwb2x5Z29uIHBvaW50cz0iNTEyLDE1MCA2NTAsMzUwIDUxMiw0NTAgMzUwLDM1MCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==',
        triangle: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzlDMjdCMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iI0U5MzRGMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9InVybCgjZykiLz48cG9seWdvbiBwb2ludHM9IjUxMiwxMDAgNzAwLDQwMCAzMjQsNDAwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz48cG9seWdvbiBwb2ludHM9IjUxMiwxNTAgNjUwLDQwMCAzNzQsNDAwIiBmaWxsPSIjMzMzIi8+PC9zdmc+'
      };
      
      const selectedLogo = shapeLogos[shape as keyof typeof shapeLogos] || shapeLogos.circle;
      
      console.log(`🎨 Selected ${shape} shape logo for prompt: "${prompt}"`);
      
      return NextResponse.json({
        success: true,
        image: selectedLogo,
        prompt: `Enhanced logo design for ${prompt} with ${shape} shape control`,
        shape: shape,
        dimensions: upscale ? "1024x1024" : "512x512",
        upscaled: upscale,
        enhanced: true
      });
    }
    
    // Prepare request body for enhanced API
    const requestBody = {
      prompt: prompt,
      style: style,
      color: color,
      industry: industry,
      shape: shape,
      width: width,
      height: height,
      upscale: upscale,
      convert_to_svg: convert_to_svg
    };

    const response = await fetch(`${ENHANCED_COLAB_API_URL}/generate-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Enhanced Colab API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ error: 'Failed to generate enhanced logo' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${data.image}`,
      prompt: data.prompt,
      shape: data.shape,
      dimensions: data.dimensions,
      upscaled: data.upscaled,
      enhanced: true,
      svg: data.svg || undefined
    });
  } catch (error) {
    console.error('Enhanced logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

