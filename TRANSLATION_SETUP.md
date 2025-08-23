# Translation Feature Setup Guide

This guide explains how to set up real translation APIs for the translation feature in your assignment presentation maker.

## Overview

The translation feature currently includes simulated translations for demonstration purposes. To use real translation services, you'll need to set up API keys and configure the translation service.

## Supported Translation Providers

### 1. Google Translate API

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Cloud Translation API
4. Create credentials (API Key)
5. Set up billing (Google Translate API is not free)

**API Key Setup:**
```typescript
// In your environment variables (.env.local)
GOOGLE_TRANSLATE_API_KEY=your_api_key_here

// In the GoogleTranslateProvider class
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
```

**Cost:** $20 per million characters translated

### 2. DeepL API

**Setup Steps:**
1. Go to [DeepL API](https://www.deepl.com/pro-api)
2. Sign up for a DeepL Pro account
3. Get your API key from the account dashboard
4. Choose between DeepL Free (500,000 characters/month) or DeepL Pro

**API Key Setup:**
```typescript
// In your environment variables (.env.local)
DEEPL_API_KEY=your_api_key_here

// In the DeepLProvider class
const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
```

**Cost:** 
- Free: 500,000 characters/month
- Pro: €5.49 per million characters

### 3. Microsoft Translator API

**Setup Steps:**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create a new Translator resource
3. Get your subscription key and region
4. Set up billing

**API Key Setup:**
```typescript
// In your environment variables (.env.local)
MS_TRANSLATOR_KEY=your_subscription_key_here
MS_TRANSLATOR_REGION=your_region_here

// In the MicrosoftTranslatorProvider class
const MS_TRANSLATOR_KEY = process.env.MS_TRANSLATOR_KEY;
const MS_TRANSLATOR_REGION = process.env.MS_TRANSLATOR_REGION;
```

**Cost:** $10 per million characters translated

## Environment Variables Setup

Create a `.env.local` file in your project root:

```bash
# Translation API Keys
GOOGLE_TRANSLATE_API_KEY=your_google_api_key
DEEPL_API_KEY=your_deepl_api_key
MS_TRANSLATOR_KEY=your_microsoft_key
MS_TRANSLATOR_REGION=your_microsoft_region

# Optional: Default translation provider
DEFAULT_TRANSLATION_PROVIDER=Google Translate
```

## Updating the Translation Service

To use real APIs instead of simulated translations, update the provider classes in `app/utils/translationService.ts`:

### Google Translate Example:
```typescript
async translate(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: request.text,
        target: request.targetLanguage,
        source: request.sourceLanguage || 'auto'
      })
    });
    
    const data = await response.json();
    
    return {
      translatedText: data.data.translations[0].translatedText,
      sourceLanguage: data.data.translations[0].detectedSourceLanguage || request.sourceLanguage || 'en',
      targetLanguage: request.targetLanguage,
      confidence: 0.95
    };
  } catch (error) {
    console.error('Google Translate API error:', error);
    throw new Error('Translation failed. Please try again.');
  }
}
```

### DeepL Example:
```typescript
async translate(request: TranslationRequest): Promise<TranslationResponse> {
  try {
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: { 
        'Authorization': `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: request.text,
        target_lang: request.targetLanguage.toUpperCase(),
        source_lang: (request.sourceLanguage || 'EN').toUpperCase()
      })
    });
    
    const data = await response.json();
    
    return {
      translatedText: data.translations[0].text,
      sourceLanguage: data.translations[0].detected_source_language || request.sourceLanguage || 'en',
      targetLanguage: request.targetLanguage,
      confidence: 0.98
    };
  } catch (error) {
    console.error('DeepL API error:', error);
    throw new Error('Translation failed. Please try again.');
  }
}
```

## Rate Limiting and Error Handling

Consider implementing rate limiting and better error handling:

```typescript
class RateLimitedProvider implements TranslationProvider {
  private requestCount = 0;
  private lastReset = Date.now();
  private readonly maxRequests = 1000; // per hour
  private readonly resetInterval = 60 * 60 * 1000; // 1 hour
  
  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    // Check rate limits
    if (this.shouldReset()) {
      this.resetCounters();
    }
    
    if (this.requestCount >= this.maxRequests) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    this.requestCount++;
    
    try {
      // Make actual API call
      return await this.makeApiCall(request);
    } catch (error) {
      if (error.message.includes('rate limit')) {
        throw new Error('Translation service is busy. Please try again later.');
      }
      throw error;
    }
  }
  
  private shouldReset(): boolean {
    return Date.now() - this.lastReset > this.resetInterval;
  }
  
  private resetCounters(): void {
    this.requestCount = 0;
    this.lastReset = Date.now();
  }
}
```

## Security Considerations

1. **Never expose API keys in client-side code**
2. **Use environment variables for sensitive data**
3. **Implement server-side translation endpoints** for production use
4. **Add request validation and sanitization**
5. **Monitor API usage and costs**

## Server-Side Implementation (Recommended for Production)

For production use, create server-side API endpoints:

```typescript
// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { translationService } from '@/utils/translationService';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage } = await request.json();
    
    // Validate input
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Perform translation
    const result = await translationService.translate({
      text,
      targetLanguage,
      sourceLanguage
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
```

Then update the client-side code to use this endpoint:

```typescript
const translateText = async (targetLanguage: string) => {
  const editor = getCurrentEditor();
  if (!editor) return;

  setIsTranslating(true);
  
  try {
    const selection = $getSelection();
    if ($isRangeSelection(selection) && !selection.isCollapsed()) {
      const selectedText = selection.getTextContent();
      
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: selectedText,
          targetLanguage,
          sourceLanguage: 'auto'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        selection.insertText(result.translatedText);
      } else {
        throw new Error('Translation failed');
      }
    }
  } catch (error) {
    console.error('Translation error:', error);
    // Handle error appropriately
  } finally {
    setIsTranslating(false);
  }
};
```

## Testing

Test your translation setup with:

```typescript
// Test script
async function testTranslation() {
  const testText = "Hello, world!";
  const targetLang = "es";
  
  try {
    const result = await translationService.translate({
      text: testText,
      targetLanguage: targetLang
    });
    
    console.log('Translation result:', result);
  } catch (error) {
    console.error('Translation test failed:', error);
  }
}
```

## Troubleshooting

### Common Issues:

1. **API Key Invalid**: Check your API key and ensure it's correctly set in environment variables
2. **Rate Limiting**: Implement proper rate limiting and error handling
3. **CORS Issues**: Use server-side endpoints for production
4. **Billing Issues**: Ensure your account has proper billing setup
5. **Quota Exceeded**: Monitor your API usage and implement fallbacks

### Debug Mode:

Enable debug logging in your translation service:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Translation request:', request);
  console.log('API response:', response);
}
```

## Support

For API-specific issues:
- **Google Translate**: [Google Cloud Support](https://cloud.google.com/support)
- **DeepL**: [DeepL Support](https://support.deepl.com/)
- **Microsoft Translator**: [Azure Support](https://azure.microsoft.com/support/)

For application-specific issues, check the application logs and ensure proper error handling is in place. 