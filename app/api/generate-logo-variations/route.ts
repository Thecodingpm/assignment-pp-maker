import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create multiple prompt variations for better results
    const promptVariations = [
      // Variation 1: Minimalist approach
      `Minimalist logo design for ${prompt}. Clean, simple, geometric shapes, modern typography, ${options.color} color scheme, professional, scalable vector design, no text, just icon/symbol.`,
      
      // Variation 2: Creative approach
      `Creative logo design for ${prompt}. Artistic, unique, innovative, bold design, ${options.style} style, ${options.color} colors, memorable, distinctive, professional branding.`,
      
      // Variation 3: Professional approach
      `Professional logo design for ${prompt}. Corporate, sophisticated, elegant, ${options.industry} industry appropriate, ${options.color} color palette, timeless, award-winning design quality.`,
      
      // Variation 4: Modern approach
      `Modern logo design for ${prompt}. Contemporary, trendy, fresh, ${options.style} aesthetic, ${options.color} color scheme, tech-forward, innovative, professional.`
    ];

    // Generate multiple logos in parallel
    const logoPromises = promptVariations.map(async (variationPrompt, index) => {
      try {
        const response = await fetch('https://zo610bsfc-496ff2e9c6d22116-0-colab.googleusercontent.com/outputframe.html?vrz=colab_20250909-060057_RC00_804833152/generate-logo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: variationPrompt
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate logo variation ${index + 1}`);
        }

        const data = await response.json();
        return {
          id: index + 1,
          imageUrl: data.data[0].url,
          prompt: variationPrompt,
          style: ['Minimalist', 'Creative', 'Professional', 'Modern'][index]
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

    return NextResponse.json({
      success: true,
      logos: successfulLogos,
      totalGenerated: successfulLogos.length
    });

  } catch (error) {
    console.error('Logo variations generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
