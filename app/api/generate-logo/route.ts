import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced prompt for much better logo generation
    const styleDescriptors = {
      professional: "clean, corporate, sophisticated, elegant, modern, business-like",
      minimalist: "simple, clean, minimal, geometric, uncluttered, essential elements only",
      creative: "artistic, unique, innovative, bold, expressive, distinctive",
      corporate: "formal, business-like, trustworthy, established, professional, authoritative"
    };

    const colorDescriptors = {
      modern: "contemporary color palette, trending colors, fresh and current",
      vibrant: "bright, energetic, eye-catching colors, bold and dynamic",
      monochrome: "black and white, grayscale, classic, timeless",
      pastel: "soft, muted, gentle colors, subtle and refined"
    };

    const industryDescriptors = {
      general: "versatile, adaptable design, universal appeal",
      tech: "futuristic, digital, innovative, tech-forward, cutting-edge",
      finance: "trustworthy, stable, professional, reliable, secure",
      education: "friendly, approachable, knowledge-focused, inspiring",
      marketing: "dynamic, creative, attention-grabbing, memorable"
    };

    // Use a simpler prompt for testing
    const enhancedPrompt = `Simple logo design for ${prompt}, clean and modern, professional, vector style, no text, just icon`;

    // Use your Google Colab Stable Diffusion XL API
    // Replace this URL with your actual ngrok URL from Colab
    const COLAB_API_URL = process.env.COLAB_API_URL || 'https://a965e496e690.ngrok-free.app';
    
    // Test if Colab API is reachable
    console.log('🔗 Testing Colab API connection...');
    try {
      const healthResponse = await fetch(`${COLAB_API_URL}/health`, {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      });
      console.log('🏥 Health check status:', healthResponse.status);
    } catch (healthError) {
      console.error('❌ Colab API not reachable:', healthError);
      console.log('🎨 Falling back to mock response...');
      // Fall back to mock response when Colab is not reachable
    }
    
    // Temporary mock response for testing (remove this when you have Colab set up)
    if (COLAB_API_URL.includes('YOUR_NGROK_URL_HERE') || COLAB_API_URL.includes('a47546173b4d')) {
      console.log('🎨 Using mock logo response for testing...');
      
      // Generate different mock logos based on prompt and options
      const mockLogos = [
        // Tech Startup - Blue Circle
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4QjVDQjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxjaXJjbGUgY3g9IjI1NiIgY3k9IjI1NiIgcj0iMTAwIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSIjMzMzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VEVDSDwvdGV4dD48L3N2Zz4=',
        // Creative Agency - Orange Diamond
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjYzNDciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkM5MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxwb2x5Z29uIHBvaW50cz0iMjU2LDEwMCAzNTAsMjU2IDI1Niw0MTIgMTYyLDI1NiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNSRUFURTwvdGV4dD48L3N2Zz4=',
        // Coffee Shop - Brown Oval
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM4QjQ1MTMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNEQ0E5NzYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxlbGxpcHNlIGN4PSIyNTYiIGN5PSIyNTYiIHJ4PSI4MCIgcnk9IjEwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNPRkZFRTwvdGV4dD48L3N2Zz4=',
        // Healthcare - Green Square
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMEJCNzciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0QERCNzciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjIwNiIgeT0iMjA2IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhFQUxUSDwvdGV4dD48L3N2Zz4=',
        // Finance - Black Square
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMDAwMDAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM2NjY2NjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjIwNiIgeT0iMjA2IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzNiIgZmlsbD0iIzMzMyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkZJTkFOQ0U8L3RleHQ+PC9zdmc+',
        // Purple Triangle
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM5QzI3QjAiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNFOTM0RjMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxwb2x5Z29uIHBvaW50cz0iMjU2LDEwMCAzNTAsMzAwIDE2MiwzMDAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ERVNJR048L3RleHQ+PC9zdmc+',
        // Red Hexagon
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjMzMzMiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkY0RjQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxwb2x5Z29uIHBvaW50cz0iMjU2LDEwMCAzMzAsMTUwIDMzMCwyNjIgMjU2LDMxMiAxODIsMjYyIDE4MiwxNTAiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IiMzMzMiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5CUkFORDwvdGV4dD48L3N2Zz4='
      ];
      
      // Select logo based on prompt content with more randomness
      let logoIndex = 0;
      const promptLower = prompt.toLowerCase();
      
      // Add timestamp for more randomness
      const timestamp = Date.now();
      const randomSeed = timestamp % 100;
      
      if (promptLower.includes('tech') || promptLower.includes('startup')) {
        logoIndex = 0 + (randomSeed % 2); // 0 or 1
      } else if (promptLower.includes('creative') || promptLower.includes('agency')) {
        logoIndex = 1 + (randomSeed % 2); // 1 or 2
      } else if (promptLower.includes('coffee') || promptLower.includes('shop')) {
        logoIndex = 2 + (randomSeed % 2); // 2 or 3
      } else if (promptLower.includes('health') || promptLower.includes('medical')) {
        logoIndex = 3 + (randomSeed % 2); // 3 or 4
      } else if (promptLower.includes('finance') || promptLower.includes('fintech')) {
        logoIndex = 4;
      } else {
        logoIndex = Math.floor(Math.random() * mockLogos.length); // Random for other prompts
      }
      
      // Ensure index is within bounds
      logoIndex = logoIndex % mockLogos.length;
      
      console.log(`🎨 Selected logo ${logoIndex} for prompt: "${prompt}" (${promptLower})`);
      
      return NextResponse.json({
        success: true,
        imageUrl: mockLogos[logoIndex],
        prompt: enhancedPrompt
      });
    }
    
    const response = await fetch(`${COLAB_API_URL}/generate-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        style: options.style || 'professional',
        color: options.color || 'modern',
        industry: options.industry || 'general'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Colab API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      imageUrl: `data:image/png;base64,${data.image}`,
      prompt: enhancedPrompt
    });
  } catch (error) {
    console.error('Logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
