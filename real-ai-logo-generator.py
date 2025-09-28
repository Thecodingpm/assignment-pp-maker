#!/usr/bin/env python3
"""
REAL AI Logo Generator using Stable Diffusion on your PC
High-quality AI generation running locally!
"""

import os
import base64
import io
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import torch
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler, ControlNetModel, StableDiffusionXLControlNetPipeline
from controlnet_aux import CannyDetector
import cv2
import numpy as np
import random

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for models
pipe = None
controlnet = None
canny_detector = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def load_models():
    """Load Stable Diffusion models locally"""
    global pipe, controlnet, canny_detector
    
    try:
        logger.info("🔄 Loading REAL AI models on your PC...")
        
        # Use SDXL for better quality
        model_id = "stabilityai/stable-diffusion-xl-base-1.0"
        
        # Load ControlNet for shape consistency
        controlnet = ControlNetModel.from_pretrained(
            "diffusers/controlnet-canny-sdxl-1.0",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32
        )
        
        # Load main pipeline
        pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
            model_id,
            controlnet=controlnet,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            use_safetensors=True,
            variant="fp16" if device == "cuda" else None
        )
        
        # Optimize for your PC
        pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
        pipe = pipe.to(device)
        
        # Enable memory optimizations for better performance
        if device == "cuda":
            pipe.enable_attention_slicing()
            pipe.enable_vae_slicing()
            pipe.enable_vae_tiling()
            pipe.enable_model_cpu_offload()
        else:
            # CPU optimizations
            pipe.enable_attention_slicing()
            pipe.enable_vae_slicing()
        
        # Load Canny detector for shape control
        canny_detector = CannyDetector()
        
        logger.info(f"✅ REAL AI models loaded successfully on {device}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error loading AI models: {e}")
        return False

def create_control_image(shape="circle", width=512, height=512):
    """Create control image for shape consistency"""
    try:
        # Create a simple control image
        control_image = np.zeros((height, width), dtype=np.uint8)
        
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 3
        
        if shape == "circle":
            cv2.circle(control_image, (center_x, center_y), size, 255, 3)
        elif shape == "square":
            cv2.rectangle(control_image, 
                         (center_x - size, center_y - size), 
                         (center_x + size, center_y + size), 255, 3)
        elif shape == "triangle":
            points = np.array([
                [center_x, center_y - size],
                [center_x - size, center_y + size],
                [center_x + size, center_y + size]
            ], np.int32)
            cv2.polylines(control_image, [points], True, 255, 3)
        elif shape == "hexagon":
            points = []
            for i in range(6):
                angle = np.pi / 3 * i
                x = int(center_x + size * np.cos(angle))
                y = int(center_y + size * np.sin(angle))
                points.append([x, y])
            points = np.array(points, np.int32)
            cv2.polylines(control_image, [points], True, 255, 3)
        
        return control_image
        
    except Exception as e:
        logger.error(f"❌ Error creating control image: {e}")
        return None

def enhance_prompt_for_logos(prompt, style="professional", color="modern", industry="general", shape="circle"):
    """Create highly optimized prompts for logo generation"""
    try:
        # Base logo prompt
        base_prompt = f"logo design, {prompt}"
        
        # Style enhancements
        style_enhancements = {
            "professional": "corporate, clean, sophisticated, elegant, refined, business",
            "modern": "contemporary, sleek, minimalist, trendy, innovative, futuristic",
            "creative": "artistic, unique, creative, expressive, original, bold",
            "tech": "digital, futuristic, tech, innovative, cutting-edge, cyber",
            "vintage": "retro, classic, timeless, traditional, nostalgic, aged"
        }
        
        # Color enhancements
        color_enhancements = {
            "modern": "vibrant colors, contemporary palette, fresh, current",
            "vibrant": "bright, energetic, eye-catching colors, bold, dynamic",
            "monochrome": "black and white, grayscale, classic, timeless, elegant",
            "pastel": "soft, muted, gentle colors, subtle, refined, delicate",
            "blue": "blue color scheme, professional blue, corporate blue",
            "black": "black and white, monochrome, elegant, sophisticated"
        }
        
        # Industry enhancements
        industry_enhancements = {
            "general": "versatile, adaptable, universal appeal, professional",
            "tech": "futuristic, digital, innovative, tech-forward, cutting-edge, cyber",
            "finance": "trustworthy, stable, professional, reliable, secure, corporate",
            "education": "friendly, approachable, knowledge-focused, inspiring, academic",
            "healthcare": "caring, trustworthy, medical, healing, professional, clean",
            "food": "appetizing, warm, inviting, fresh, organic, natural",
            "fashion": "stylish, trendy, elegant, sophisticated, chic, modern"
        }
        
        # Shape enhancements
        shape_enhancements = {
            "circle": "circular, round, centered, balanced, harmonious, complete",
            "square": "square, geometric, structured, clean, stable, solid",
            "hexagon": "hexagonal, modern, tech, innovative, geometric, futuristic",
            "triangle": "triangular, dynamic, energetic, bold, directional, strong"
        }
        
        # Build enhanced prompt
        enhanced_prompt = base_prompt
        enhanced_prompt += f", {style_enhancements.get(style, 'professional')}"
        enhanced_prompt += f", {color_enhancements.get(color, 'modern')}"
        enhanced_prompt += f", {industry_enhancements.get(industry, 'general')}"
        enhanced_prompt += f", {shape_enhancements.get(shape, 'circular')}"
        
        # Add quality keywords
        enhanced_prompt += ", high quality, professional logo, vector art, clean design, scalable, iconic, memorable, brand identity, no text, just icon, minimalist, modern logo design"
        
        # Negative prompt
        negative_prompt = "text, words, letters, blurry, low quality, distorted, ugly, bad anatomy, extra limbs, watermark, signature, complex background, cluttered, messy, amateur, unprofessional, cartoon, childish, low resolution, pixelated, noise, artifacts"
        
        return enhanced_prompt, negative_prompt
        
    except Exception as e:
        logger.error(f"❌ Error enhancing prompt: {e}")
        return prompt, "low quality, blurry, distorted"

