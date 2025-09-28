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

    // Style variations for each prompt
    const styleVariations = ['minimalist', 'creative', 'professional', 'modern'];

    // Use AI Logo Generator for variations
    console.log('🎨 Using AI Logo Generator for logo variations...');
    
    try {
      // Generate multiple variations using AI Logo Generator
      const logoPromises = promptVariations.map(async (variationPrompt, index) => {
        const aiResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-logo-ai`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            prompt: variationPrompt, 
            options: { ...options, style: styleVariations[index] || options.style }
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          return {
            id: index + 1,
            imageUrl: data.imageUrl,
            prompt: variationPrompt,
            model: data.model,
            style: styleVariations[index] || options.style
          };
        } else {
          console.error(`AI Logo Generator failed for variation ${index + 1}`);
          return null;
        }
      });

      const results = await Promise.all(logoPromises);
      const successfulLogos = results.filter(logo => logo !== null);

      if (successfulLogos.length > 0) {
        return NextResponse.json({
          success: true,
          logos: successfulLogos,
          totalGenerated: successfulLogos.length,
          service: 'AI Logo Generator'
        });
      } else {
        console.error('All AI Logo Generator variations failed, trying fallback...');
      }
    } catch (error) {
      console.error('AI Logo Generator variations error:', error);
    }

    // Fallback: Generate multiple logos in parallel using local services
    const logoPromises = promptVariations.map(async (variationPrompt, index) => {
      try {
        // Use your Google Colab Stable Diffusion XL API as fallback
        const COLAB_API_URL = process.env.COLAB_API_URL || 'https://a965e496e690.ngrok-free.app';
        
        // Temporary mock response for testing (remove this when you have Colab set up)
        const REQUIRE_SDXL = process.env.REQUIRE_SDXL === 'true';
        if (!REQUIRE_SDXL && (COLAB_API_URL.includes('YOUR_NGROK_URL_HERE') || COLAB_API_URL.includes('a47546173b4d'))) {
          console.log('🎨 Using mock variations response for testing...');
          
          // Different mock logos for each variation
          const variationLogos = [
            // Minimalist
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjIiLz48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjgwIiBmaWxsPSIjMzMzMzMzIi8+PC9zdmc+',
            // Creative
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNGRjYzNDciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNGRkM5MDAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxwb2x5Z29uIHBvaW50cz0iMjU2LDEwMCAzNTAsMjU2IDI1Niw0MTIgMTYyLDI1NiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PC9zdmc+',
            // Professional
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2MzY2RjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4QjVDQjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxyZWN0IHg9IjIwNiIgeT0iMjA2IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PC9zdmc+',
            // Modern
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMwMEJCNzciLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM0QERCNzciLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0idXJsKCNnKSIvPjxlbGxpcHNlIGN4PSIyNTYiIGN5PSIyNTYiIHJ4PSI4MCIgcnk9IjEwMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC45Ii8+PC9zdmc+'
          ];
          
          return {
            id: index + 1,
            imageUrl: variationLogos[index],
            prompt: variationPrompt,
            style: ['Minimalist', 'Creative', 'Professional', 'Modern'][index]
          };
        }
        
        // Prepare optional LoRA configuration (env can act as defaults)
        const loraEnabled = (options?.loraEnabled ?? (process.env.LORA_ENABLED === 'true')) || false;
        const loraName = options?.loraName || process.env.LORA_NAME || process.env.LORA_PATH || undefined;
        const loraScaleEnv = process.env.LORA_SCALE ? Number(process.env.LORA_SCALE) : undefined;
        const loraScale = typeof options?.loraScale === 'number' ? options.loraScale : (Number.isFinite(loraScaleEnv as number) ? (loraScaleEnv as number) : undefined);

        const requestBody: Record<string, unknown> = {
          prompt: prompt
        };
        if (loraEnabled || loraName || typeof loraScale === 'number') {
          (requestBody as any).lora = {
            enabled: loraEnabled,
            name: loraName,
            scale: loraScale
          };
        }

        const response = await fetch(`${COLAB_API_URL}/generate-variations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate logo variation ${index + 1}`);
        }

        const data = await response.json();
        return {
          id: index + 1,
          imageUrl: data.variations ? `data:image/png;base64,${data.variations[index].image}` : data.imageUrl,
          prompt: data.variations ? data.variations[index].prompt : data.prompt,
          style: data.variations ? data.variations[index].style : data.style,
          model: data.model || data.engine || undefined,
          lora: data.lora || (requestBody as any).lora || undefined
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
