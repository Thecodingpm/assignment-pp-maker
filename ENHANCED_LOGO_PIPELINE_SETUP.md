# 🎨 Enhanced AI Logo Pipeline Setup Guide

This guide will help you set up the advanced logo generation pipeline with Stable Diffusion XL + ControlNet + AI Upscaling + Vector Conversion.

## 🚀 Pipeline Overview

1. **Stable Diffusion XL + LoRA** - Generate base logo concepts
2. **ControlNet** - Ensure shape consistency (circles, symmetry, etc.)
3. **AI Upscaling** - Upscale with Real-ESRGAN for high resolution
4. **Vector Conversion** - Convert to SVG with potrace

## 📋 Prerequisites

- Google Colab Pro (recommended for GPU access)
- ngrok account (for API tunneling)
- OpenAI API key (for DALL-E fallback)

## 🔧 Setup Steps

### 1. Environment Variables

Create a `.env.local` file in your project root:

```bash
# Enhanced AI Logo Generation Configuration

# OpenAI API Configuration (for DALL-E fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Enhanced SDXL Colab Inference Server (ngrok URL)
ENHANCED_COLAB_API_URL=https://YOUR_ENHANCED_NGROK_URL_HERE

# Require Enhanced SDXL server (disable mocks, fail if unreachable)
REQUIRE_ENHANCED_SDXL=false

# Original SDXL Configuration (fallback)
COLAB_API_URL=https://YOUR_ORIGINAL_NGROK_URL_HERE
REQUIRE_SDXL=false

# Enhanced Features Configuration
ENABLE_CONTROLNET=true
ENABLE_UPSCALING=true
ENABLE_SVG_CONVERSION=true

# LoRA Configuration (if using custom LoRA)
LORA_ENABLED=true
LORA_NAME=logo_lora
LORA_SCALE=0.8

# Upscaling Configuration
UPSCALE_FACTOR=2
UPSCALE_MODEL=RealESRGAN_x4plus

# Vector Conversion Configuration
VECTOR_CONVERSION_METHOD=potrace
VECTOR_QUALITY=high
```

### 2. Google Colab Setup

1. Open the `enhanced-logo-generator.ipynb` notebook in Google Colab
2. Run all cells to install dependencies and load models
3. Set your ngrok authtoken in the notebook
4. Copy the generated ngrok URL to your `.env.local` file

### 3. API Endpoints

The enhanced system provides these new endpoints:

- **`/api/generate-logo-enhanced`** - Single logo with ControlNet + upscaling
- **`/api/generate-logo-enhanced-variations`** - Multiple shape variations

### 4. Features

#### Shape Control
- **Circle**: Balanced and harmonious
- **Square**: Structured and professional  
- **Hexagon**: Modern and tech-forward
- **Triangle**: Bold and energetic

#### AI Upscaling
- Uses Real-ESRGAN for 2x-4x upscaling
- Maintains quality and sharpness
- Configurable upscale factor

#### Vector Conversion
- Converts raster images to SVG
- Uses potrace for clean vectorization
- Scalable output for any size

## 🎯 Usage

### Basic Usage

```javascript
// Generate single enhanced logo
const response = await fetch('/api/generate-logo-enhanced', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'modern tech startup logo',
    options: {
      style: 'professional',
      color: 'modern',
      industry: 'tech',
      shape: 'circle',
      upscale: true,
      convert_to_svg: false
    }
  })
});
```

### Generate Variations

```javascript
// Generate multiple shape variations
const response = await fetch('/api/generate-logo-enhanced-variations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'creative design agency logo',
    options: {
      style: 'creative',
      color: 'vibrant',
      industry: 'marketing',
      upscale: true,
      convert_to_svg: true
    }
  })
});
```

## 🔄 Pipeline Flow

1. **User Input** → Prompt + Options
2. **Control Image Generation** → Create shape-specific control image
3. **Stable Diffusion XL** → Generate logo with ControlNet guidance
4. **AI Upscaling** → Enhance resolution with Real-ESRGAN
5. **Vector Conversion** → Convert to SVG (optional)
6. **Output** → High-quality, scalable logo

## 🛠️ Troubleshooting

### Common Issues

1. **ControlNet not loading**: Ensure you have enough GPU memory
2. **Upscaling fails**: Check Real-ESRGAN model download
3. **SVG conversion fails**: Install potrace on your system
4. **ngrok connection issues**: Verify your authtoken and URL

### Performance Tips

1. Use Google Colab Pro for better GPU access
2. Enable memory optimizations in the notebook
3. Use smaller batch sizes for variations
4. Cache models when possible

## 📊 Expected Results

- **Quality**: Professional, high-resolution logos
- **Consistency**: Shape-controlled, symmetrical designs
- **Scalability**: Vector output for any size
- **Speed**: ~30-60 seconds per logo (depending on GPU)

## 🔗 Integration

The enhanced pipeline integrates seamlessly with your existing:
- AI Generation Modal
- Logo Editor
- Dashboard
- Template System

## 📈 Next Steps

1. Set up the enhanced Colab notebook
2. Configure your environment variables
3. Test the enhanced API endpoints
4. Integrate with your frontend
5. Fine-tune LoRA models for your specific use case

## 🆘 Support

If you encounter issues:
1. Check the Colab notebook logs
2. Verify your environment variables
3. Test the health endpoint: `GET /health`
4. Check ngrok tunnel status
5. Review the API response errors

