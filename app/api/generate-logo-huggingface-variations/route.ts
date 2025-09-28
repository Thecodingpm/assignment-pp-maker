import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options = {} } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create multiple prompt variations for better results
    const promptVariations = [
      // Variation 1: Minimalist approach
      `Minimalist logo design for ${prompt}. Clean, simple, geometric shapes, modern typography, ${options.color || 'modern'} color scheme, professional, scalable vector design, no text, just icon/symbol.`,
      
      // Variation 2: Creative approach
      `Creative logo design for ${prompt}. Artistic, unique, innovative, bold design, ${options.style || 'creative'} style, ${options.color || 'vibrant'} colors, memorable, distinctive, professional branding.`,
      
      // Variation 3: Professional approach
      `Professional logo design for ${prompt}. Corporate, sophisticated, elegant, ${options.industry || 'business'} industry appropriate, ${options.color || 'professional'} color palette, timeless, award-winning design quality.`,
      
      // Variation 4: Modern approach
      `Modern logo design for ${prompt}. Contemporary, trendy, fresh, ${options.style || 'modern'} aesthetic, ${options.color || 'contemporary'} color scheme, tech-forward, innovative, professional.`
    ];

    // Generate multiple logos in parallel
    const logoPromises = promptVariations.map(async (variationPrompt, index) => {
      try {
        // Negative prompt
        const negativePrompt = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra limbs, bad anatomy, complex background, cluttered, messy, amateur, unprofessional, cartoon, childish, low resolution, pixelated, noise, artifacts";

        // Hugging Face API configuration
        const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        const requestBody = {
          inputs: variationPrompt,
          parameters: {
            negative_prompt: negativePrompt,
            width: 512,
            height: 512,
            num_inference_steps: 20,
            guidance_scale: 7.5,
            num_images_per_prompt: 1
          }
        };

        console.log(`🎨 Generating logo variation ${index + 1} with Hugging Face...`);

        const response = await fetch(HUGGINGFACE_API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate logo variation ${index + 1}`);
        }

        // Get image data
        const imageBuffer = await response.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');
        const imageUrl = `data:image/png;base64,${imageBase64}`;

        return {
          id: index + 1,
          imageUrl: imageUrl,
          prompt: variationPrompt,
          style: ['Minimalist', 'Creative', 'Professional', 'Modern'][index],
          model: 'stable-diffusion-xl-base-1.0'
        };
      } catch (error) {
        console.error(`Error generating logo variation ${index + 1}:`, error);
        return null;
      }
    });

    const results = await Promise.all(logoPromises);
    const successfulLogos = results.filter(logo => logo !== null);

    if (successfulLogos.length === 0) {
      return NextResponse.json({ error: 'Failed to generate any logos' }, { status: 500 });
    }

    console.log(`✅ Generated ${successfulLogos.length} logo variations with Hugging Face`);

    return NextResponse.json({
      success: true,
      logos: successfulLogos,
      totalGenerated: successfulLogos.length,
      service: 'Hugging Face API'
    });

  } catch (error) {
    console.error('Hugging Face logo variations generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


