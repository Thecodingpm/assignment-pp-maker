import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, options = {} } = await request.json();
    
    console.log('🎨 Generating AI-powered professional logo with prompt:', prompt);
    
    // For now, let's use our enhanced fallback system that creates professional logos
    // This gives much better results than raw Stable Diffusion for logos
    return generateFallbackLogo(prompt, options);

  } catch (error) {
    console.error('Error generating AI logo:', error);
    return generateFallbackLogo(prompt, options);
  }
}

async function generateFallbackLogo(prompt: string, options: any) {
  // Generate dynamic logo based on prompt and options
  const colors = generateColorsFromPrompt(prompt, options);
  const shapes = generateShapesFromPrompt(prompt, options);
  const style = options?.style || 'professional';
  
  const canvas = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:1" />
        </linearGradient>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.accent1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent2};stop-opacity:1" />
        </linearGradient>
        <radialGradient id="radial1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.primary};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${colors.secondary};stop-opacity:0.4" />
        </radialGradient>
      </defs>
      
      <!-- Background -->
      <rect width="512" height="512" fill="${colors.background}" rx="64"/>
      
      <!-- Main shapes based on prompt -->
      ${shapes.main}
      
      <!-- Accent elements -->
      ${shapes.accents}
      
      <!-- Decorative elements -->
      ${shapes.decorative}
      
      <!-- Style-specific elements -->
      ${getStyleElements(style, colors)}
    </svg>
  `;

  const base64 = Buffer.from(canvas).toString('base64');
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return NextResponse.json({
    success: true,
    imageUrl: dataUrl,
    prompt: prompt,
    model: 'dynamic-fallback',
    cost: 'FREE - Dynamic Fallback',
    service: 'AI Logo Generator',
    note: 'This is a dynamic fallback logo based on your prompt. For real AI generation, set up Replicate API token.'
  });
}

function generateColorsFromPrompt(prompt: string, options: any) {
  const promptLower = prompt.toLowerCase();
  const color = options?.color || 'modern';
  
  // Color schemes based on prompt keywords
  if (promptLower.includes('coffee') || promptLower.includes('restaurant') || promptLower.includes('food')) {
    return {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent1: '#F4A460',
      accent2: '#DEB887',
      background: '#FFF8DC'
    };
  } else if (promptLower.includes('tech') || promptLower.includes('startup') || promptLower.includes('digital')) {
    return {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent1: '#3B82F6',
      accent2: '#60A5FA',
      background: '#F8FAFC'
    };
  } else if (promptLower.includes('health') || promptLower.includes('medical') || promptLower.includes('wellness')) {
    return {
      primary: '#059669',
      secondary: '#047857',
      accent1: '#10B981',
      accent2: '#34D399',
      background: '#F0FDF4'
    };
  } else if (promptLower.includes('fitness') || promptLower.includes('gym') || promptLower.includes('sport')) {
    return {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent1: '#EF4444',
      accent2: '#F87171',
      background: '#FEF2F2'
    };
  } else if (promptLower.includes('finance') || promptLower.includes('bank') || promptLower.includes('money')) {
    return {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent1: '#8B5CF6',
      accent2: '#A78BFA',
      background: '#FAF5FF'
    };
  } else if (promptLower.includes('education') || promptLower.includes('school') || promptLower.includes('university')) {
    return {
      primary: '#1E40AF',
      secondary: '#1E3A8A',
      accent1: '#3B82F6',
      accent2: '#60A5FA',
      background: '#EFF6FF'
    };
  } else if (promptLower.includes('beauty') || promptLower.includes('salon') || promptLower.includes('spa')) {
    return {
      primary: '#EC4899',
      secondary: '#DB2777',
      accent1: '#F472B6',
      accent2: '#F9A8D4',
      background: '#FDF2F8'
    };
  } else if (promptLower.includes('real estate') || promptLower.includes('property') || promptLower.includes('home')) {
    return {
      primary: '#059669',
      secondary: '#047857',
      accent1: '#10B981',
      accent2: '#34D399',
      background: '#F0FDF4'
    };
  } else if (promptLower.includes('travel') || promptLower.includes('tourism') || promptLower.includes('airline')) {
    return {
      primary: '#0EA5E9',
      secondary: '#0284C7',
      accent1: '#38BDF8',
      accent2: '#7DD3FC',
      background: '#F0F9FF'
    };
  } else if (promptLower.includes('automotive') || promptLower.includes('car') || promptLower.includes('auto')) {
    return {
      primary: '#374151',
      secondary: '#1F2937',
      accent1: '#6B7280',
      accent2: '#9CA3AF',
      background: '#F9FAFB'
    };
  } else if (promptLower.includes('fashion') || promptLower.includes('clothing') || promptLower.includes('style')) {
    return {
      primary: '#7C2D12',
      secondary: '#991B1B',
      accent1: '#DC2626',
      accent2: '#F87171',
      background: '#FEF2F2'
    };
  } else if (promptLower.includes('music') || promptLower.includes('audio') || promptLower.includes('sound')) {
    return {
      primary: '#7C3AED',
      secondary: '#6D28D9',
      accent1: '#8B5CF6',
      accent2: '#A78BFA',
      background: '#FAF5FF'
    };
  } else if (promptLower.includes('sports') || promptLower.includes('athletic') || promptLower.includes('team')) {
    return {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent1: '#EF4444',
      accent2: '#F87171',
      background: '#FEF2F2'
    };
  } else if (promptLower.includes('law') || promptLower.includes('legal') || promptLower.includes('attorney')) {
    return {
      primary: '#1F2937',
      secondary: '#111827',
      accent1: '#374151',
      accent2: '#6B7280',
      background: '#F9FAFB'
    };
  } else if (promptLower.includes('consulting') || promptLower.includes('business') || promptLower.includes('strategy')) {
    return {
      primary: '#1E40AF',
      secondary: '#1E3A8A',
      accent1: '#3B82F6',
      accent2: '#60A5FA',
      background: '#EFF6FF'
    };
  } else if (color === 'blue') {
    return {
      primary: '#2563EB',
      secondary: '#1E40AF',
      accent1: '#3B82F6',
      accent2: '#60A5FA',
      background: '#F8FAFC'
    };
  } else if (color === 'green') {
    return {
      primary: '#059669',
      secondary: '#047857',
      accent1: '#10B981',
      accent2: '#34D399',
      background: '#F0FDF4'
    };
  } else if (color === 'red') {
    return {
      primary: '#DC2626',
      secondary: '#B91C1C',
      accent1: '#EF4444',
      accent2: '#F87171',
      background: '#FEF2F2'
    };
  } else if (color === 'orange') {
    return {
      primary: '#EA580C',
      secondary: '#C2410C',
      accent1: '#F97316',
      accent2: '#FB923C',
      background: '#FFF7ED'
    };
  } else {
    // Default modern colors
    return {
      primary: '#6366F1',
      secondary: '#4F46E5',
      accent1: '#8B5CF6',
      accent2: '#A78BFA',
      background: '#F8FAFC'
    };
  }
}

function generateShapesFromPrompt(prompt: string, options: any) {
  const promptLower = prompt.toLowerCase();
  const style = options?.style || 'professional';
  
  // Main shape based on prompt - much more sophisticated designs
  let mainShape = '';
  let accents = '';
  let decorative = '';
  
  if (promptLower.includes('coffee') || promptLower.includes('restaurant') || promptLower.includes('cafe')) {
    mainShape = `
      <!-- Modern coffee cup with steam -->
      <path d="M 180 200 Q 180 180 200 180 L 312 180 Q 332 180 332 200 L 332 280 Q 332 300 312 300 L 200 300 Q 180 300 180 280 Z" fill="url(#grad1)"/>
      <path d="M 200 200 L 200 280 L 312 280 L 312 200 Z" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="256" cy="160" r="25" fill="url(#grad2)" opacity="0.9"/>
      <rect x="240" y="140" width="32" height="6" rx="3" fill="url(#grad2)" opacity="0.7"/>
      <!-- Steam lines -->
      <path d="M 240 130 Q 245 120 250 130 Q 255 120 260 130" stroke="url(#grad2)" stroke-width="3" fill="none" opacity="0.6"/>
      <path d="M 250 130 Q 255 120 260 130 Q 265 120 270 130" stroke="url(#grad2)" stroke-width="3" fill="none" opacity="0.6"/>
    `;
    accents = `
      <circle cx="220" cy="220" r="8" fill="white" opacity="0.9"/>
      <circle cx="292" cy="220" r="8" fill="white" opacity="0.9"/>
      <rect x="240" y="240" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('tech') || promptLower.includes('startup') || promptLower.includes('software')) {
    mainShape = `
      <!-- Modern tech hexagon with circuit pattern -->
      <polygon points="256,140 320,180 320,260 256,300 192,260 192,180" fill="url(#grad1)"/>
      <polygon points="256,160 300,190 300,250 256,280 212,250 212,190" fill="url(#grad2)" opacity="0.8"/>
      <!-- Circuit lines -->
      <rect x="240" y="200" width="32" height="4" rx="2" fill="white" opacity="0.9"/>
      <rect x="220" y="220" width="72" height="4" rx="2" fill="white" opacity="0.7"/>
      <rect x="250" y="240" width="12" height="4" rx="2" fill="white" opacity="0.8"/>
    `;
    accents = `
      <circle cx="240" cy="200" r="6" fill="white" opacity="0.9"/>
      <circle cx="272" cy="200" r="6" fill="white" opacity="0.9"/>
      <circle cx="256" cy="220" r="4" fill="white" opacity="0.8"/>
    `;
  } else if (promptLower.includes('health') || promptLower.includes('medical') || promptLower.includes('wellness')) {
    mainShape = `
      <!-- Medical cross with heart -->
      <rect x="240" y="160" width="32" height="80" rx="16" fill="url(#grad1)"/>
      <rect x="200" y="200" width="112" height="32" rx="16" fill="url(#grad1)"/>
      <circle cx="256" cy="130" r="30" fill="url(#grad2)" opacity="0.9"/>
      <!-- Heart shape -->
      <path d="M 256 150 Q 240 140 230 150 Q 220 160 230 170 Q 240 180 256 200 Q 272 180 282 170 Q 292 160 282 150 Q 272 140 256 150 Z" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="230" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="282" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="220" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('fitness') || promptLower.includes('gym') || promptLower.includes('sport')) {
    mainShape = `
      <!-- Modern fitness dumbbell -->
      <rect x="180" y="200" width="152" height="24" rx="12" fill="url(#grad1)"/>
      <circle cx="200" cy="212" r="30" fill="url(#grad2)" opacity="0.9"/>
      <circle cx="312" cy="212" r="30" fill="url(#grad2)" opacity="0.9"/>
      <rect x="220" y="190" width="72" height="44" rx="22" fill="url(#grad1)" opacity="0.8"/>
      <!-- Weight plates -->
      <rect x="190" y="185" width="20" height="54" rx="10" fill="url(#grad2)" opacity="0.7"/>
      <rect x="302" y="185" width="20" height="54" rx="10" fill="url(#grad2)" opacity="0.7"/>
    `;
    accents = `
      <circle cx="190" cy="200" r="6" fill="white" opacity="0.9"/>
      <circle cx="322" cy="200" r="6" fill="white" opacity="0.9"/>
      <rect x="250" y="200" width="12" height="4" rx="2" fill="white" opacity="0.8"/>
    `;
  } else if (promptLower.includes('finance') || promptLower.includes('bank') || promptLower.includes('money')) {
    mainShape = `
      <!-- Modern finance building with dollar sign -->
      <rect x="200" y="180" width="112" height="80" rx="8" fill="url(#grad1)"/>
      <rect x="220" y="200" width="20" height="60" fill="url(#grad2)" opacity="0.8"/>
      <rect x="260" y="200" width="20" height="60" fill="url(#grad2)" opacity="0.8"/>
      <rect x="300" y="200" width="20" height="60" fill="url(#grad2)" opacity="0.8"/>
      <polygon points="200,180 256,140 312,180" fill="url(#grad2)" opacity="0.8"/>
      <!-- Dollar sign -->
      <path d="M 256 200 L 256 240 M 250 200 L 262 200 M 250 240 L 262 240 M 250 220 L 262 220" stroke="white" stroke-width="4" fill="none"/>
    `;
    accents = `
      <circle cx="230" cy="160" r="8" fill="white" opacity="0.8"/>
      <circle cx="282" cy="160" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('food') || promptLower.includes('restaurant') || promptLower.includes('cooking')) {
    mainShape = `
      <!-- Chef hat and utensils -->
      <ellipse cx="256" cy="180" rx="60" ry="20" fill="url(#grad1)"/>
      <rect x="240" y="180" width="32" height="60" rx="16" fill="url(#grad2)" opacity="0.8"/>
      <path d="M 220 200 L 220 280 L 240 280 L 240 200 Z" fill="url(#grad1)"/>
      <path d="M 272 200 L 272 280 L 292 280 L 292 200 Z" fill="url(#grad1)"/>
      <circle cx="256" cy="160" r="15" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="230" cy="220" r="6" fill="white" opacity="0.8"/>
      <circle cx="282" cy="220" r="6" fill="white" opacity="0.8"/>
      <rect x="250" y="240" width="12" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('education') || promptLower.includes('school') || promptLower.includes('university') || promptLower.includes('learning')) {
    mainShape = `
      <!-- Education graduation cap and book -->
      <rect x="200" y="180" width="112" height="80" rx="8" fill="url(#grad1)"/>
      <polygon points="200,180 256,140 312,180" fill="url(#grad2)" opacity="0.8"/>
      <rect x="220" y="200" width="72" height="60" rx="4" fill="white" opacity="0.9"/>
      <rect x="240" y="220" width="32" height="4" rx="2" fill="url(#grad1)"/>
      <rect x="250" y="240" width="12" height="4" rx="2" fill="url(#grad1)"/>
      <circle cx="256" cy="160" r="8" fill="white" opacity="0.8"/>
    `;
    accents = `
      <circle cx="230" cy="200" r="6" fill="white" opacity="0.8"/>
      <circle cx="282" cy="200" r="6" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('beauty') || promptLower.includes('salon') || promptLower.includes('spa') || promptLower.includes('cosmetics')) {
    mainShape = `
      <!-- Beauty mirror and brush -->
      <circle cx="256" cy="200" r="60" fill="url(#grad1)"/>
      <circle cx="256" cy="200" r="45" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="256" cy="200" r="30" fill="white" opacity="0.9"/>
      <path d="M 200 200 Q 220 180 240 200 Q 220 220 200 200" fill="url(#grad1)" opacity="0.7"/>
      <path d="M 272 200 Q 292 180 312 200 Q 292 220 272 200" fill="url(#grad1)" opacity="0.7"/>
      <rect x="250" y="280" width="12" height="40" rx="6" fill="url(#grad2)" opacity="0.8"/>
    `;
    accents = `
      <circle cx="220" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="292" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="320" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('real estate') || promptLower.includes('property') || promptLower.includes('housing') || promptLower.includes('home')) {
    mainShape = `
      <!-- Real estate house -->
      <rect x="200" y="200" width="112" height="80" rx="8" fill="url(#grad1)"/>
      <polygon points="200,200 256,160 312,200" fill="url(#grad2)" opacity="0.8"/>
      <rect x="240" y="240" width="32" height="40" rx="4" fill="white" opacity="0.9"/>
      <rect x="220" y="220" width="20" height="20" rx="2" fill="url(#grad2)" opacity="0.7"/>
      <rect x="272" y="220" width="20" height="20" rx="2" fill="url(#grad2)" opacity="0.7"/>
      <circle cx="256" cy="160" r="8" fill="white" opacity="0.8"/>
    `;
    accents = `
      <circle cx="230" cy="180" r="6" fill="white" opacity="0.8"/>
      <circle cx="282" cy="180" r="6" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('travel') || promptLower.includes('tourism') || promptLower.includes('vacation') || promptLower.includes('airline')) {
    mainShape = `
      <!-- Travel airplane and globe -->
      <circle cx="256" cy="200" r="60" fill="url(#grad1)"/>
      <path d="M 200 200 L 240 180 L 280 200 L 312 200 L 280 220 L 240 220 Z" fill="url(#grad2)" opacity="0.9"/>
      <circle cx="256" cy="200" r="30" fill="white" opacity="0.9"/>
      <path d="M 220 200 L 240 190 L 260 200 L 240 210 Z" fill="url(#grad1)" opacity="0.8"/>
      <rect x="250" y="280" width="12" height="40" rx="6" fill="url(#grad2)" opacity="0.8"/>
    `;
    accents = `
      <circle cx="220" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="292" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="320" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('automotive') || promptLower.includes('car') || promptLower.includes('auto') || promptLower.includes('vehicle')) {
    mainShape = `
      <!-- Automotive car silhouette -->
      <ellipse cx="256" cy="220" rx="80" ry="30" fill="url(#grad1)"/>
      <ellipse cx="256" cy="200" rx="60" ry="20" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="220" cy="240" r="20" fill="url(#grad1)" opacity="0.9"/>
      <circle cx="292" cy="240" r="20" fill="url(#grad1)" opacity="0.9"/>
      <circle cx="220" cy="240" r="12" fill="white" opacity="0.8"/>
      <circle cx="292" cy="240" r="12" fill="white" opacity="0.8"/>
      <rect x="240" y="180" width="32" height="8" rx="4" fill="url(#grad2)" opacity="0.7"/>
    `;
    accents = `
      <circle cx="200" cy="200" r="6" fill="white" opacity="0.8"/>
      <circle cx="312" cy="200" r="6" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('fashion') || promptLower.includes('clothing') || promptLower.includes('apparel') || promptLower.includes('style')) {
    mainShape = `
      <!-- Fashion hanger and dress -->
      <path d="M 256 160 L 240 200 L 220 220 L 240 240 L 272 240 L 292 220 L 272 200 Z" fill="url(#grad1)"/>
      <path d="M 256 160 L 240 200 L 272 200 Z" fill="url(#grad2)" opacity="0.8"/>
      <rect x="250" y="140" width="12" height="20" rx="6" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="256" cy="130" r="8" fill="white" opacity="0.9"/>
      <rect x="240" y="280" width="32" height="40" rx="16" fill="url(#grad1)" opacity="0.7"/>
    `;
    accents = `
      <circle cx="220" cy="200" r="6" fill="white" opacity="0.8"/>
      <circle cx="292" cy="200" r="6" fill="white" opacity="0.8"/>
      <rect x="240" y="320" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('music') || promptLower.includes('audio') || promptLower.includes('sound') || promptLower.includes('studio')) {
    mainShape = `
      <!-- Music note and sound waves -->
      <circle cx="240" cy="180" r="20" fill="url(#grad1)"/>
      <rect x="250" y="160" width="8" height="60" fill="url(#grad1)"/>
      <path d="M 258 160 Q 280 140 300 160 Q 320 180 300 200 Q 280 220 258 200" stroke="url(#grad2)" stroke-width="8" fill="none"/>
      <path d="M 258 200 Q 280 180 300 200 Q 320 220 300 240 Q 280 260 258 240" stroke="url(#grad2)" stroke-width="6" fill="none"/>
      <circle cx="256" cy="160" r="6" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="200" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="312" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('sports') || promptLower.includes('athletic') || promptLower.includes('team') || promptLower.includes('game')) {
    mainShape = `
      <!-- Sports ball and trophy -->
      <circle cx="256" cy="200" r="50" fill="url(#grad1)"/>
      <path d="M 206 200 Q 256 150 306 200 Q 256 250 206 200" stroke="url(#grad2)" stroke-width="4" fill="none"/>
      <path d="M 256 150 Q 206 200 256 250 Q 306 200 256 150" stroke="url(#grad2)" stroke-width="4" fill="none"/>
      <rect x="240" y="280" width="32" height="40" rx="16" fill="url(#grad2)" opacity="0.8"/>
      <rect x="250" y="300" width="12" height="20" rx="6" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="200" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="312" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="320" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('law') || promptLower.includes('legal') || promptLower.includes('attorney') || promptLower.includes('justice')) {
    mainShape = `
      <!-- Legal scales of justice -->
      <rect x="240" y="200" width="32" height="60" rx="16" fill="url(#grad1)"/>
      <rect x="200" y="180" width="20" height="4" rx="2" fill="url(#grad2)" opacity="0.8"/>
      <rect x="292" y="180" width="20" height="4" rx="2" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="210" cy="160" r="15" fill="url(#grad1)" opacity="0.9"/>
      <circle cx="302" cy="160" r="15" fill="url(#grad1)" opacity="0.9"/>
      <path d="M 200 180 L 256 200 L 312 180" stroke="url(#grad2)" stroke-width="4" fill="none"/>
      <circle cx="256" cy="200" r="8" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="200" cy="140" r="6" fill="white" opacity="0.8"/>
      <circle cx="312" cy="140" r="6" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else if (promptLower.includes('consulting') || promptLower.includes('business') || promptLower.includes('strategy') || promptLower.includes('management')) {
    mainShape = `
      <!-- Business chart and growth -->
      <rect x="200" y="200" width="112" height="80" rx="8" fill="url(#grad1)"/>
      <rect x="220" y="240" width="20" height="40" fill="url(#grad2)" opacity="0.8"/>
      <rect x="250" y="220" width="20" height="60" fill="url(#grad2)" opacity="0.8"/>
      <rect x="280" y="200" width="20" height="80" fill="url(#grad2)" opacity="0.8"/>
      <path d="M 230 240 L 260 220 L 290 200" stroke="white" stroke-width="4" fill="none"/>
      <circle cx="256" cy="160" r="20" fill="url(#grad2)" opacity="0.9"/>
      <path d="M 240 160 L 256 140 L 272 160 L 256 180 Z" fill="white" opacity="0.9"/>
    `;
    accents = `
      <circle cx="200" cy="180" r="8" fill="white" opacity="0.8"/>
      <circle cx="312" cy="180" r="8" fill="white" opacity="0.8"/>
      <rect x="240" y="280" width="32" height="4" rx="2" fill="white" opacity="0.7"/>
    `;
  } else {
    // Default modern professional shape - abstract geometric
    mainShape = `
      <!-- Modern abstract logo -->
      <circle cx="256" cy="200" r="80" fill="url(#grad1)"/>
      <polygon points="256,140 300,200 256,260 212,200" fill="url(#grad2)" opacity="0.8"/>
      <circle cx="256" cy="200" r="40" fill="white" opacity="0.9"/>
      <rect x="216" y="280" width="80" height="40" rx="20" fill="url(#grad2)" opacity="0.8"/>
    `;
    accents = `
      <circle cx="200" cy="180" r="20" fill="white" opacity="0.7"/>
      <circle cx="312" cy="180" r="20" fill="white" opacity="0.7"/>
      <rect x="240" y="320" width="32" height="4" rx="2" fill="white" opacity="0.6"/>
    `;
  }
  
  // Decorative elements
  decorative = `
    <path d="M 100 100 L 150 150 L 100 200 L 50 150 Z" fill="url(#grad1)" opacity="0.2"/>
    <path d="M 412 100 L 462 150 L 412 200 L 362 150 Z" fill="url(#grad2)" opacity="0.2"/>
  `;
  
  return { main: mainShape, accents, decorative };
}

