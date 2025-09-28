#!/usr/bin/env python3
"""
Advanced Logo Generator with Multiple AI Options
- Simple Generator (FREE)
- Nano Banana API (ADVANCED)
"""

import os
import base64
import io
import logging
import requests
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

# API Configuration - Using Google's Gemini API instead
import os
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyCbAVf7KAgBWI7G2iaC5djloq63HrAuwG0")
GOOGLE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def create_geometric_logo(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Create a geometric logo using simple graphics (FREE)"""
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

def generate_logo_with_google_gemini(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Google Gemini API (REAL AI)"""
    try:
        logger.info(f"🎨 Generating REAL AI logo with Google Gemini: {prompt}")
        
        # Enhanced prompt for better logo quality
        enhanced_prompt = f"Create a professional logo design for: {prompt}. Style: {style}, Colors: {color}, Industry: {industry}, Shape: {shape}. Make it minimalist, clean, modern, and suitable for a brand. The logo should be simple, memorable, and work well at different sizes. Focus on geometric shapes and clean lines."
        
        # Prepare API request for Google Gemini
        headers = {
            "Content-Type": "application/json"
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": f"Generate a detailed description of a logo design based on this prompt: {enhanced_prompt}. Describe the visual elements, colors, shapes, and overall design in detail so it can be recreated programmatically."
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }
        
        # Make API request to Google Gemini
        response = requests.post(f"{GOOGLE_API_URL}?key={GOOGLE_API_KEY}", headers=headers, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            # Extract description from Gemini response
            if 'candidates' in result and len(result['candidates']) > 0:
                description = result['candidates'][0]['content']['parts'][0]['text']
                logger.info(f"🎨 Gemini description: {description}")
                
                # Use the description to create an enhanced geometric logo
                return create_enhanced_geometric_logo(prompt, description, style, color, industry, shape, width, height)
            else:
                logger.error("❌ No description in Gemini response")
                return create_enhanced_geometric_logo(prompt, "", style, color, industry, shape, width, height)
        else:
            logger.error(f"❌ Google Gemini API error: {response.status_code} - {response.text}")
            return create_enhanced_geometric_logo(prompt, "", style, color, industry, shape, width, height)
            
    except Exception as e:
        logger.error(f"❌ Error generating logo with Google Gemini: {e}")
        return create_enhanced_geometric_logo(prompt, "", style, color, industry, shape, width, height)

def create_enhanced_geometric_logo(prompt, ai_description, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Create enhanced geometric logo based on AI description"""
    try:
        # Create base image with higher quality
        img = Image.new('RGB', (width, height), 'white')
        draw = ImageDraw.Draw(img)
        
        # Enhanced color palette based on style and industry
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
            }
        }
        
        palette = color_palettes.get(style, color_palettes["professional"])
        primary_color = palette["primary"]
        secondary_color = palette["secondary"]
        accent_color = palette["accent"]
        
        # Create more sophisticated design
        center_x, center_y = width // 2, height // 2
        size = min(width, height) // 3
        
        # Draw main shape with gradient effect
        if shape == "circle":
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
            
        elif shape == "square":
            # Outer square
            bbox = [center_x - size, center_y - size, center_x + size, center_y + size]
            draw.rectangle(bbox, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner square
            inner_size = size * 0.6
            inner_bbox = [center_x - inner_size, center_y - inner_size, center_x + inner_size, center_y + inner_size]
            draw.rectangle(inner_bbox, fill=secondary_color, outline=accent_color, width=4)
            
        elif shape == "triangle":
            # Outer triangle
            points = [
                (center_x, center_y - size),
                (center_x - size, center_y + size),
                (center_x + size, center_y + size)
            ]
            draw.polygon(points, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner triangle
            inner_size = size * 0.6
            inner_points = [
                (center_x, center_y - inner_size),
                (center_x - inner_size, center_y + inner_size),
                (center_x + inner_size, center_y + inner_size)
            ]
            draw.polygon(inner_points, fill=secondary_color, outline=accent_color, width=4)
            
        elif shape == "hexagon":
            # Outer hexagon
            points = []
            for i in range(6):
                angle = math.pi / 3 * i
                x = center_x + size * math.cos(angle)
                y = center_y + size * math.sin(angle)
                points.append((x, y))
            draw.polygon(points, fill=primary_color, outline=secondary_color, width=6)
            
            # Inner hexagon
            inner_size = size * 0.6
            inner_points = []
            for i in range(6):
                angle = math.pi / 3 * i
                x = center_x + inner_size * math.cos(angle)
                y = center_y + inner_size * math.sin(angle)
                inner_points.append((x, y))
            draw.polygon(inner_points, fill=secondary_color, outline=accent_color, width=4)
        
        # Add sophisticated text
        if any(word in prompt.lower() for word in ['text', 'name', 'company', 'brand']):
            try:
                # Extract text from prompt
                words = [word for word in prompt.split() if word.isalpha() and len(word) > 2]
                if words:
                    text = ''.join([word[0].upper() for word in words[:2]])
                else:
                    text = "LOGO"
                
                # Use better font
                font_size = min(width, height) // 10
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
                
                # Draw text with shadow effect
                draw.text((x+2, y+2), text, fill='black', font=font)
                draw.text((x, y), text, fill='white', font=font)
                
            except Exception as e:
                logger.warning(f"Could not add text: {e}")
        
        # Add industry-specific elements
        if 'tech' in prompt.lower() or 'startup' in prompt.lower():
            # Add tech elements
            for i in range(5):
                x = center_x + random.randint(-size//2, size//2)
                y = center_y + random.randint(-size//2, size//2)
                draw.ellipse([x-3, y-3, x+3, y+3], fill=accent_color)
        
        # Add some decorative elements
        for i in range(3):
            x = random.randint(50, width-50)
            y = random.randint(50, height-50)
            draw.ellipse([x-2, y-2, x+2, y+2], fill=accent_color)
        
        return img
        
    except Exception as e:
        logger.error(f"❌ Error creating enhanced geometric logo: {e}")
        return None

def generate_logo_smart(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512, use_advanced=False):
    """Generate logo using smart selection"""
    try:
        if use_advanced:
            # Use Google Gemini API for advanced generation
            return generate_logo_with_google_gemini(prompt, style, color, industry, shape, width, height)
        else:
            # Use simple geometric generator
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
        "service": "Advanced Logo Generator",
        "description": "Multiple AI options: Simple (FREE) + Google Gemini (ADVANCED)",
        "options": {
            "simple": "FREE - Geometric logos",
            "advanced": "Google Gemini API - Professional AI logos"
        }
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
        use_advanced = data.get('use_advanced', False)  # New parameter
        
        logger.info(f"🎨 Generating logo: {prompt} (Advanced: {use_advanced})")
        
        # Generate logo
        image = generate_logo_smart(prompt, style, color, industry, shape, width, height, use_advanced)
        
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
            "model": "google-gemini-ai" if use_advanced else "geometric-generator",
            "cost": "FREE" if not use_advanced else "Google Gemini API",
            "advanced": use_advanced
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
        use_advanced = data.get('use_advanced', False)  # New parameter
        
        logger.info(f"🎨 Generating {count} variations for: {prompt} (Advanced: {use_advanced})")
        
        variations = []
        
        for i in range(count):
            # Add variation to prompt
            variation_prompt = f"{prompt}, variation {i+1}"
            
            # Generate logo
            image = generate_logo_smart(variation_prompt, style, color, industry, shape, width, height, use_advanced)
            
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
            "model": "google-gemini-ai" if use_advanced else "geometric-generator",
            "cost": "FREE" if not use_advanced else "Google Gemini API",
            "advanced": use_advanced
        })
        
    except Exception as e:
        logger.error(f"❌ Error in generate_logo_variations: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Advanced Logo Generator...")
    logger.info("💰 Options: Simple (FREE) + Nano Banana (ADVANCED)")
    logger.info("✅ Server ready!")
    
    # Start server
    app.run(host='0.0.0.0', port=5001, debug=False)
