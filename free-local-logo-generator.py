#!/usr/bin/env python3
"""
FREE Local Logo Generator using Hugging Face models
No API costs - runs completely locally!
"""

import os
import base64
import io
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import requests

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model
pipe = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_models():
    """Load the Stable Diffusion model locally"""
    global pipe
    
    try:
        logger.info("🔄 Loading Stable Diffusion model locally...")
        
        # Use a smaller, faster model for local generation
        model_id = "runwayml/stable-diffusion-v1-5"
        
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None,
            requires_safety_checker=False
        )
        
        # Optimize for speed
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
        pipe = pipe.to(device)
        
        # Enable memory optimizations
        if device == "cuda":
            pipe.enable_attention_slicing()
            pipe.enable_vae_slicing()
        
        logger.info(f"✅ Model loaded successfully on {device}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        return False

def create_simple_logo_fallback(prompt, width=512, height=512):
    """Create a simple logo using basic graphics when AI model fails"""
    try:
        # Create a simple geometric logo
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Draw a simple circle with text
        margin = 50
        circle_bbox = [margin, margin, width-margin, height-margin]
        draw.ellipse(circle_bbox, outline='black', width=8)
        
        # Add text in the center
        try:
            # Try to use a system font
            font_size = min(width, height) // 8
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        # Extract key words from prompt
        words = prompt.split()[:2]  # Take first 2 words
        text = ''.join([word[0].upper() for word in words if word.isalpha()])
        if not text:
            text = "LOGO"
        
        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Center the text
        x = (width - text_width) // 2
        y = (height - text_height) // 2
        
        draw.text((x, y), text, fill='black', font=font)
        
        return img
        
    except Exception as e:
        logger.error(f"❌ Error creating fallback logo: {e}")
        return None

def generate_logo_local(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using local Stable Diffusion model"""
    try:
        # Enhanced prompt for better logo quality
        enhanced_prompt = f"logo design, {prompt}, {style} style, {color} colors, {industry} industry"
        
        # Add shape-specific keywords
        shape_keywords = {
            "circle": "circular, round, centered, balanced",
            "square": "square, geometric, structured, clean", 
            "hexagon": "hexagonal, modern, tech, innovative",
            "triangle": "triangular, dynamic, energetic, bold"
        }
        
        enhanced_prompt += f", {shape_keywords.get(shape, '')}"
        enhanced_prompt += ", high quality, professional, vector style, minimalist, clean design, no text, just icon"
        
        # Negative prompt
        negative_prompt = "text, words, letters, blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature"
        
        logger.info(f"🎨 Generating logo locally: {enhanced_prompt}")
        
        if pipe is None:
            logger.warning("⚠️ AI model not loaded, using fallback logo")
            return create_simple_logo_fallback(prompt, width, height)
        
        # Generate image
        with torch.autocast(device):
            result = pipe(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=20,  # Faster for local generation
                guidance_scale=7.5,
                num_images_per_prompt=1
            )
        
        image = result.images[0]
        
        # Resize to exact dimensions
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        
        return image
        
    except Exception as e:
        logger.error(f"❌ Error generating logo locally: {e}")
        return create_simple_logo_fallback(prompt, width, height)

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    try:
        buffer = io.BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        logger.error(f"❌ Error converting image to base64: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Free Local Logo Generator",
        "device": device,
        "model_loaded": pipe is not None
    })

@app.route('/generate-logo', methods=['POST'])
def generate_logo():
    """Generate a single logo"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        logger.info(f"🎨 Received request: {prompt}")
        
        # Generate logo
        image = generate_logo_local(prompt, style, color, industry, shape, width, height)
        
        if image is None:
            return jsonify({"error": "Failed to generate logo"}), 500
        
        # Convert to base64
        image_base64 = image_to_base64(image)
        
        if image_base64 is None:
            return jsonify({"error": "Failed to process image"}), 500
        
        return jsonify({
            "success": True,
            "imageUrl": image_base64,
            "prompt": prompt,
            "model": "stable-diffusion-v1-5-local",
            "device": device
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-logo-variations', methods=['POST'])
def generate_logo_variations():
    """Generate multiple logo variations"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        count = data.get('count', 3)
        
        logger.info(f"🎨 Generating {count} variations for: {prompt}")
        
        variations = []
        
        for i in range(count):
            # Add variation to prompt
            variation_prompt = f"{prompt}, variation {i+1}"
            
            # Generate logo
            image = generate_logo_local(variation_prompt, style, color, industry, shape, width, height)
            
            if image is not None:
                image_base64 = image_to_base64(image)
                if image_base64:
                    variations.append({
                        "imageUrl": image_base64,
                        "prompt": variation_prompt,
                        "variation": i + 1
                    })
        
        return jsonify({
            "success": True,
            "variations": variations,
            "count": len(variations),
            "model": "stable-diffusion-v1-5-local",
            "device": device
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting FREE Local Logo Generator...")
    
    # Load models
    if load_models():
        logger.info("✅ Server ready!")
    else:
        logger.warning("⚠️ Server starting with fallback mode (simple logos only)")
    
    # Start server
    app.run(host='0.0.0.0', port=5001, debug=False)
