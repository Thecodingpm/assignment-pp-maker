# Nano Banana API Setup Guide

## 🍌 What is Nano Banana?

Nano Banana is a cloud platform that provides access to various AI models, including Stable Diffusion XL for high-quality image generation. It's perfect for generating professional logos with advanced AI capabilities.

## 🚀 Quick Setup

### 1. **Get Your API Key**

1. **Visit**: [https://nanobanana.ai](https://nanobanana.ai)
2. **Sign Up**: Create a free account
3. **Get API Key**: 
   - Go to your dashboard
   - Navigate to "API Keys" section
   - Create a new API key
   - Copy the key (starts with `banana_`)

### 2. **Configure Environment**

Run the setup script:
```bash
./setup-nano-banana.sh
```

Or manually add to your `.env.local`:
```bash
# Nano Banana API Configuration
NANO_BANANA_API_KEY=your_actual_api_key_here
NANO_BANANA_MODEL_ID=stabilityai/stable-diffusion-xl-base-1.0
NANO_BANANA_API_URL=http://localhost:5002
```

### 3. **Install Dependencies**

```bash
pip install requests pillow flask flask-cors
```

### 4. **Start the Nano Banana Logo Generator**

```bash
python3 nano-banana-logo-generator.py
```

This will start the service on port 5002.

### 5. **Start Your Next.js App**

```bash
npm run dev
```

## 🎨 How to Use

### **Option 1: Direct API Call**
```javascript
const response = await fetch('/api/generate-logo-nano-banana', {
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
```

### **Option 2: Through Dashboard**
1. Go to your dashboard
2. Click "AI Generate" button
3. Select "Logo" type
4. Enter your prompt
5. The system will automatically use Nano Banana if available

## 💰 Pricing

Nano Banana offers:
- **Free tier**: Limited requests per month
- **Pay-as-you-go**: Pay only for what you use
- **Subscription plans**: For high-volume usage

Check current pricing at: [https://nanobanana.ai/pricing](https://nanobanana.ai/pricing)

## 🔧 Available Models

- **Stable Diffusion XL** (recommended for logos)
- **Stable Diffusion 1.5**
- **Custom fine-tuned models**

## ✨ Features

- **High-quality generation**: Professional-grade logos
- **Multiple variations**: Generate several options at once
- **Customizable parameters**: Style, color, industry, shape
- **Fast generation**: Cloud-based processing
- **Reliable service**: 99.9% uptime

## 🛠️ Troubleshooting

### **API Key Issues**
- Make sure your API key is correct
- Check if you have sufficient credits
- Verify the key is active in your dashboard

### **Connection Issues**
- Ensure the Nano Banana logo generator is running on port 5002
- Check your internet connection
- Verify the API URL is correct

### **Generation Failures**
- Try a simpler prompt
- Check your account credits
- Verify the model ID is correct

## 📊 API Endpoints

### **Health Check**
```
GET http://localhost:5002/health
```

### **Generate Single Logo**
```
POST http://localhost:5002/generate-logo
```

### **Generate Variations**
```
POST http://localhost:5002/generate-logo-variations
```

## 🔄 Integration with Existing System

The Nano Banana integration works alongside your existing AI services:

1. **Primary**: FREE Local AI Server (port 5001)
2. **Secondary**: Nano Banana API (port 5002)
3. **Fallback**: Google Colab SDXL
4. **Emergency**: Mock generation

The system automatically chooses the best available service.

## 📝 Example Prompts

- "Modern tech startup logo with geometric shapes"
- "Minimalist coffee shop logo with warm colors"
- "Creative design agency logo with bold typography"
- "Healthcare company logo with trust and care elements"
- "Fintech company logo with security and innovation"

## 🎯 Best Practices

1. **Be specific**: Include style, color, and industry in your prompt
2. **Use variations**: Generate multiple options to choose from
3. **Test different styles**: Try professional, creative, minimalist
4. **Consider your brand**: Match the logo to your brand personality
5. **Keep it simple**: Avoid overly complex designs

## 🆘 Support

- **Nano Banana Docs**: [https://docs.nanobanana.ai](https://docs.nanobanana.ai)
- **Community**: [https://discord.gg/nanobanana](https://discord.gg/nanobanana)
- **Email**: support@nanobanana.ai


