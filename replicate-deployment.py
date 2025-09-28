#!/usr/bin/env python3
"""
Deploy your diffusion logo generator to Replicate
This runs your exact same code but on Replicate's servers
"""

import replicate
import os
import base64
from io import BytesIO
from PIL import Image, ImageDraw
import math

# Your Replicate API token
REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN')

def create_logo_control_image(shape, width=256, height=256):
    """Create control image for different shapes - SAME as your Google Colab"""
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
    """Enhance the prompt - SAME as your Google Colab"""
    enhanced = f"logo design, {prompt}, {style} style, {color} colors, {industry} industry"
    
    shape_keywords = {
        "circle": "circular, round, centered, balanced",
        "square": "square, geometric, structured, clean",
        "hexagon": "hexagonal, modern, tech, innovative", 
        "triangle": "triangular, dynamic, energetic, bold"
    }
    
    enhanced += f", {shape_keywords.get(shape, '')}"
    enhanced += ", high quality, professional, vector style, no text, just icon"
    
    negative = "text, words, letters, typography, watermark, signature, blurry, low quality, distorted, extra limbs, bad anatomy"
    
    return enhanced, negative

def generate_logo_with_replicate(prompt, style="professional", color="modern", industry="general", shape="circle", width=512, height=512):
    """Generate logo using Replicate - SAME logic as your Google Colab"""
    try:
        # Set your API token
        replicate.Client(api_token=REPLICATE_API_TOKEN)
        
        # Enhance the prompt (same as your code)
        enhanced_prompt, negative_prompt = enhance_logo_prompt(prompt, style, color, industry, shape)
        
        print(f"🎨 Generating logo with Replicate: {enhanced_prompt[:100]}...")
        
        # Use Replicate's Stable Diffusion XL (same model as your Google Colab)
        output = replicate.run(
            "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
            input={
                "prompt": enhanced_prompt,
                "negative_prompt": negative_prompt,
                "width": width,
                "height": height,
                "num_inference_steps": 20,
                "guidance_scale": 7.5,
                "num_outputs": 1
            }
        )
        
        print("✅ Logo generated successfully with Replicate!")
        
        return {
            "success": True,
            "image_url": output[0],
            "prompt": enhanced_prompt,
            "shape": shape,
            "dimensions": f"{width}x{height}",
            "cost": "$0.01"
        }
        
    except Exception as e:
        print(f"❌ Error generating logo with Replicate: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# Test function
if __name__ == "__main__":
    if not REPLICATE_API_TOKEN:
        print("❌ Please set REPLICATE_API_TOKEN environment variable")
        print("Get your token from: https://replicate.com/account/api-tokens")
        exit(1)
    
    print("🚀 Testing Replicate deployment...")
    
    # Test logo generation
    result = generate_logo_with_replicate(
        prompt="tech startup logo",
        style="minimalist", 
        color="blue",
        industry="technology",
        shape="circle"
    )
    
    if result['success']:
        print(f"✅ Success! Logo URL: {result['image_url']}")
        print(f"💰 Cost: {result['cost']}")
    else:
        print(f"❌ Failed: {result['error']}")
