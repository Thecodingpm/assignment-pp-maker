# AI Generation Setup Guide

## 🚀 Quick Start

The AI generation feature is now implemented! Here's how to set it up:

## 1. Environment Variables

Create a `.env.local` file in your project root with:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Replicate API Configuration (for Stable Diffusion - optional)
REPLICATE_API_TOKEN=your_replicate_token_here
```

## 2. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## 3. Features Implemented

### ✅ AI Generation Modal
- **Location**: Dashboard and Landing Page
- **Functionality**: Choose between Presentation or Logo generation
- **UI**: Beautiful modal with type selection, prompt input, and customization options

### ✅ API Endpoints
- **`/api/generate-logo`**: Generates logos using DALL-E
- **`/api/generate-presentation`**: Generates presentations using GPT-4
- **`/api/ai-generate`**: Existing presentation generation (fallback)

### ✅ Integration Points
- **Dashboard**: AI Generate button in header and action cards
- **Landing Page**: AI Generate button in hero section
- **Logo Editor**: Will receive generated logo data
- **Presentation Editor**: Will receive generated presentation data

## 4. How It Works

### For Presentations:
1. User clicks "AI Generate" button
2. Modal opens with type selection
3. User selects "Presentation" and enters prompt
4. System calls `/api/ai-generate` endpoint
5. Generated presentation data is stored in localStorage
6. User is redirected to presentation editor

### For Logos:
1. User clicks "AI Generate" button
2. Modal opens with type selection
3. User selects "Logo" and enters prompt
4. System calls `/api/generate-logo` endpoint
5. Generated logo data is stored in localStorage
6. User is redirected to logo editor

## 5. Customization Options

The modal includes:
- **Style**: Modern, Minimal, Creative, Professional
- **Color**: Blue, Purple, Green, Red, Orange
- **Industry**: General, Technology, Healthcare, Finance, Education

## 6. Quick Prompts

### Presentation Prompts:
- "Create a business presentation about our new product launch"
- "Design a sales pitch presentation for our services"
- "Make a training presentation for new employees"
- "Create a quarterly business review presentation"

### Logo Prompts:
- "Design a modern tech company logo"
- "Create a minimalist restaurant logo"
- "Make a creative agency logo with bold typography"
- "Design a healthcare company logo with trust elements"

## 7. Testing

1. Start your development server: `npm run dev`
2. Go to dashboard or landing page
3. Click "AI Generate" button
4. Select type and enter a prompt
5. Click "Generate" and watch the magic happen!

## 8. Cost Considerations

- **DALL-E**: ~$0.02-0.08 per logo generation
- **GPT-4**: ~$0.01-0.03 per presentation generation
- **Estimated monthly cost**: $50-200 for moderate usage

## 9. Next Steps

1. **Add your OpenAI API key** to `.env.local`
2. **Test the feature** with sample prompts
3. **Customize prompts** for your specific use cases
4. **Add more AI models** (Stable Diffusion, Midjourney) for better results
5. **Implement post-processing** (background removal, vector conversion)

## 10. Troubleshooting

### Common Issues:
- **"Failed to generate"**: Check your OpenAI API key
- **"Rate limit exceeded"**: Wait a few minutes and try again
- **"Invalid prompt"**: Try a more descriptive prompt

### Debug Mode:
- Open browser console to see detailed error messages
- Check network tab for API call details

## 🎉 You're Ready!

The AI generation feature is now fully implemented and ready to use. Just add your OpenAI API key and start generating amazing presentations and logos!
