import { NextRequest, NextResponse } from 'next/server';

interface LogoOptions {
  style?: 'professional' | 'minimalist' | 'creative' | 'corporate';
  color?: 'modern' | 'vibrant' | 'monochrome' | 'pastel';
  industry?: 'general' | 'tech' | 'finance' | 'education' | 'marketing';
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, options }: { prompt: string; options?: LogoOptions } = await request.json();
    
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
    Style: ${options?.style ? styleDescriptors[options.style] : styleDescriptors.professional}. 
    Colors: ${options?.color ? colorDescriptors[options.color] : colorDescriptors.modern}. 
    Industry: ${options?.industry ? industryDescriptors[options.industry] : industryDescriptors.general}. 
    Requirements: High-quality vector-style logo, scalable, professional branding, clean typography, memorable, timeless design, suitable for business cards and websites, no text in the logo itself, just the symbol/icon, modern and contemporary aesthetic, award-winning design quality.`;

    // Use OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate logo' }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Invalid response from OpenAI:', data);
      return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 500 });
    }
    
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
