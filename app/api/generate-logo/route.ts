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

    // Enhanced prompt for better logo generation
    const enhancedPrompt = `logo design, ${prompt}, ${options?.style || 'professional'} style, ${options?.color || 'modern'} colors, ${options?.industry || 'business'} industry, high quality, professional, vector style, no text, just icon, clean design, scalable, iconic, memorable, brand identity, minimalist, modern logo design`;

    // Use AI Logo Generator as primary option
    console.log('🎨 Using AI Logo Generator for real AI logos...');
    
    try {
      // Call AI Logo Generator API
      const aiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-logo-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, options }),
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        return NextResponse.json(data);
      } else {
        console.error('AI Logo Generator failed, trying fallback...');
      }
    } catch (error) {
      console.error('AI Logo Generator error:', error);
    }

    // Fallback to local services if Hugging Face fails
    const FREE_LOCAL_API_URL = process.env.FREE_LOCAL_API_URL || 'http://localhost:5001';
    
    // Test if local API is reachable
    console.log('🔗 Testing local API connection...');
    let localReachable = true;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const healthResponse = await fetch(`${FREE_LOCAL_API_URL}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      localReachable = healthResponse.ok;
    } catch (healthError) {
      console.error('❌ Local API not reachable:', healthError.message);
      localReachable = false;
    }

    if (!localReachable) {
      return NextResponse.json({
        error: 'AI logo generation service is not available. Please try again later.' 
      }, { status: 503 });
    }
    
    // Prepare optional LoRA configuration
    const loraEnabled = (options?.loraEnabled ?? (process.env.LORA_ENABLED === 'true')) || false;
    const loraName = options?.loraName || process.env.LORA_NAME || process.env.LORA_PATH || undefined;
    const loraScaleEnv = process.env.LORA_SCALE ? Number(process.env.LORA_SCALE) : undefined;
    const loraScale = typeof options?.loraScale === 'number' ? options.loraScale : (Number.isFinite(loraScaleEnv as number) ? (loraScaleEnv as number) : undefined);

    const requestBody: Record<string, unknown> = {
      prompt: enhancedPrompt,
      style: options.style || 'professional',
      color: options.color || 'modern',
      industry: options.industry || 'general',
      shape: options.shape || 'circle',
      width: 512,
      height: 512,
      upscale: options.upscale || false,
      convert_to_svg: options.convert_to_svg || false,
      use_advanced: options.use_advanced || false  // New advanced option
    };

    if (loraEnabled || loraName || typeof loraScale === 'number') {
      requestBody.lora = {
        enabled: loraEnabled,
        name: loraName,
        scale: loraScale
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(`${FREE_LOCAL_API_URL}/generate-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

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
      imageUrl: data.imageUrl || data.image || `data:image/png;base64,${data.image_base64 || data.image}`,
      prompt: enhancedPrompt,
      model: data.model || data.engine || undefined,
      lora: data.lora || requestBody.lora || undefined
    });
  } catch (error) {
    console.error('Logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
