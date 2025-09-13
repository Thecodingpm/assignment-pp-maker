import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('🎯 AI Generation Request for:', prompt);

    // Create a simple fallback presentation
    const presentation = {
      title: `Presentation: ${prompt.substring(0, 50)}...`,
      description: `AI-generated presentation based on: ${prompt}`,
      tags: ['ai-generated', 'presentation'],
      slides: [
        {
          id: 'slide-1',
          type: 'title',
          backgroundColor: '#ffffff',
          elements: [
            {
              id: 'title-element',
              type: 'text',
              content: 'Title Slide',
              x: 960,
              y: 400,
              width: 800,
              height: 100,
              fontSize: 48,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              zIndex: 2
            },
            {
              id: 'subtitle-element',
              type: 'text',
              content: 'Main presentation topic',
              x: 960,
              y: 520,
              width: 600,
              height: 60,
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#666666',
              textAlign: 'center',
              zIndex: 2
            }
          ]
        },
        {
          id: 'slide-2',
          type: 'content',
          backgroundColor: '#ffffff',
          elements: [
            {
              id: 'title-element',
              type: 'text',
              content: 'Content Slide',
              x: 960,
              y: 150,
              width: 800,
              height: 80,
              fontSize: 36,
              fontFamily: 'Inter',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              zIndex: 2
            },
            {
              id: 'content-element',
              type: 'text',
              content: 'Key points and insights go here',
              x: 960,
              y: 300,
              width: 700,
              height: 300,
              fontSize: 18,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              color: '#333333',
              textAlign: 'left',
              zIndex: 2
            }
          ]
        }
      ]
    };

    console.log('✅ Generated presentation with', presentation.slides.length, 'slides');
    return NextResponse.json(presentation);

  } catch (error) {
    console.error('AI generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate presentation',
        details: error.message
      },
      { status: 500 }
    );
  }
}