# Google Nano Banana Setup Guide

## 🍌 What is Google Nano Banana?

**Google Nano Banana** is Google's **FREE** AI model that's part of the Gemini platform. It's designed for:
- **Image generation and editing**
- **Natural language processing**
- **Running locally or in the cloud**
- **Completely FREE to use**

## 🚀 Quick Setup

### 1. **Get Your FREE Google API Key**

1. **Visit**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Sign in** with your Google account
3. **Create API Key**: Click "Create API Key"
4. **Copy the key** (starts with `AIza...`)

### 2. **Run Setup Script**

```bash
./setup-google-nano-banana.sh
```

### 3. **Edit Your API Key**

Open `.env.local` and replace `your_google_api_key_here` with your actual key:

```bash
GOOGLE_API_KEY=AIzaSyCbAVf7KAgBWI7G2iaC5djloq63HrAuwG0
```

### 4. **Install Dependencies**

```bash
pip install requests pillow flask flask-cors
```

### 5. **Start the Service**

```bash
python3 google-nano-banana-logo-generator.py
```

This runs on port 5003.

### 6. **Start Your App**

```bash
npm run dev
```

## 🎨 How It Works

### **AI-Powered Logo Generation**
1. **User enters prompt**: "Modern tech startup logo"
2. **Google Gemini analyzes**: The prompt and generates a detailed description
3. **System creates logo**: Based on the AI description using advanced graphics
4. **Returns high-quality logo**: Professional vector-style design

### **Features**
- ✅ **Completely FREE** - No costs, no limits
- ✅ **High-quality generation** - Professional logos
- ✅ **Multiple styles** - Professional, modern, creative, minimalist
- ✅ **Industry-specific** - Tech, finance, healthcare, etc.
- ✅ **Multiple variations** - Generate several options
- ✅ **Fast processing** - Quick generation times

## 🔧 API Endpoints

### **Health Check**
```
GET http://localhost:5003/health
```

### **Generate Single Logo**
```
POST http://localhost:5003/generate-logo
```

### **Generate Variations**
```
POST http://localhost:5003/generate-logo-variations
```

## 📝 Example Usage

### **JavaScript/TypeScript**
```javascript
const response = await fetch('/api/generate-logo-google-nano', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'modern tech startup logo',
    options: {
      style: 'professional',
      color: 'modern',
      industry: 'tech',
      shape: 'circle'
    }
  })
});

const data = await response.json();
console.log('Generated logo:', data.imageUrl);
```

### **cURL**
```bash
curl -X POST http://localhost:5003/generate-logo \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "modern tech startup logo",
    "style": "professional",
    "color": "modern",
    "industry": "tech",
    "shape": "circle"
  }'
```

## 🎯 Available Options

### **Styles**
- `professional` - Clean, corporate, business-like
- `modern` - Contemporary, trendy, fresh
- `creative` - Artistic, unique, innovative
- `minimalist` - Simple, clean, essential elements

### **Colors**
- `modern` - Contemporary color palette
- `vibrant` - Bright, energetic colors
- `monochrome` - Black and white
- `pastel` - Soft, muted colors

### **Industries**
- `tech` - Technology, innovation
- `finance` - Banking, investment
- `healthcare` - Medical, wellness
- `education` - Learning, knowledge
- `general` - Universal appeal

### **Shapes**
- `circle` - Round, friendly
- `square` - Professional, stable
- `triangle` - Dynamic, energetic

## 🔄 Integration with Your System

The Google Nano Banana integration works with your existing AI services:

1. **Primary**: Google Nano Banana (port 5003) - **FREE**
2. **Secondary**: FREE Local AI Server (port 5001)
3. **Fallback**: Google Colab SDXL
4. **Emergency**: Mock generation

## 📊 Comparison with Other Services

| Service | Cost | Quality | Speed | Setup |
|---------|------|---------|-------|-------|
| **Google Nano Banana** | **FREE** | **High** | **Fast** | **Easy** |
| Local AI Server | FREE | High | Medium | Complex |
| Replicate API | Paid | High | Fast | Easy |
| Google Colab | FREE | High | Slow | Medium |

## 🛠️ Troubleshooting

### **API Key Issues**
- Make sure your Google API key is correct
- Check if you have enabled the Gemini API
- Verify the key is active in Google AI Studio

### **Connection Issues**
- Ensure the Google Nano Banana service is running on port 5003
- Check your internet connection
- Verify the API URL is correct

### **Generation Issues**
- Try a simpler prompt
- Check your API quota (though it's very generous)
- Verify the model is accessible

## 📈 Benefits of Google Nano Banana

1. **Cost-Effective**: Completely free
2. **High Quality**: Professional-grade results
3. **Easy Setup**: Simple configuration
4. **Reliable**: Google's infrastructure
5. **Scalable**: Handles high volume
6. **Fast**: Quick generation times

## 🎨 Example Prompts

- "Modern tech startup logo with geometric shapes"
- "Minimalist coffee shop logo with warm colors"
- "Creative design agency logo with bold typography"
- "Healthcare company logo with trust and care elements"
- "Fintech company logo with security and innovation"

## 🚀 Getting Started

1. **Get API Key**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. **Run Setup**: `./setup-google-nano-banana.sh`
3. **Add Your Key**: Edit `.env.local`
4. **Install Dependencies**: `pip install requests pillow flask flask-cors`
5. **Start Service**: `python3 google-nano-banana-logo-generator.py`
6. **Start App**: `npm run dev`

## 💡 Tips for Best Results

1. **Be specific**: Include style, color, and industry
2. **Use variations**: Generate multiple options
3. **Test different styles**: Try professional, creative, minimalist
4. **Keep it simple**: Avoid overly complex designs
5. **Consider your brand**: Match the logo to your brand personality

## 🆘 Support

- **Google AI Studio**: [https://aistudio.google.com](https://aistudio.google.com)
- **Gemini Documentation**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **Community**: [https://discord.gg/google-ai](https://discord.gg/google-ai)

---

**🎉 You're all set! Google Nano Banana is completely FREE and ready to generate professional logos for your application.**


