import { NextResponse } from 'next/server';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export async function POST(request) {
  try {
    const { imageRequests } = await request.json();
    
    if (!imageRequests || !Array.isArray(imageRequests)) {
      return NextResponse.json(
        { error: 'Image requests array is required' },
        { status: 400 }
      );
    }

    if (!UNSPLASH_ACCESS_KEY) {
      return NextResponse.json(
        { error: 'Unsplash API key not configured' },
        { status: 500 }
      );
    }

    // Process each image request
    const imageResults = await Promise.all(
      imageRequests.map(async (request) => {
        try {
          const { query, type = 'content', width = 500, height = 400 } = request;
          
          // Smart query enhancement
          const enhancedQuery = enhanceImageQuery(query, type);
          
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(enhancedQuery)}&per_page=5&client_id=${UNSPLASH_ACCESS_KEY}`
          );

          if (!response.ok) {
            throw new Error(`Unsplash API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            // Select the best image based on quality and relevance
            const bestImage = selectBestImage(data.results, type);
            
            return {
              query: query,
              type: type,
              url: bestImage.urls.regular,
              thumb: bestImage.urls.small,
              alt: bestImage.alt_description || query,
              credit: `by ${bestImage.user.name}`,
              width: width,
              height: height
            };
          } else {
            // Fallback image
            return {
              query: query,
              type: type,
              url: getFallbackImage(type),
              thumb: getFallbackImage(type),
              alt: query,
              credit: 'Unsplash',
              width: width,
              height: height
            };
          }
        } catch (error) {
          console.error(`Error fetching image for "${request.query}":`, error);
          return {
            query: request.query,
            type: request.type,
            url: getFallbackImage(request.type),
            thumb: getFallbackImage(request.type),
            alt: request.query,
            credit: 'Unsplash',
            width: request.width,
            height: request.height
          };
        }
      })
    );

    return NextResponse.json({ images: imageResults });

  } catch (error) {
    console.error('Smart images API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// Enhance image queries for better results
function enhanceImageQuery(query, type) {
  const enhancements = {
    'laptop': 'laptop computer technology modern',
    'business': 'business meeting office professional',
    'startup': 'startup technology innovation modern',
    'team': 'team meeting collaboration business',
    'data': 'data analytics charts graphs',
    'money': 'money finance investment business',
    'growth': 'growth chart business success',
    'technology': 'technology digital innovation',
    'education': 'education learning classroom',
    'creative': 'creative design art modern',
    'presentation': 'presentation meeting business',
    'office': 'office workspace modern business',
    'meeting': 'business meeting conference',
    'chart': 'chart graph data analytics',
    'phone': 'smartphone mobile technology',
    'website': 'website design digital',
    'app': 'mobile app smartphone',
    'ai': 'artificial intelligence technology',
    'robot': 'robot automation technology',
    'cloud': 'cloud computing technology'
  };

  // Check for exact matches first
  if (enhancements[query.toLowerCase()]) {
    return enhancements[query.toLowerCase()];
  }

  // Check for partial matches
  const lowerQuery = query.toLowerCase();
  for (const [key, value] of Object.entries(enhancements)) {
    if (lowerQuery.includes(key)) {
      return value;
    }
  }

  // Add type-specific enhancements
  const typeEnhancements = {
    'background': `${query} background professional`,
    'content': `${query} concept modern`,
    'title': `${query} background professional`
  };

  return typeEnhancements[type] || `${query} professional modern`;
}

// Select the best image from results
function selectBestImage(results, type) {
  // Sort by relevance and quality
  const sorted = results.sort((a, b) => {
    // Prefer images with good descriptions
    const aDesc = a.alt_description ? a.alt_description.length : 0;
    const bDesc = b.alt_description ? b.alt_description.length : 0;
    
    // Prefer higher resolution
    const aRes = a.width * a.height;
    const bRes = b.width * b.height;
    
    return (bDesc + bRes) - (aDesc + aRes);
  });

  return sorted[0];
}

// Get fallback images
function getFallbackImage(type) {
  const fallbacks = {
    'background': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&crop=center',
    'content': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=400&fit=crop&crop=center',
    'title': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop&crop=center'
  };

  return fallbacks[type] || fallbacks['content'];
}



