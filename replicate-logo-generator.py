#!/usr/bin/env python3
"""
Production Logo Generator using Replicate API
Most reliable and cost-effective solution
"""

import os
import requests
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

# Replicate API configuration
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN', 'your_replicate_token_here')
REPLICATE_API_URL = "https://api.replicate.com/v1/predictions"

def generate_logo_with_replicate(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Replicate's Stable Diffusion"""
    try:
        # Create a very specific, command-following prompt
        enhanced_prompt = f"logo design: {prompt}"
        
        # Add specific requirements based on user input
        if "tech" in prompt.lower() or "startup" in prompt.lower():
            enhanced_prompt += ", technology company logo, modern tech branding"
        if "black" in prompt.lower():
            enhanced_prompt += ", black and white logo, monochrome design"
        if "simple" in prompt.lower():
            enhanced_prompt += ", simple minimalist design, clean lines"
        if "modern" in prompt.lower():
            enhanced_prompt += ", contemporary design, sleek appearance"
        
        # Shape-specific requirements
        if shape == "circle":
            enhanced_prompt += ", circular logo, round design, centered composition"
        elif shape == "square":
            enhanced_prompt += ", square logo, geometric design, structured layout"
        elif shape == "hexagon":
            enhanced_prompt += ", hexagonal logo, modern geometric shape"
        elif shape == "triangle":
            enhanced_prompt += ", triangular logo, dynamic angular design"
        
        # Style requirements
        if style == "professional":
            enhanced_prompt += ", corporate style, business professional, clean and sophisticated"
        elif style == "modern":
            enhanced_prompt += ", contemporary style, sleek and trendy, minimalist approach"
        elif style == "creative":
            enhanced_prompt += ", artistic style, unique and creative, expressive design"
        elif style == "tech":
            enhanced_prompt += ", technology style, digital and futuristic, innovative design"
        
        # Color requirements
        if color == "blue":
            enhanced_prompt += ", blue color scheme, professional blue tones"
        elif color == "black":
            enhanced_prompt += ", black and white, monochrome design"
        elif color == "colorful":
            enhanced_prompt += ", vibrant colors, colorful design"
        elif color == "modern":
            enhanced_prompt += ", modern color palette, contemporary colors"
        
        # Final requirements
        enhanced_prompt += ", high quality logo, vector style, no text, just icon, professional branding, clean design, scalable, memorable, simple, effective"
        
        # Very specific negative prompt to avoid bad results
        negative_prompt = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra elements, complex, cluttered, busy, amateur, unprofessional, cartoon, childish, pixelated, artifacts, noise, bad composition, ugly, poorly designed, random, abstract, unclear, messy, disorganized, multiple objects, background, scenery, landscape, people, faces, animals, food, buildings, cars, random shapes, scribbles, doodles"
        
        logger.info(f"🎨 Generating logo with Replicate: {enhanced_prompt[:100]}...")
        
        # Replicate API request
        headers = {
            "Authorization": f"Token {REPLICATE_API_TOKEN}",
            "Content-Type": "application/json"
        }
        
        data = {
            "version": "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",  # Working SDXL model
            "input": {
                "prompt": enhanced_prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": 50,  # More steps for better quality
                "guidance_scale": 12.0,  # Much higher guidance for better adherence
                "num_outputs": 1
            }
        }
        
        # Create prediction
        response = requests.post(REPLICATE_API_URL, headers=headers, json=data)
        response.raise_for_status()
        
        prediction = response.json()
        prediction_id = prediction['id']
        
        logger.info(f"🔄 Prediction created: {prediction_id}")
        
        # Poll for completion
        import time
        max_attempts = 30  # 5 minutes max
        for attempt in range(max_attempts):
            time.sleep(10)  # Wait 10 seconds
            
            status_response = requests.get(f"{REPLICATE_API_URL}/{prediction_id}", headers=headers)
            status_response.raise_for_status()
            
            status_data = status_response.json()
            status = status_data['status']
            
            if status == 'succeeded':
                image_url = status_data['output'][0]
                logger.info("✅ Logo generated successfully with Replicate!")
                
                # Download and convert to base64
                img_response = requests.get(image_url)
                img_response.raise_for_status()
                
                return {
                    "success": True,
                    "image_url": image_url,
                    "image_base64": base64.b64encode(img_response.content).decode(),
                    "prompt": enhanced_prompt,
                    "shape": shape,
                    "dimensions": f"{width}x{height}",
                    "cost": "$0.01"  # Approximate cost
                }
            elif status == 'failed':
                error = status_data.get('error', 'Unknown error')
                logger.error(f"❌ Replicate generation failed: {error}")
                return {
                    "success": False,
                    "error": f"Replicate generation failed: {error}"
                }
            else:
                logger.info(f"⏳ Status: {status}, attempt {attempt + 1}/{max_attempts}")
        
        # Timeout
        logger.error("❌ Replicate generation timed out")
        return {
            "success": False,
            "error": "Generation timed out after 5 minutes"
        }
        
    except Exception as e:
        logger.error(f"❌ Error generating logo with Replicate: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Replicate Logo Generator",
        "api_configured": bool(REPLICATE_API_TOKEN and REPLICATE_API_TOKEN != 'your_replicate_token_here')
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
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        logger.info(f"🎨 Received request: {prompt}")
        
        # Generate logo
        result = generate_logo_with_replicate(
            prompt=prompt,
            style=style,
            color=color,
            industry=industry,
            shape=shape,
            width=width,
            height=height
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "imageUrl": f"data:image/png;base64,{result['image_base64']}",
                "prompt": result['prompt'],
                "shape": result['shape'],
                "dimensions": result['dimensions'],
                "cost": result['cost']
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
    logger.info("🚀 Starting Replicate Logo Generator...")
    logger.info("✅ Server ready!")
    app.run(host='0.0.0.0', port=5001, debug=False)
