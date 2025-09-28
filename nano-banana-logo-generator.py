#!/usr/bin/env python3
"""
Nano Banana API Logo Generator
High-quality AI logo generation using Nano Banana's cloud infrastructure
"""

import os
import base64
import io
import logging
import requests
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Nano Banana API Configuration
NANO_BANANA_API_KEY = os.getenv("NANO_BANANA_API_KEY")
NANO_BANANA_MODEL_ID = os.getenv("NANO_BANANA_MODEL_ID", "stabilityai/stable-diffusion-xl-base-1.0")
NANO_BANANA_API_URL = "https://api.nanobanana.ai/v1/predictions"

def generate_logo_with_nano_banana(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Nano Banana API"""
    try:
        if not NANO_BANANA_API_KEY:
            logger.error("❌ NANO_BANANA_API_KEY not set")
            return None
            
        # Enhanced prompt for better logo generation
        enhanced_prompt = f"logo design for {prompt}, {style} style, {color} colors, {industry} industry, {shape} shape, clean vector design, professional, high quality, no text, just icon/symbol"
        
        # Negative prompt to avoid unwanted elements
        negative_prompt = "text, words, letters, typography, watermark, signature, low quality, blurry, distorted, amateur"
        
        # Prepare the request payload
        payload = {
            "model": NANO_BANANA_MODEL_ID,
            "input": {
                "prompt": enhanced_prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "num_outputs": 1
            }
        }
        
        headers = {
            "Authorization": f"Bearer {NANO_BANANA_API_KEY}",
            "Content-Type": "application/json"
        }
        
        logger.info(f"🎨 Generating logo with Nano Banana: {enhanced_prompt}")
        
        # Make the API request
        response = requests.post(NANO_BANANA_API_URL, headers=headers, json=payload, timeout=60)
        
        if response.status_code != 200:
            logger.error(f"❌ Nano Banana API error: {response.status_code} - {response.text}")
            return None
            
        result = response.json()
        
        # Check if prediction was created successfully
        if "id" not in result:
            logger.error(f"❌ No prediction ID in response: {result}")
            return None
            
        prediction_id = result["id"]
        logger.info(f"🔄 Prediction created with ID: {prediction_id}")
        
        # Poll for completion
        max_attempts = 30  # 5 minutes max
        for attempt in range(max_attempts):
            time.sleep(10)  # Wait 10 seconds between checks
            
            status_response = requests.get(f"{NANO_BANANA_API_URL}/{prediction_id}", headers=headers)
            
            if status_response.status_code != 200:
                logger.error(f"❌ Status check error: {status_response.status_code}")
                continue
                
            status_result = status_response.json()
            status = status_result.get("status")
            
            if status == "succeeded":
                # Get the generated image
                outputs = status_result.get("output", [])
                if not outputs:
                    logger.error("❌ No outputs in successful prediction")
                    return None
                    
                # Download the image
                image_url = outputs[0]
                image_response = requests.get(image_url)
                
                if image_response.status_code != 200:
                    logger.error(f"❌ Failed to download image: {image_response.status_code}")
                    return None
                    
                # Convert to PIL Image
                image = Image.open(io.BytesIO(image_response.content))
                
                # Convert to base64
                buffered = io.BytesIO()
                image.save(buffered, format="PNG")
                img_base64 = base64.b64encode(buffered.getvalue()).decode()
                
                logger.info("✅ Logo generated successfully with Nano Banana")
                return f"data:image/png;base64,{img_base64}"
                
            elif status == "failed":
                error = status_result.get("error", "Unknown error")
                logger.error(f"❌ Prediction failed: {error}")
                return None
                
            else:
                logger.info(f"⏳ Status: {status}, attempt {attempt + 1}/{max_attempts}")
                
        logger.error("❌ Prediction timed out")
        return None
        
    except Exception as e:
        logger.error(f"❌ Error generating logo with Nano Banana: {e}")
        return None

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    try:
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_base64}"
    except Exception as e:
        logger.error(f"❌ Error converting image to base64: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Nano Banana Logo Generator",
        "api_configured": bool(NANO_BANANA_API_KEY),
        "model": NANO_BANANA_MODEL_ID,
        "cost": "Paid service - check Nano Banana pricing"
    })

@app.route('/generate-logo', methods=['POST'])
def generate_logo():
    """Generate a single logo using Nano Banana API"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        logger.info(f"🎨 Generating Nano Banana logo: {prompt}")
        
        # Generate logo using Nano Banana API
        image_base64 = generate_logo_with_nano_banana(prompt, style, color, industry, shape, width, height)
        
        if image_base64 is None:
            return jsonify({"error": "Failed to generate logo with Nano Banana API"}), 500
        
        return jsonify({
            "success": True,
            "imageUrl": image_base64,
            "prompt": prompt,
            "model": NANO_BANANA_MODEL_ID,
            "service": "Nano Banana API",
            "cost": "Paid service"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-logo-variations', methods=['POST'])
def generate_logo_variations():
    """Generate multiple logo variations using Nano Banana API"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        num_variations = data.get('num_variations', 4)
        
        logger.info(f"🎨 Generating {num_variations} Nano Banana logo variations: {prompt}")
        
        variations = []
        
        # Generate multiple variations
        for i in range(num_variations):
            # Add variation to prompt
            variation_prompt = f"{prompt}, variation {i+1}, unique design"
            
            image_base64 = generate_logo_with_nano_banana(
                variation_prompt, style, color, industry, shape, width, height
            )
            
            if image_base64:
                variations.append({
                    "id": i + 1,
                    "imageUrl": image_base64,
                    "prompt": variation_prompt,
                    "style": style,
                    "model": NANO_BANANA_MODEL_ID
                })
        
        if not variations:
            return jsonify({"error": "Failed to generate any logo variations"}), 500
        
        return jsonify({
            "success": True,
            "logos": variations,
            "totalGenerated": len(variations),
            "service": "Nano Banana API"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not NANO_BANANA_API_KEY:
        logger.error("❌ Please set NANO_BANANA_API_KEY environment variable")
        exit(1)
        
    logger.info("🚀 Starting Nano Banana Logo Generator...")
    logger.info(f"🔑 API Key configured: {NANO_BANANA_API_KEY[:10]}...")
    logger.info(f"🤖 Model: {NANO_BANANA_MODEL_ID}")
    logger.info("💰 This is a paid service - check Nano Banana pricing")
    
    app.run(host='0.0.0.0', port=5002, debug=True)


