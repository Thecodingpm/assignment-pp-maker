#!/usr/bin/env python3
"""
Production-Ready Logo Generator
Uses local Stable Diffusion for reliable logo generation
"""

import os
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image, ImageDraw
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables
pipe = None
device = None

def load_model():
    """Load Stable Diffusion model"""
    global pipe, device
    
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Loading model on {device}")
        
        # Use smaller, faster model for production
        model_id = "runwayml/stable-diffusion-v1-5"
        
        pipe = StableDiffusionPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            use_safetensors=True
        )
        
        pipe = pipe.to(device)
        
        # Optimize for speed
        if device == "cuda":
            pipe.enable_attention_slicing(1)
            pipe.enable_vae_slicing()
        
        logger.info("✅ Model loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False

def create_logo_control_image(shape, width=256, height=256):
    """Create control image for different shapes"""
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    center_x, center_y = width // 2, height // 2
    size = min(width, height) // 3
    
    if shape == "circle":
        draw.ellipse([center_x - size, center_y - size, center_x + size, center_y + size], 
                    outline='black', width=3)
    elif shape == "square":
        draw.rectangle([center_x - size, center_y - size, center_x + size, center_y + size], 
                      outline='black', width=3)
    elif shape == "hexagon":
        import math
        points = []
        for i in range(6):
            angle = math.pi / 3 * i
            x = center_x + size * math.cos(angle)
            y = center_y + size * math.sin(angle)
            points.append((x, y))
        draw.polygon(points, outline='black', width=3)
    elif shape == "triangle":
        points = [(center_x, center_y - size), 
                 (center_x - size, center_y + size), 
                 (center_x + size, center_y + size)]
        draw.polygon(points, outline='black', width=3)
    
    return img

def enhance_logo_prompt(prompt, style="professional", color="modern", industry="general", shape="circle"):
    """Enhance the prompt with logo-specific keywords"""
    enhanced = f"logo design, {prompt}, {style} style, {color} colors, {industry} industry"
    
    shape_keywords = {
        "circle": "circular, round, centered, balanced",
        "square": "square, geometric, structured, clean",
        "hexagon": "hexagonal, modern, tech, innovative",
        "triangle": "triangular, dynamic, energetic, bold"
    }
    
    enhanced += f", {shape_keywords.get(shape, '')}"
    
    negative = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra limbs, bad anatomy"
    
    return enhanced, negative

def generate_logo(prompt, style="professional", color="modern", industry="general", shape="circle", width=256, height=256):
    """Generate logo using Stable Diffusion"""
    try:
        if pipe is None:
            return {"success": False, "error": "Model not loaded"}
        
        # Enhance the prompt
        enhanced_prompt, negative_prompt = enhance_logo_prompt(prompt, style, color, industry, shape)
        
        logger.info(f"🎨 Generating logo: {enhanced_prompt[:100]}...")
        
        # Generate image
        with torch.autocast(device):
            image = pipe(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=20,  # Faster than 50
                guidance_scale=7.5,
                num_images_per_prompt=1
            ).images[0]
        
        logger.info("✅ Logo generated successfully")
        
        return {
            "success": True,
            "image": image,
            "prompt": enhanced_prompt,
            "shape": shape,
            "dimensions": f"{width}x{height}"
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating logo: {e}")
        return {
            "success": False,
            "error": str(e)
        }

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Production Logo Generator",
        "device": device,
        "model_loaded": pipe is not None
    })

@app.route('/generate-logo', methods=['POST'])
def generate_logo_api():
    try:
        data = request.get_json()
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 256)
        height = data.get('height', 256)
        
        logger.info(f"🎨 Received request: {prompt}")
        
        # Generate logo
        result = generate_logo(
            prompt=prompt,
            style=style,
            color=color,
            industry=industry,
            shape=shape,
            width=width,
            height=height
        )
        
        if result['success']:
            image = result['image']
            
            # Convert to base64
            buffered = BytesIO()
            image.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return jsonify({
                "success": True,
                "imageUrl": f"data:image/png;base64,{img_str}",
                "prompt": result['prompt'],
                "shape": result['shape'],
                "dimensions": result['dimensions']
            })
        else:
            return jsonify({
                "success": False,
                "error": result['error']
            }), 500
            
    except Exception as e:
        logger.error(f"❌ API Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Production Logo Generator...")
    
    # Load model
    if load_model():
        logger.info("✅ Server ready!")
        app.run(host='0.0.0.0', port=5001, debug=False)
    else:
        logger.error("❌ Failed to start server - model loading failed")
