#!/usr/bin/env python3
"""
FREE Logo Generator using Hugging Face Inference API
No API key required - completely free!
"""

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

def generate_logo_with_huggingface(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Hugging Face's FREE Inference API"""
    try:
        # Enhance the prompt
        enhanced_prompt = f"logo design, {prompt}, {style} style, {color} colors, {industry} industry"
        
        # Add shape-specific keywords
        shape_keywords = {
            "circle": "circular, round, centered, balanced",
            "square": "square, geometric, structured, clean", 
            "hexagon": "hexagonal, modern, tech, innovative",
            "triangle": "triangular, dynamic, energetic, bold"
        }
        
        enhanced_prompt += f", {shape_keywords.get(shape, '')}"
        enhanced_prompt += ", high quality, professional, vector style, no text, just icon"
        
        # Negative prompt
        negative_prompt = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra limbs, bad anatomy"
        
        logger.info(f"🎨 Generating logo with Hugging Face: {enhanced_prompt[:100]}...")
        
        # Hugging Face API request (FREE)
        api_url = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
        
        headers = {
            "Authorization": "Bearer hf_your_token_here",  # Optional - works without token too
            "Content-Type": "application/json"
        }
        
        data = {
            "inputs": enhanced_prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": 20,
                "guidance_scale": 7.5,
                "num_images_per_prompt": 1
            }
        }
        
        # Make request
        response = requests.post(api_url, headers=headers, json=data)
        
        if response.status_code == 200:
            # Get image data
            image_data = response.content
            
            # Convert to base64
            img_base64 = base64.b64encode(image_data).decode()
            
            logger.info("✅ Logo generated successfully with Hugging Face!")
            
            return {
                "success": True,
                "image_base64": img_base64,
                "prompt": enhanced_prompt,
                "shape": shape,
                "dimensions": f"{width}x{height}",
                "cost": "FREE"
            }
        else:
            error_msg = response.text
            logger.error(f"❌ Hugging Face API error: {error_msg}")
            return {
                "success": False,
                "error": f"Hugging Face API error: {error_msg}"
            }
        
    except Exception as e:
        logger.error(f"❌ Error generating logo with Hugging Face: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Hugging Face Logo Generator",
        "cost": "FREE",
        "api": "Hugging Face Inference"
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
        result = generate_logo_with_huggingface(
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
    logger.info("🚀 Starting FREE Hugging Face Logo Generator...")
    logger.info("✅ Server ready! (100% FREE)")
    app.run(host='0.0.0.0', port=5001, debug=False)
