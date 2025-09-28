#!/usr/bin/env python3
"""
SIMPLE FREE Logo Generator - No AI models, just smart graphics
Completely FREE - no API costs, no downloads!
"""

import os
import base64
import io
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random
import math

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def create_geometric_logo(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Create a geometric logo based on prompt analysis"""
    try:
        # Create base image
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Analyze prompt for design elements
        prompt_lower = prompt.lower()
        
        # Determine colors based on prompt and style
        if 'black' in prompt_lower or 'monochrome' in prompt_lower:
            primary_color = 'black'
            secondary_color = 'white'
        elif 'blue' in prompt_lower or 'tech' in prompt_lower:
            primary_color = '#2563eb'  # Blue
            secondary_color = '#1e40af'
        elif 'red' in prompt_lower or 'energy' in prompt_lower:
            primary_color = '#dc2626'  # Red
            secondary_color = '#b91c1c'
        elif 'green' in prompt_lower or 'nature' in prompt_lower:
            primary_color = '#16a34a'  # Green
            secondary_color = '#15803d'
        else:
            # Modern color palette
            colors = ['#2563eb', '#7c3aed', '#dc2626', '#16a34a', '#ea580c', '#0891b2']
            primary_color = random.choice(colors)
            secondary_color = 'white'
        
        # Determine shape
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 3
        
        if shape == 'circle' or 'round' in prompt_lower:
            # Draw circle
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.ellipse(bbox, fill=primary_color, outline=secondary_color, width=4)
            
            # Add inner circle
            inner_size = size // 2
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.ellipse(inner_bbox, fill=secondary_color)
            
        elif shape == 'square' or 'square' in prompt_lower:
            # Draw square
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.rectangle(bbox, fill=primary_color, outline=secondary_color, width=4)
            
            # Add inner square
            inner_size = size // 2
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.rectangle(inner_bbox, fill=secondary_color)
            
        elif shape == 'triangle' or 'triangle' in prompt_lower:
            # Draw triangle
            points = [
                (center_x, center_y - size),
                (center_x - size, center_y + size),
                (center_x + size, center_y + size)
            ]
            draw.polygon(points, fill=primary_color, outline=secondary_color, width=4)
            
        elif shape == 'hexagon' or 'hex' in prompt_lower:
            # Draw hexagon
            points = []
            for i in range(6):
                angle = math.pi / 3 * i
                x = center_x + size * math.cos(angle)
                y = center_y + size * math.sin(angle)
                points.append((x, y))
            draw.polygon(points, fill=primary_color, outline=secondary_color, width=4)
            
        else:
            # Default to circle
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.ellipse(bbox, fill=primary_color, outline=secondary_color, width=4)
        
        # Add text if specified
        if any(word in prompt_lower for word in ['text', 'name', 'company', 'brand']):
            try:
                # Extract potential text from prompt
                words = [word for word in prompt.split() if word.isalpha() and len(word) > 2]
                if words:
                    text = ''.join([word[0].upper() for word in words[:2]])
                else:
                    text = "LOGO"
                
                # Try to use a system font
                font_size = min(width, height) // 8
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()
                
                # Get text bounding box
                bbox = draw.textbbox((0, 0), text, font=font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Center the text
                x = (width - text_width) // 2
                y = (height - text_height) // 2
                
                draw.text((x, y), text, fill=secondary_color, font=font)
                
            except Exception as e:
                logger.warning(f"Could not add text: {e}")
        
        # Add some design elements based on industry
        if 'tech' in prompt_lower or 'startup' in prompt_lower:
            # Add tech elements - small circles or lines
            for i in range(3):
                x = center_x + random.randint(-size//2, size//2)
                y = center_y + random.randint(-size//2, size//2)
                draw.ellipse([x-5, y-5, x+5, y+5], fill=secondary_color)
        
        return img
        
    except Exception as e:
        logger.error(f"❌ Error creating geometric logo: {e}")
        return None

def create_minimalist_logo(prompt, width=512, height=512):
    """Create a minimalist logo"""
    try:
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Simple minimalist design
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 4
        
        # Draw a simple geometric shape
        bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
        draw.ellipse(bbox, fill='black', outline='gray', width=2)
        
        return img
        
    except Exception as e:
        logger.error(f"❌ Error creating minimalist logo: {e}")
        return None

def generate_logo_smart(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using smart geometric design"""
    try:
        prompt_lower = prompt.lower()
        
        # Choose logo style based on prompt
        if any(word in prompt_lower for word in ['minimal', 'simple', 'clean']):
            return create_minimalist_logo(prompt, width, height)
        else:
            return create_geometric_logo(prompt, style, color, industry, shape, width, height)
            
    except Exception as e:
        logger.error(f"❌ Error generating smart logo: {e}")
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
        "service": "Simple FREE Logo Generator",
        "description": "Smart geometric logo generation - no AI models needed!",
        "cost": "FREE"
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
        
        logger.info(f"🎨 Generating FREE logo: {prompt}")
        
        # Generate logo
        image = generate_logo_smart(prompt, style, color, industry, shape, width, height)
        
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
            "model": "smart-geometric-generator",
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
        count = data.get('count', 3)
        
        logger.info(f"🎨 Generating {count} FREE variations for: {prompt}")
        
        variations = []
        
        for i in range(count):
            # Add variation to prompt
            variation_prompt = f"{prompt}, variation {i+1}"
            
            # Generate logo
            image = generate_logo_smart(variation_prompt, style, color, industry, shape, width, height)
            
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
            "model": "smart-geometric-generator",
            "cost": "FREE"
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting SIMPLE FREE Logo Generator...")
    logger.info("💰 Cost: $0.00 - Completely FREE!")
    logger.info("✅ Server ready!")
    
    # Start server
    app.run(host='0.0.0.0', port=5001, debug=False)
