#!/usr/bin/env python3
"""
Simple Logo Generator - No AI dependencies required
Generates professional logos using geometric shapes and patterns
"""

import os
import base64
import io
import logging
import random
import math
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def create_geometric_logo(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Create a professional geometric logo"""
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
        
        # Create sophisticated design
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 3
        
        # Analyze prompt for design elements
        prompt_lower = prompt.lower()
        
        # Create main shape
        if shape == "circle" or "circle" in prompt_lower:
            # Outer circle
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.ellipse(bbox, fill=primary_color, outline=secondary_color, width=6)
            
            # Middle circle
            middle_size = size * 0.7
            middle_bbox = [center_x - middle_size, center_y - middle_size, center_x + middle_size, center_y + middle_size]
            draw.ellipse(middle_bbox, fill=secondary_color, outline=accent_color, width=4)
            
            # Inner circle
            inner_size = size * 0.4
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.ellipse(inner_bbox, fill=accent_color)
            
        elif shape == "square" or "square" in prompt_lower:
            # Outer square
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.rectangle(bbox, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner square
            inner_size = size * 0.6
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.rectangle(inner_bbox, fill=secondary_color, outline=accent_color, width=4)
            
        elif shape == "triangle" or "triangle" in prompt_lower:
            # Triangle
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
        if "tech" in industry.lower() or "technology" in prompt_lower:
            # Add tech elements - small squares representing pixels
            tech_size = size * 0.2
            for i in range(4):
                angle = i * 90
                x = center_x + int(tech_size * 1.5 * math.cos(math.radians(angle)))
                y = center_y + int(tech_size * 1.5 * math.sin(math.radians(angle)))
                draw.rectangle([x-tech_size//2, y-tech_size//2, x+tech_size//2, y+tech_size//2], 
                             fill=accent_color)
        
        elif "health" in industry.lower() or "medical" in prompt_lower:
            # Add health elements - cross
            cross_size = size * 0.3
            # Vertical line
            draw.rectangle([center_x-2, center_y-cross_size, center_x+2, center_y+cross_size], fill=accent_color)
            # Horizontal line
            draw.rectangle([center_x-cross_size, center_y-2, center_x+cross_size, center_y+2], fill=accent_color)
        
        elif "finance" in industry.lower() or "bank" in prompt_lower:
            # Add finance elements - dollar sign
            try:
                # Simple dollar sign representation
                dollar_size = size * 0.4
                # Vertical line
                draw.rectangle([center_x-1, center_y-dollar_size, center_x+1, center_y+dollar_size], fill=accent_color)
                # S curves
                for i in range(3):
                    y_offset = (i - 1) * dollar_size // 3
                    draw.ellipse([center_x-dollar_size//2, center_y+y_offset-2, center_x+dollar_size//2, center_y+y_offset+2], 
                               outline=accent_color, width=2)
            except:
                pass
        
        # Add creative elements for creative style
        if style == "creative":
            # Add some random creative elements
            for i in range(3):
                x = center_x + random.randint(-size//2, size//2)
                y = center_y + random.randint(-size//2, size//2)
                radius = random.randint(5, 15)
                draw.ellipse([x-radius, y-radius, x+radius, y+radius], 
                           fill=accent_color, outline=primary_color, width=2)
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        logger.info("✅ Logo created successfully")
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        logger.error(f"❌ Error creating logo: {e}")
        return None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "Simple Logo Generator",
        "model": "geometric-shapes",
        "cost": "FREE - No AI required"
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
        
        logger.info(f"🎨 Generating logo: {prompt}")
        
        # Generate logo
        image_base64 = create_geometric_logo(prompt, style, color, industry, shape, width, height)
        
        if image_base64 is None:
            return jsonify({"error": "Failed to generate logo"}), 500
        
        return jsonify({
            "success": True,
            "imageUrl": image_base64,
            "prompt": prompt,
            "model": "geometric-shapes",
            "service": "Simple Logo Generator",
            "cost": "FREE"
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
        num_variations = data.get('num_variations', 4)
        
        logger.info(f"🎨 Generating {num_variations} logo variations: {prompt}")
        
        variations = []
        styles = ['professional', 'modern', 'creative', 'minimalist']
        
        # Generate multiple variations
        for i in range(num_variations):
            variation_style = styles[i % len(styles)]
            variation_prompt = f"{prompt}, {variation_style} style"
            
            image_base64 = create_geometric_logo(
                variation_prompt, variation_style, color, industry, shape, width, height
            )
            
            if image_base64:
                variations.append({
                    "id": i + 1,
                    "imageUrl": image_base64,
                    "prompt": variation_prompt,
                    "style": variation_style,
                    "model": "geometric-shapes"
                })
        
        if not variations:
            return jsonify({"error": "Failed to generate any logo variations"}), 500
        
        return jsonify({
            "success": True,
            "logos": variations,
            "totalGenerated": len(variations),
            "service": "Simple Logo Generator"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Simple Logo Generator...")
    logger.info("🎨 Model: Geometric shapes and patterns")
    logger.info("💰 Cost: FREE - No AI dependencies")
    
    app.run(host='0.0.0.0', port=5001, debug=True)


