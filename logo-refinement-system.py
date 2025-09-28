#!/usr/bin/env python3
"""
Advanced Logo Refinement System
Competes with Canva's logo refinement features
"""

import requests
import base64
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw, ImageFont
import cv2
import numpy as np

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

class LogoRefinementSystem:
    def __init__(self):
        self.styles = {
            "minimalist": "clean, simple, modern, geometric",
            "vintage": "retro, classic, aged, traditional",
            "modern": "contemporary, sleek, futuristic, tech",
            "playful": "fun, colorful, rounded, friendly",
            "professional": "corporate, serious, clean, business",
            "artistic": "creative, unique, hand-drawn, expressive"
        }
        
        self.color_palettes = {
            "tech": ["#0066CC", "#00CCFF", "#003366", "#FFFFFF"],
            "health": ["#00AA44", "#88DD88", "#004422", "#FFFFFF"],
            "finance": ["#003366", "#0066AA", "#CCCCCC", "#FFFFFF"],
            "creative": ["#FF6600", "#FFAA00", "#FF3366", "#FFFFFF"],
            "nature": ["#00AA44", "#88AA44", "#446622", "#FFFFFF"]
        }

    def enhance_quality(self, image, enhancement_level="medium"):
        """Enhance image quality like Canva"""
        try:
            # Convert to PIL Image
            if isinstance(image, str):
                # Base64 string
                image_data = base64.b64decode(image.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                img = image
            
            # Apply enhancements based on level
            if enhancement_level == "high":
                # High quality enhancement
                img = img.filter(ImageFilter.SHARPEN)
                img = img.filter(ImageFilter.EDGE_ENHANCE)
                
                # Enhance contrast and brightness
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.2)
                
                enhancer = ImageEnhance.Brightness(img)
                img = enhancer.enhance(1.1)
                
            elif enhancement_level == "medium":
                # Medium enhancement
                img = img.filter(ImageFilter.SHARPEN)
                
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.1)
            
            # Convert back to base64
            buffered = BytesIO()
            img.save(buffered, format="PNG", quality=95)
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error enhancing quality: {e}")
            return None

    def apply_style_transfer(self, image, style="modern"):
        """Apply style transfer like Canva"""
        try:
            if isinstance(image, str):
                image_data = base64.b64decode(image.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                img = image
            
            # Convert to OpenCV format
            img_cv = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            if style == "vintage":
                # Vintage effect
                img_cv = cv2.sepia_filter(img_cv, 0.8)
                img_cv = cv2.add_noise(img_cv, 0.1)
                
            elif style == "minimalist":
                # Minimalist - enhance edges
                gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                edges = cv2.Canny(gray, 50, 150)
                img_cv = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
                
            elif style == "artistic":
                # Artistic - apply oil painting effect
                img_cv = cv2.xphoto.oilPainting(img_cv, 7, 1)
                
            # Convert back to PIL
            img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
            img = Image.fromarray(img_rgb)
            
            # Convert to base64
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error applying style transfer: {e}")
            return None

    def generate_color_variations(self, image, industry="tech"):
        """Generate color variations like Canva"""
        try:
            if isinstance(image, str):
                image_data = base64.b64decode(image.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                img = image
            
            variations = []
            palette = self.color_palettes.get(industry, self.color_palettes["tech"])
            
            for i, color in enumerate(palette[:4]):  # Max 4 variations
                # Create a copy and apply color overlay
                img_copy = img.copy()
                
                # Convert to RGBA for color manipulation
                if img_copy.mode != 'RGBA':
                    img_copy = img_copy.convert('RGBA')
                
                # Create color overlay
                overlay = Image.new('RGBA', img_copy.size, color)
                img_copy = Image.alpha_composite(img_copy, overlay)
                
                # Convert back to RGB
                img_copy = img_copy.convert('RGB')
                
                # Convert to base64
                buffered = BytesIO()
                img_copy.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                variations.append({
                    "imageUrl": f"data:image/png;base64,{img_str}",
                    "color": color,
                    "name": f"Variation {i+1}"
                })
            
            return variations
            
        except Exception as e:
            logger.error(f"Error generating color variations: {e}")
            return []

    def create_size_variations(self, image, sizes=[(64, 64), (128, 128), (256, 256), (512, 512)]):
        """Create different size variations like Canva"""
        try:
            if isinstance(image, str):
                image_data = base64.b64decode(image.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                img = image
            
            variations = []
            
            for size in sizes:
                # Resize with high quality
                resized = img.resize(size, Image.Resampling.LANCZOS)
                
                # Convert to base64
                buffered = BytesIO()
                resized.save(buffered, format="PNG")
                img_str = base64.b64encode(buffered.getvalue()).decode()
                
                variations.append({
                    "imageUrl": f"data:image/png;base64,{img_str}",
                    "width": size[0],
                    "height": size[1],
                    "name": f"{size[0]}x{size[1]}"
                })
            
            return variations
            
        except Exception as e:
            logger.error(f"Error creating size variations: {e}")
            return []

    def add_text_overlay(self, image, text, font_size=24, color="#000000", position="bottom"):
        """Add text overlay like Canva"""
        try:
            if isinstance(image, str):
                image_data = base64.b64decode(image.split(',')[1])
                img = Image.open(BytesIO(image_data))
            else:
                img = image
            
            # Create a copy
            img_with_text = img.copy()
            draw = ImageDraw.Draw(img_with_text)
            
            # Try to use a default font
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
            except:
                font = ImageFont.load_default()
            
            # Get text dimensions
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Calculate position
            img_width, img_height = img.size
            if position == "bottom":
                x = (img_width - text_width) // 2
                y = img_height - text_height - 10
            elif position == "top":
                x = (img_width - text_width) // 2
                y = 10
            else:  # center
                x = (img_width - text_width) // 2
                y = (img_height - text_height) // 2
            
            # Draw text with outline for better visibility
            outline_color = "#FFFFFF" if color == "#000000" else "#000000"
            for adj in range(-1, 2):
                for adj2 in range(-1, 2):
                    draw.text((x+adj, y+adj2), text, font=font, fill=outline_color)
            
            # Draw main text
            draw.text((x, y), text, font=font, fill=color)
            
            # Convert to base64
            buffered = BytesIO()
            img_with_text.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            logger.error(f"Error adding text overlay: {e}")
            return None

# Initialize refinement system
refinement_system = LogoRefinementSystem()

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Logo Refinement System",
        "features": [
            "Quality Enhancement",
            "Style Transfer", 
            "Color Variations",
            "Size Variations",
            "Text Overlay"
        ]
    })

@app.route('/refine-logo', methods=['POST'])
def refine_logo():
    try:
        data = request.get_json()
        image_url = data.get('imageUrl')
        refinement_type = data.get('type', 'enhance')
        options = data.get('options', {})
        
        logger.info(f"🎨 Refining logo: {refinement_type}")
        
        if refinement_type == "enhance":
            enhancement_level = options.get('level', 'medium')
            result = refinement_system.enhance_quality(image_url, enhancement_level)
            
        elif refinement_type == "style":
            style = options.get('style', 'modern')
            result = refinement_system.apply_style_transfer(image_url, style)
            
        elif refinement_type == "color_variations":
            industry = options.get('industry', 'tech')
            variations = refinement_system.generate_color_variations(image_url, industry)
            return jsonify({
                "success": True,
                "variations": variations,
                "type": "color_variations"
            })
            
        elif refinement_type == "size_variations":
            sizes = options.get('sizes', [(64, 64), (128, 128), (256, 256), (512, 512)])
            variations = refinement_system.create_size_variations(image_url, sizes)
            return jsonify({
                "success": True,
                "variations": variations,
                "type": "size_variations"
            })
            
        elif refinement_type == "add_text":
            text = options.get('text', '')
            font_size = options.get('font_size', 24)
            color = options.get('color', '#000000')
            position = options.get('position', 'bottom')
            result = refinement_system.add_text_overlay(image_url, text, font_size, color, position)
            
        else:
            return jsonify({
                "success": False,
                "error": "Unknown refinement type"
            }), 400
        
        if result:
            return jsonify({
                "success": True,
                "imageUrl": result,
                "type": refinement_type
            })
        else:
            return jsonify({
                "success": False,
                "error": "Refinement failed"
            }), 500
            
    except Exception as e:
        logger.error(f"❌ Refinement API Error: {e}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    logger.info("🚀 Starting Logo Refinement System...")
    logger.info("✅ Server ready! (Canva-competitive features)")
    app.run(host='0.0.0.0', port=5002, debug=False)
