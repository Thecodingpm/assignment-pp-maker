import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Enhanced prompt for better presentation generation
    const enhancedPrompt = `Create a professional presentation about: ${prompt}. Style: ${options.style}, Color theme: ${options.color}, Industry: ${options.industry}. Include title slide, agenda, key points, and conclusion. Make it engaging and professional.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional presentation designer. Create structured presentation content with clear slides, bullet points, and engaging content. Always respond with valid JSON format."
          },
          {
            role: "user",
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'Failed to generate presentation' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the content and structure it for presentation
    const presentationData = {
      title: extractTitle(content),
      slides: extractSlides(content),
      theme: {
        style: options.style,
        color: options.color,
        industry: options.industry
      }
    };
    
    return NextResponse.json({
      success: true,
      presentation: presentationData,
      rawContent: content
    });
  } catch (error) {
    console.error('Presentation generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function extractTitle(content: string): string {
  // Simple title extraction - look for the first line or "Title:" pattern
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('title:') || line.toLowerCase().includes('presentation:')) {
      return line.replace(/title:|presentation:/gi, '').trim();
    }
  }
  return lines[0] || 'Generated Presentation';
}

function extractSlides(content: string): any[] {
  // Simple slide extraction - look for numbered items or bullet points
  const lines = content.split('\n');
  const slides: any[] = [];
  let currentSlide: { title: string; content: string[] } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^\d+\./) || trimmedLine.match(/^slide \d+/i)) {
      if (currentSlide) {
        slides.push(currentSlide);
      }
      currentSlide = {
        title: trimmedLine,
        content: []
      };
    } else if (currentSlide && trimmedLine) {
      currentSlide.content.push(trimmedLine);
    }
  }
  
  if (currentSlide) {
    slides.push(currentSlide);
  }
  
  // If no structured slides found, create a simple slide from the content
  if (slides.length === 0) {
    slides.push({
      title: 'Main Content',
      content: lines.filter(line => line.trim()).slice(0, 5)
    });
  }
  
  return slides;
}