function getStyleElements(style: string, colors: any) {
  if (style === 'minimalist') {
    return `
      <!-- Minimalist clean lines -->
      <line x1="150" y1="100" x2="362" y2="100" stroke="${colors.primary}" stroke-width="2" opacity="0.5"/>
      <line x1="150" y1="350" x2="362" y2="350" stroke="${colors.primary}" stroke-width="2" opacity="0.5"/>
    `;
  } else if (style === 'creative') {
    return `
      <!-- Creative artistic elements -->
      <path d="M 120 120 Q 200 80 280 120 Q 360 160 280 200 Q 200 240 120 200 Q 40 160 120 120" 
            fill="none" stroke="${colors.accent1}" stroke-width="3" opacity="0.6"/>
      <circle cx="400" cy="120" r="15" fill="${colors.accent2}" opacity="0.4"/>
      <circle cx="400" cy="280" r="15" fill="${colors.accent2}" opacity="0.4"/>
    `;
  } else if (style === 'professional') {
    return `
      <!-- Professional corporate elements -->
      <rect x="200" y="340" width="112" height="8" rx="4" fill="${colors.primary}" opacity="0.6"/>
      <rect x="180" y="360" width="152" height="4" rx="2" fill="${colors.secondary}" opacity="0.4"/>
    `;
  } else {
    return `
      <!-- Modern tech elements -->
      <rect x="180" y="340" width="152" height="6" rx="3" fill="${colors.primary}" opacity="0.5"/>
      <rect x="200" y="360" width="112" height="4" rx="2" fill="${colors.accent1}" opacity="0.4"/>
    `;
  }
}
