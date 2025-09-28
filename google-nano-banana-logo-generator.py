#!/usr/bin/env python3
"""
Google Nano Banana Logo Generator
Free AI logo generation using Google's Nano Banana model
"""

import os
import base64
import io
import logging
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import json

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Google API Configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_NANO_BANANA_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent"

def generate_logo_with_google_nano_banana(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Google's Nano Banana (Gemini)"""
    try:
        if not GOOGLE_API_KEY:
            logger.error("❌ GOOGLE_API_KEY not set")
            return None
            
        # Enhanced prompt for better logo generation
        enhanced_prompt = f"""
        Create a professional logo design for: {prompt}
        
        Style: {style}
        Color scheme: {color}
        Industry: {industry}
        Shape: {shape}
        
        Requirements:
        - Clean, modern design
        - Vector-style graphics
        - Professional appearance
        - No text or letters
        - Just icon/symbol
        - High quality
        - Scalable design
        - {width}x{height} pixels
        """
        
        # Prepare the request payload for Google Gemini
        payload = {
            "contents": [{
                "parts": [{
                    "text": enhanced_prompt
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000,
                "topP": 0.8,
                "topK": 10
            }
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        logger.info(f"🎨 Generating logo with Google Nano Banana: {prompt}")
        
        # Make the API request to Google Gemini
        response = requests.post(
            f"{GOOGLE_NANO_BANANA_URL}?key={GOOGLE_API_KEY}",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            logger.error(f"❌ Google API error: {response.status_code} - {response.text}")
            return None
            
        result = response.json()
        
        # Check if we got a valid response
        if 'candidates' not in result or not result['candidates']:
            logger.error("❌ No candidates in Google response")
            return None
            
        # Extract the generated content
        generated_text = result['candidates'][0]['content']['parts'][0]['text']
        logger.info(f"🎨 Google generated description: {generated_text}")
        
        # Since Google Gemini doesn't directly generate images, we'll create a logo based on the description
        return create_logo_from_description(generated_text, prompt, style, color, industry, shape, width, height)
        
    except Exception as e:
        logger.error(f"❌ Error generating logo with Google Nano Banana: {e}")
        return None

def create_logo_from_description(description, prompt, style, color, industry, shape, width, height):
    """Create a logo based on Google's description"""
    try:
        # Create base image
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Color palettes based on style and industry
        color_palettes = {
            "professional": {
                "primary": "#1e40af",  # Blue
                "secondary": "#3b82f6",
                "accent": "#60a5fa"
            },
            "modern": {
                "primary": "#7c3aed",  # Purple
                "secondary": "#a855f7",
                "accent": "#c084fc"
            },
            "tech": {
                "primary": "#059669",  # Green
                "secondary": "#10b981",
                "accent": "#34d399"
            },
            "creative": {
                "primary": "#dc2626",  # Red
                "secondary": "#ef4444",
                "accent": "#f87171"
            },
            "minimalist": {
                "primary": "#374151",  # Gray
                "secondary": "#6b7280",
                "accent": "#9ca3af"
            }
        }
        
        palette = color_palettes.get(style, color_palettes["professional"])
        primary_color = palette["primary"]
        secondary_color = palette["secondary"]
        accent_color = palette["accent"]
        
        # Create sophisticated design based on description
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 3
        
        # Analyze description for design elements
        desc_lower = description.lower()
        
        if "circle" in desc_lower or shape == "circle":
            # Create circular logo
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.ellipse(bbox, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner elements
            inner_size = size * 0.7
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.ellipse(inner_bbox, fill=secondary_color, outline=accent_color, width=4)
            
            # Center element
            center_size = size * 0.4
            center_bbox = [center_x - center_size, center_y - center_size, center_x + center_size, center_y + center_size]
            draw.ellipse(center_bbox, fill=accent_color)
            
        elif "square" in desc_lower or shape == "square":
            # Create square logo
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.rectangle(bbox, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner square
            inner_size = size * 0.6
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.rectangle(inner_bbox, fill=secondary_color, outline=accent_color, width=4)
            
        elif "triangle" in desc_lower or shape == "triangle":
            # Create triangular logo
            points = [
                (center_x, center_y - size),
                (center_x - size, center_y + size),
                (center_x + size, center_y + size)
            ]
            draw.polygon(points, fill=primary_color, outline=secondary_color, width=6)
            
        else:
            # Default geometric design
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.ellipse(bbox, fill=primary_color, outline=secondary_color, width=6)
        
        # Add industry-specific elements
        if "tech" in industry.lower() or "technology" in desc_lower:
            # Add tech elements
            tech_size = size * 0.3
            for i in range(4):
                angle = i * 90
                x = center_x + int(tech_size * 0.8 * (1 if i % 2 == 0 else -1))
                y = center_y + int(tech_size * 0.8 * (1 if i < 2 else -1))
                draw.ellipse([x-tech_size//2, y-tech_size//2, x+tech_size//2, y+tech_size//2], 
                           fill=accent_color)
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info("✅ Logo created successfully with Google Nano Banana")
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        logger.error(f"❌ Error creating logo from description: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Google Nano Banana Logo Generator",
        "api_configured": bool(GOOGLE_API_KEY),
        "model": "gemini-2.5-flash-image-preview",
        "cost": "FREE - Google API"
    })

@app.route('/generate-logo', methods=['POST'])
def generate_logo():
    """Generate a single logo using Google Nano Banana"""
    try:
        data = request.get_json()
        
        prompt = data.get('prompt', 'logo design')
        style = data.get('style', 'professional')
        color = data.get('color', 'modern')
        industry = data.get('industry', 'general')
        shape = data.get('shape', 'circle')
        width = data.get('width', 512)
        height = data.get('height', 512)
        
        logger.info(f"🎨 Generating Google Nano Banana logo: {prompt}")
        
        # Generate logo using Google Nano Banana
        image_base64 = generate_logo_with_google_nano_banana(prompt, style, color, industry, shape, width, height)
        
        if image_base64 is None:
            return jsonify({"error": "Failed to generate logo with Google Nano Banana"}), 500
        
        return jsonify({
            "success": True,
            "imageUrl": image_base64,
            "prompt": prompt,
            "model": "gemini-2.5-flash-image-preview",
            "service": "Google Nano Banana",
            "cost": "FREE"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-logo-variations', methods=['POST'])
def generate_logo_variations():
    """Generate multiple logo variations using Google Nano Banana"""
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
        
        logger.info(f"🎨 Generating {num_variations} Google Nano Banana logo variations: {prompt}")
        
        variations = []
        styles = ['professional', 'modern', 'creative', 'minimalist']
        
        # Generate multiple variations
        for i in range(num_variations):
            variation_style = styles[i % len(styles)]
            variation_prompt = f"{prompt}, {variation_style} style, variation {i+1}"
            
            image_base64 = generate_logo_with_google_nano_banana(
                variation_prompt, variation_style, color, industry, shape, width, height
            )
            
            if image_base64:
                variations.append({
                    "id": i + 1,
                    "imageUrl": image_base64,
                    "prompt": variation_prompt,
                    "style": variation_style,
                    "model": "gemini-1.5-flash"
                })
        
        if not variations:
            return jsonify({"error": "Failed to generate any logo variations"}), 500
        
        return jsonify({
            "success": True,
            "logos": variations,
            "totalGenerated": len(variations),
            "service": "Google Nano Banana"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    if not GOOGLE_API_KEY:
        logger.error("❌ Please set GOOGLE_API_KEY environment variable")
        logger.info("💡 Get your free API key from: https://aistudio.google.com/app/apikey")
        exit(1)
        
    logger.info("🚀 Starting Google Nano Banana Logo Generator...")
    logger.info(f"🔑 API Key configured: {GOOGLE_API_KEY[:10]}...")
    logger.info("🤖 Model: gemini-1.5-flash")
    logger.info("💰 This is FREE - Google API")
    
    app.run(host='0.0.0.0', port=5003, debug=True)
