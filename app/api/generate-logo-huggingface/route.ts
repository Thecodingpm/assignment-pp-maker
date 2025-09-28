import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced prompt for better logo generation
    const enhancedPrompt = `logo design, ${prompt}, ${options?.style || 'professional'} style, ${options?.color || 'modern'} colors, ${options?.industry || 'business'} industry, high quality, professional, vector style, no text, just icon, clean design, scalable, iconic, memorable, brand identity, minimalist, modern logo design`;

    // Negative prompt to avoid unwanted elements
    const negativePrompt = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra limbs, bad anatomy, complex background, cluttered, messy, amateur, unprofessional, cartoon, childish, low resolution, pixelated, noise, artifacts";

    // Hugging Face API configuration
    const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
    
    // Optional: You can add a Hugging Face token for higher rate limits
    // const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add token if available (optional)
    // if (HF_TOKEN) {
    //   headers['Authorization'] = `Bearer ${HF_TOKEN}`;
    // }

    const requestBody = {
      inputs: enhancedPrompt,
      parameters: {
        negative_prompt: negativePrompt,
        width: 512,
        height: 512,
        num_inference_steps: 20,
        guidance_scale: 7.5,
        num_images_per_prompt: 1
      }
    };

    console.log('🎨 Generating logo with Hugging Face...');
    console.log('📝 Prompt:', enhancedPrompt);

    const response = await fetch(HUGGINGFACE_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Handle specific error cases
      if (response.status === 503) {
        return NextResponse.json({ 
          error: 'Hugging Face model is loading. Please wait a moment and try again.' 
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to generate logo with Hugging Face API' 
      }, { status: 500 });
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;
    
    console.log('✅ Logo generated successfully with Hugging Face');

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      prompt: enhancedPrompt,
      model: 'stable-diffusion-xl-base-1.0',
      service: 'Hugging Face API',
      cost: 'FREE'
    });
  } catch (error) {
    console.error('Hugging Face logo generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


