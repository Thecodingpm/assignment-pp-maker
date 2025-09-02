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

    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Enhanced prompt for better slide generation
    const enhancedPrompt = `Create a professional presentation based on this request: "${prompt}"

Please generate a structured presentation with the following format:
- Title slide with main topic and professional background
- 3-7 content slides with clear structure and visual elements
- Each slide should have a title, key points, and relevant images/charts
- Use professional, engaging content with modern design principles
- Include relevant business concepts, frameworks, and visual aids
- Add background images for title slides and content images for data slides
- Use professional color schemes and typography

Return the response as a valid JSON object with this exact structure:
{
  "title": "Presentation Title",
  "description": "Brief description of the presentation",
  "tags": ["tag1", "tag2", "tag3"],
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "title": "Slide Title",
      "content": "Slide content or key points",
      "layout": "title",
      "backgroundColor": "#ffffff",
      "backgroundImage": "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&crop=center",
      "elements": [
        {
          "id": "element-1",
          "type": "text",
          "content": "Main Title",
          "x": 960,
          "y": 300,
          "width": 800,
          "height": 120,
          "fontSize": 48,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "color": "#ffffff",
          "textAlign": "center"
        }
      ]
    },
    {
      "id": "slide-2",
      "type": "content",
      "title": "Content Slide",
      "content": "Key points and insights",
      "layout": "content",
      "backgroundColor": "#ffffff",
      "elements": [
        {
          "id": "title-element",
          "type": "text",
          "content": "Slide Title",
          "x": 960,
          "y": 200,
          "width": 800,
          "height": 80,
          "fontSize": 36,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "color": "#1f2937",
          "textAlign": "center"
        },
        {
          "id": "content-element",
          "type": "text",
          "content": "• Key point 1\n• Key point 2\n• Key point 3",
          "x": 960,
          "y": 350,
          "width": 700,
          "height": 200,
          "fontSize": 24,
          "fontFamily": "Inter",
          "fontWeight": "normal",
          "color": "#374151",
          "textAlign": "left"
        },
        {
          "id": "visual-element",
          "type": "image",
          "src": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center",
          "alt": "Visual representation",
          "x": 1200,
          "y": 300,
          "width": 400,
          "height": 300
        }
      ]
    }
  ]
}

Important: Include relevant background images for title slides and content images for data/analytics slides. Use professional Unsplash images that match the content theme.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional presentation designer. Generate structured, professional presentations in the exact JSON format requested. Focus on business value and clear communication.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse the AI response and validate it's proper JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: create a basic structure from the prompt
      parsedResponse = createFallbackPresentation(prompt);
    }

    // Validate and enhance the response
    const validatedResponse = validateAndEnhancePresentation(parsedResponse);

    // Store in localStorage equivalent (you might want to store in a database)
    // For now, we'll return the data to be stored by the client

    return NextResponse.json(validatedResponse);

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

function createFallbackPresentation(prompt) {
  return {
    title: `Presentation: ${prompt.substring(0, 50)}...`,
    description: `AI-generated presentation based on: ${prompt}`,
    tags: ['ai-generated', 'presentation'],
    slides: [
      {
        id: 'slide-1',
        type: 'title',
        title: 'Title Slide',
        content: 'Main presentation topic',
        layout: 'title',
        backgroundColor: '#ffffff',
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&crop=center',
        elements: [
          {
            id: 'overlay',
            type: 'shape',
            shapeType: 'rectangle',
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
            fillColor: 'rgba(0,0,0,0.4)',
            strokeColor: 'transparent',
            strokeWidth: 0
          },
          {
            id: 'title-element',
            type: 'text',
            content: 'Your Presentation Title',
            x: 960,
            y: 300,
            width: 800,
            height: 120,
            fontSize: 48,
            fontFamily: 'Inter',
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center'
          },
          {
            id: 'subtitle-element',
            type: 'text',
            content: 'Generated by AI',
            x: 960,
            y: 450,
            width: 600,
            height: 80,
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            color: '#f3f4f6',
            textAlign: 'center'
          }
        ]
      },
      {
        id: 'slide-2',
        type: 'content',
        title: 'Key Points',
        content: 'Main content and insights',
        layout: 'content',
        backgroundColor: '#ffffff',
        elements: [
          {
            id: 'content-title',
            type: 'text',
            content: 'Key Points',
            x: 960,
            y: 200,
            width: 800,
            height: 80,
            fontSize: 36,
            fontFamily: 'Inter',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center'
          },
          {
            id: 'content-text',
            type: 'text',
            content: '• First key point\n• Second key point\n• Third key point',
            x: 960,
            y: 350,
            width: 700,
            height: 200,
            fontSize: 24,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            color: '#374151',
            textAlign: 'left'
          },
          {
            id: 'content-image',
            type: 'image',
            src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center',
            alt: 'Content visualization',
            x: 1200,
            y: 300,
            width: 400,
            height: 300
          }
        ]
      }
    ]
  };
}

function validateAndEnhancePresentation(presentation) {
  // Ensure all required fields exist
  if (!presentation.title) presentation.title = 'AI Generated Presentation';
  if (!presentation.description) presentation.description = 'A professionally crafted presentation';
  if (!presentation.tags) presentation.tags = ['ai-generated'];
  if (!presentation.slides) presentation.slides = [];

  // Ensure slides have proper structure
  presentation.slides = presentation.slides.map((slide, index) => {
    if (!slide.id) slide.id = `slide-${index + 1}`;
    if (!slide.type) slide.type = 'content';
    if (!slide.title) slide.title = `Slide ${index + 1}`;
    if (!slide.backgroundColor) slide.backgroundColor = '#ffffff';
    if (!slide.elements) slide.elements = [];
    
    // Ensure elements have proper positioning and styling
    slide.elements = slide.elements.map((element, elemIndex) => {
      if (!element.id) element.id = `element-${index + 1}-${elemIndex + 1}`;
      if (!element.x) element.x = 960; // Center of 1920px canvas
      if (!element.y) element.y = 300 + (elemIndex * 100);
      if (!element.width) element.width = 800;
      if (!element.height) element.height = 100;
      if (!element.fontSize) element.fontSize = 24;
      if (!element.fontFamily) element.fontFamily = 'Inter';
      if (!element.fontWeight) element.fontWeight = 'normal';
      if (!element.color) element.color = '#1f2937';
      if (!element.textAlign) element.textAlign = 'left';
      
      return element;
    });
    
    return slide;
  });

  return presentation;
}
