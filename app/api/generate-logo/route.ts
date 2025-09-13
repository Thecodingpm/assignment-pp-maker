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

    const enhancedPrompt = `Create a professional logo design for: ${prompt}. 
    Style: ${styleDescriptors[options.style] || styleDescriptors.professional}. 
    Colors: ${colorDescriptors[options.color] || colorDescriptors.modern}. 
    Industry: ${industryDescriptors[options.industry] || industryDescriptors.general}. 
    Requirements: High-quality vector-style logo, scalable, professional branding, clean typography, memorable, timeless design, suitable for business cards and websites, no text in the logo itself, just the symbol/icon, modern and contemporary aesthetic, award-winning design quality.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        n: 1,
        size: "1024x1024"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].url,
      prompt: enhancedPrompt
    });
  } catch (error) {
    console.error('Logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
