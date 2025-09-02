# Unsplash API Setup Guide

## Getting Your API Key

1. **Visit Unsplash Developers**: Go to [https://unsplash.com/developers](https://unsplash.com/developers)
2. **Create an Application**: Click "New Application" and fill in the details
3. **Get Your Access Key**: Copy the "Access Key" from your application dashboard

## Environment Configuration

Create a `.env.local` file in your project root and add:

```bash
UNSPLASH_ACCESS_KEY=your_actual_access_key_here
```

## Features

✅ **Real-time Search**: Search for any images on Unsplash  
✅ **Category Quick Access**: Click category buttons for instant results  
✅ **Image Selection**: Click any image to select it for your presentation  
✅ **Proper Attribution**: Automatically includes photographer credits  
✅ **API Compliance**: Triggers proper download tracking as required by Unsplash  

## Usage

1. **Click the Media tool** in your toolbar
2. **Select Unsplash** from the integrations
3. **Search for images** or click category buttons
4. **Click any image** to select it
5. **Image data** will be passed to your presentation editor

## API Limits

- **Demo applications**: 50 requests per hour
- **Production applications**: 5,000 requests per hour
- **Download tracking**: Required for compliance

## Troubleshooting

- **"API key not configured"**: Check your `.env.local` file
- **"Failed to fetch images"**: Check your internet connection
- **No images found**: Try different search terms

## Next Steps

After setting up the API key, you can:
1. **Test the search** with terms like "nature", "technology", "abstract"
2. **Click category buttons** to see instant results
3. **Select images** to see the data in your console
4. **Integrate with your presentation editor** to actually insert images



