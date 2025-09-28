import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced prompt for better logo generation
    const enhancedPrompt = `Professional logo design for ${prompt}, ${options?.style || 'clean'} style, ${options?.color || 'modern'} colors, ${options?.industry || 'business'} industry, ${options?.shape || 'circle'} shape, vector design, high quality, no text, just icon/symbol`;

    // Nano Banana API configuration
    const NANO_BANANA_API_URL = process.env.NANO_BANANA_API_URL || 'http://localhost:5002';
    const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY;
    
    if (!NANO_BANANA_API_KEY) {
      return NextResponse.json({ 
        error: 'Nano Banana API key not configured. Please set NANO_BANANA_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    // Test if Nano Banana API is reachable
    console.log('🔗 Testing Nano Banana API connection...');
    let nanoBananaReachable = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(`${NANO_BANANA_API_URL}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🏥 Nano Banana health check status:', healthResponse.status);
      nanoBananaReachable = healthResponse.ok;
    } catch (healthError) {
      console.error('❌ Nano Banana API not reachable:', healthError.message);
      nanoBananaReachable = false;
    }

    if (!nanoBananaReachable) {
      return NextResponse.json({ 
        error: 'Nano Banana API service is not available. Please ensure the Nano Banana logo generator is running on port 5002.' 
      }, { status: 503 });
    }

    // Prepare request body
    const requestBody = {
      prompt: enhancedPrompt,
      style: options?.style || 'professional',
      color: options?.color || 'modern',
      industry: options?.industry || 'general',
      shape: options?.shape || 'circle',
      width: 512,
      height: 512,
      upscale: options?.upscale || false,
      convert_to_svg: options?.convert_to_svg || false
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for AI generation

    console.log('🎨 Generating logo with Nano Banana API...');
    const response = await fetch(`${NANO_BANANA_API_URL}/generate-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nano Banana API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ error: 'Failed to generate logo with Nano Banana API' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      imageUrl: data.imageUrl,
      prompt: enhancedPrompt,
      model: data.model || 'nano-banana-sdxl',
      service: 'Nano Banana API',
      cost: 'Paid service'
    });
  } catch (error) {
    console.error('Nano Banana logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


