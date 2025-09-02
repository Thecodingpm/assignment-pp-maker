# AI Presentation Generation Setup

This application includes AI-powered presentation generation using OpenAI's GPT models. Follow these steps to set up the feature:

## Prerequisites

1. **OpenAI API Key**: You need an OpenAI API key to use this feature
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Navigate to [API Keys](https://platform.openai.com/api-keys)
   - Create a new API key

## Environment Setup

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your OpenAI API key:

```bash
# .env.local
OPENAI_API_KEY=your_actual_api_key_here
```

## Features

### AI Popup Component (`app/components/AIPopup.jsx`)
- Modal with textarea for describing presentations
- Enter key handling for quick generation
- Calls AI API and redirects to generate page
- Error handling and loading states

### Generate Page (`app/generate/page.jsx`)
- Pitch-style layout with slide previews
- Loading animations and progress indicators
- Edit button that redirects to presentation editor
- Professional styling with smooth transitions

### AI Generate API (`app/api/ai-generate/route.js`)
- POST endpoint for AI generation requests
- Uses OpenAI API with environment variable
- Returns structured slides JSON
- Fallback presentation creation if AI fails

### AI Template Mapper (`app/utils/aiTemplateMapper.ts`)
- Converts AI response to editor slide format
- Handles element positioning and styling
- Provides default templates and validation
- TypeScript interfaces for type safety

### AI Templates (`app/data/aiTemplates.json`)
- Pre-built template structures
- Business pitch, educational, and creative templates
- Default settings for fonts, colors, and layouts

## Usage Flow

1. **User clicks "AI Generate" button** on homepage
2. **AIPopup opens** with textarea for description
3. **User enters prompt** and presses Enter
4. **API call** to OpenAI generates presentation structure
5. **Redirect to generate page** showing slide previews
6. **User clicks "Edit"** to open in presentation editor
7. **AI slides load** into editor for customization

## API Response Format

The AI generates presentations in this structure:

```json
{
  "title": "Presentation Title",
  "description": "Brief description",
  "tags": ["tag1", "tag2"],
  "slides": [
    {
      "id": "slide-1",
      "type": "title",
      "title": "Slide Title",
      "content": "Slide content",
      "backgroundColor": "#ffffff",
      "elements": [
        {
          "id": "element-1",
          "type": "text",
          "content": "Text content",
          "x": 960,
          "y": 300,
          "width": 800,
          "height": 120,
          "fontSize": 48,
          "fontFamily": "Inter",
          "fontWeight": "bold",
          "color": "#1f2937",
          "textAlign": "center"
        }
      ]
    }
  ]
}
```

## Customization

### Adding New Templates
1. Edit `app/data/aiTemplates.json`
2. Add new template objects with slides and elements
3. Follow the existing structure for consistency

### Modifying AI Prompts
1. Edit the `enhancedPrompt` in `app/api/ai-generate/route.js`
2. Adjust the JSON structure requirements
3. Update validation logic if needed

### Styling Changes
1. Modify the generate page styles in `app/generate/page.jsx`
2. Update AIPopup component styling in `app/components/AIPopup.jsx`
3. Adjust slide preview layouts and animations

## Error Handling

The system includes comprehensive error handling:
- API key validation
- OpenAI API error handling
- JSON parsing fallbacks
- Default presentation creation
- User-friendly error messages

## Security Notes

- Never commit your `.env.local` file to version control
- The API key is only used server-side
- Consider implementing rate limiting for production use
- Monitor API usage and costs

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Check your `.env.local` file
   - Ensure the variable name is exactly `OPENAI_API_KEY`
   - Restart your development server

2. **"Failed to generate presentation"**
   - Check your OpenAI API key validity
   - Verify you have sufficient API credits
   - Check browser console for detailed errors

3. **AI response parsing errors**
   - The system includes fallback presentation creation
   - Check the AI response format in browser network tab
   - Verify the prompt structure in the API route

### Development Tips

- Use browser developer tools to monitor API calls
- Check the browser console for error messages
- Verify localStorage data flow between pages
- Test with different prompt types and lengths

## Future Enhancements

Potential improvements for the AI system:
- Template selection before generation
- Style preferences and branding options
- Multi-language support
- Advanced slide layouts and animations
- Integration with external design APIs
- Collaborative AI editing features
