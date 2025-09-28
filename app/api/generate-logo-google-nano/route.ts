import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced prompt for better logo generation
    const enhancedPrompt = `Professional logo design for ${prompt}, ${options?.style || 'clean'} style, ${options?.color || 'modern'} colors, ${options?.industry || 'business'} industry, ${options?.shape || 'circle'} shape, vector design, high quality, no text, just icon/symbol`;

    // Google Nano Banana API configuration
    const GOOGLE_NANO_API_URL = process.env.GOOGLE_NANO_API_URL || 'http://localhost:5003';
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return NextResponse.json({ 
        error: 'Google API key not configured. Please set GOOGLE_API_KEY in your environment variables.' 
      }, { status: 500 });
    }

    // Test if Google Nano Banana API is reachable
    console.log('🔗 Testing Google Nano Banana API connection...');
    let googleNanoReachable = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(`${GOOGLE_NANO_API_URL}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log('🏥 Google Nano Banana health check status:', healthResponse.status);
      googleNanoReachable = healthResponse.ok;
    } catch (healthError) {
      console.error('❌ Google Nano Banana API not reachable:', healthError.message);
      googleNanoReachable = false;
    }

    if (!googleNanoReachable) {
      return NextResponse.json({ 
        error: 'Google Nano Banana API service is not available. Please ensure the Google Nano Banana logo generator is running on port 5003.' 
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
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    console.log('🎨 Generating logo with Google Nano Banana...');
    const response = await fetch(`${GOOGLE_NANO_API_URL}/generate-logo`, {
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
      console.error('Google Nano Banana API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json({ error: 'Failed to generate logo with Google Nano Banana API' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      imageUrl: data.imageUrl,
      prompt: enhancedPrompt,
      model: data.model || 'gemini-1.5-flash',
      service: 'Google Nano Banana',
      cost: 'FREE'
    });
  } catch (error) {
    console.error('Google Nano Banana logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