def generate_logo_with_ai(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using REAL AI (Stable Diffusion)"""
    try:
        # Enhance prompt
        enhanced_prompt, negative_prompt = enhance_prompt_for_logos(prompt, style, color, industry, shape)
        
        logger.info(f"🎨 Generating REAL AI logo: {enhanced_prompt}")
        
        if pipe is None:
            logger.error("❌ AI models not loaded")
            return None
        
        # Create control image for shape consistency
        control_image = create_control_image(shape, width, height)
        if control_image is None:
            logger.warning("⚠️ Could not create control image, using basic generation")
            # Fallback to basic generation
            result = pipe(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                width=width,
                height=height,
                num_inference_steps=30,
                guidance_scale=8.0,
                num_images_per_prompt=1
            )
        else:
            # Use ControlNet for better shape control
            result = pipe(
                prompt=enhanced_prompt,
                negative_prompt=negative_prompt,
                image=control_image,
                controlnet_conditioning_scale=0.8,
                width=width,
                height=height,
                num_inference_steps=30,
                guidance_scale=8.0,
                num_images_per_prompt=1
            )
        
        image = result.images[0]
        
        # Resize to exact dimensions
        image = image.resize((width, height), Image.Resampling.LANCZOS)
        
        return image
        
    except Exception as e:
        logger.error(f"❌ Error generating AI logo: {e}")
        return None

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
        "service": "REAL AI Logo Generator",
        "description": "High-quality AI logo generation using Stable Diffusion XL + ControlNet",
        "device": device,
        "model_loaded": pipe is not None,
        "cost": "FREE - Running on your PC!"
    })

@app.route('/generate-logo', methods=['POST'])
def generate_logo():
    """Generate a single logo using REAL AI"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        logger.info(f"🎨 Generating REAL AI logo: {prompt}")
        
        # Generate logo using AI
        image = generate_logo_with_ai(prompt, style, color, industry, shape, width, height)
        
        if image is None:
            return jsonify({"error": "Failed to generate AI logo"}), 500
        
        # Convert to base64
        image_base64 = image_to_base64(image)
        
        if image_base64 is None:
            return jsonify({"error": "Failed to process image"}), 500
        
        return jsonify({
            "success": True,
            "imageUrl": image_base64,
            "prompt": prompt,
            "model": "stable-diffusion-xl-controlnet",
            "device": device,
            "cost": "FREE - Running on your PC!"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-logo-variations', methods=['POST'])
def generate_logo_variations():
    """Generate multiple logo variations using REAL AI"""
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
        
        logger.info(f"🎨 Generating {count} REAL AI variations for: {prompt}")
        
        variations = []
        
        for i in range(count):
            # Add variation to prompt
            variation_prompt = f"{prompt}, variation {i+1}, unique design"
            
            # Generate logo using AI
            image = generate_logo_with_ai(variation_prompt, style, color, industry, shape, width, height)
            
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
            "model": "stable-diffusion-xl-controlnet",
            "device": device,
            "cost": "FREE - Running on your PC!"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting REAL AI Logo Generator...")
    logger.info("🧠 Using Stable Diffusion XL + ControlNet")
    logger.info("💰 Cost: $0.00 - Running on YOUR PC!")
    
    # Load AI models
    if load_models():
        logger.info("✅ REAL AI models loaded successfully!")
    else:
        logger.warning("⚠️ Failed to load AI models, server will start with limited functionality")
    
    # Start server
    app.run(host='0.0.0.0', port=5001, debug=False)
