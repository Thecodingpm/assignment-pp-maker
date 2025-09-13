import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { originalPrompt, refinementInstructions, options } = await request.json();
    
    if (!originalPrompt || !refinementInstructions) {
      return NextResponse.json({ error: 'Original prompt and refinement instructions are required' }, { status: 400 });
    }

    // Create refined prompt based on user feedback
    const refinedPrompt = `Refine this logo design: ${originalPrompt}. 
    Refinement instructions: ${refinementInstructions}.
    Style: ${options.style || 'professional'}, 
    Colors: ${options.color || 'modern'}, 
    Industry: ${options.industry || 'general'}.
    Requirements: Improved version, higher quality, more professional, better composition, enhanced visual appeal, award-winning design quality, scalable vector design.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: refinedPrompt,
        n: 1,
        size: "1024x1024"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'Failed to refine logo' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      imageUrl: data.data[0].url,
      prompt: refinedPrompt,
      refinementInstructions
    });

  } catch (error) {
    console.error('Logo refinement error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
