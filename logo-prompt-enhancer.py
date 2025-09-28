#!/usr/bin/env python3
"""
Logo Prompt Enhancer
Improves logo generation by using advanced prompt engineering
"""

import json
import logging
from typing import Dict, List, Tuple

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LogoPromptEnhancer:
    def __init__(self):
        self.logo_style_templates = self._load_style_templates()
        self.industry_keywords = self._load_industry_keywords()
        self.color_palettes = self._load_color_palettes()
        self.quality_boosters = self._load_quality_boosters()
        
    def _load_style_templates(self) -> Dict[str, str]:
        """Load style-specific prompt templates"""
        return {
            "professional": "corporate logo, clean lines, sophisticated design, business-like, elegant, refined, authoritative, trustworthy, established, formal, polished, premium quality",
            "modern": "contemporary logo, sleek design, minimalist, trendy, innovative, futuristic, cutting-edge, fresh, current, dynamic, progressive, tech-forward",
            "creative": "artistic logo, unique design, creative, expressive, original, bold, imaginative, innovative, distinctive, memorable, eye-catching, unconventional",
            "minimalist": "simple logo, clean design, essential elements only, uncluttered, geometric, balanced, harmonious, timeless, elegant, refined, sophisticated",
            "vintage": "retro logo, classic design, timeless, traditional, nostalgic, aged, heritage, authentic, established, classic typography, vintage aesthetic",
            "tech": "digital logo, futuristic design, tech-forward, innovative, cutting-edge, cyber, modern, sleek, high-tech, advanced, technological, progressive",
            "corporate": "business logo, professional design, corporate identity, formal, trustworthy, reliable, established, authoritative, sophisticated, polished",
            "startup": "modern startup logo, innovative design, fresh, dynamic, energetic, bold, contemporary, tech-savvy, forward-thinking, disruptive, agile"
        }
    
    def _load_industry_keywords(self) -> Dict[str, str]:
        """Load industry-specific keywords"""
        return {
            "tech": "technology, software, digital, innovation, data, cloud, AI, blockchain, cybersecurity, fintech, edtech, healthtech, cleantech, biotech",
            "finance": "financial services, banking, investment, wealth management, insurance, fintech, trading, cryptocurrency, blockchain, payment, lending",
            "healthcare": "medical, healthcare, wellness, pharmaceutical, biotech, clinical, therapeutic, diagnostic, treatment, healing, care, health",
            "education": "educational, learning, academic, training, knowledge, research, university, school, e-learning, online education, skill development",
            "marketing": "advertising, marketing, branding, creative agency, digital marketing, social media, content creation, PR, communications, design",
            "food": "restaurant, food service, culinary, hospitality, catering, food delivery, organic, healthy, gourmet, farm-to-table, sustainable",
            "fashion": "fashion, clothing, apparel, style, luxury, boutique, designer, trendy, chic, elegant, sophisticated, contemporary",
            "retail": "retail, e-commerce, shopping, consumer goods, marketplace, store, brand, product, customer service, sales, distribution",
            "real_estate": "real estate, property, housing, construction, development, architecture, interior design, home, commercial, residential",
            "automotive": "automotive, car, vehicle, transportation, mobility, electric, hybrid, luxury, performance, safety, innovation, technology"
        }
    
    def _load_color_palettes(self) -> Dict[str, str]:
        """Load color-specific descriptions"""
        return {
            "blue": "blue color scheme, professional blue, corporate blue, navy blue, sky blue, royal blue, electric blue, calming, trustworthy, reliable",
            "green": "green color scheme, nature green, forest green, emerald green, mint green, eco-friendly, growth, harmony, balance, natural",
            "red": "red color scheme, vibrant red, crimson red, burgundy, energy, passion, excitement, bold, dynamic, attention-grabbing, powerful",
            "purple": "purple color scheme, royal purple, violet, lavender, creative, luxury, sophistication, mystery, innovation, artistic, premium",
            "orange": "orange color scheme, vibrant orange, sunset orange, energetic, warm, friendly, approachable, creative, enthusiasm, optimism",
            "yellow": "yellow color scheme, bright yellow, golden yellow, sunshine, happiness, optimism, creativity, energy, warmth, cheerfulness",
            "black": "black and white, monochrome, elegant, sophisticated, timeless, classic, professional, minimalist, high-contrast, dramatic",
            "gray": "gray color scheme, silver, metallic, modern, sophisticated, neutral, balanced, professional, tech-forward, sleek, contemporary",
            "multicolor": "vibrant colors, rainbow, colorful, diverse, energetic, creative, playful, dynamic, eye-catching, modern, contemporary",
            "pastel": "soft colors, pastel palette, gentle, subtle, refined, delicate, elegant, calming, peaceful, sophisticated, muted tones"
        }
    
    def _load_quality_boosters(self) -> List[str]:
        """Load quality enhancement keywords"""
        return [
            "high quality", "professional", "vector art", "clean design", "scalable", "iconic", "memorable", 
            "brand identity", "no text", "just icon", "minimalist", "modern logo design", "award-winning",
            "premium quality", "crisp", "sharp", "detailed", "polished", "refined", "sophisticated",
            "timeless", "classic", "contemporary", "trendy", "innovative", "unique", "distinctive"
        ]
    
    def enhance_prompt(self, 
                      base_prompt: str, 
                      style: str = "professional", 
                      industry: str = "general", 
                      color: str = "modern",
                      shape: str = "circle",
                      additional_requirements: List[str] = None) -> Tuple[str, str]:
        """
        Enhance a logo prompt with style, industry, and quality keywords
        
        Returns:
            Tuple of (enhanced_prompt, negative_prompt)
        """
        try:
            logger.info(f"🎨 Enhancing prompt: '{base_prompt}'")
            
            # Start with base prompt
            enhanced_prompt = f"logo design, {base_prompt}"
            
            # Add style template
            if style in self.logo_style_templates:
                enhanced_prompt += f", {self.logo_style_templates[style]}"
            
            # Add industry keywords
            if industry in self.industry_keywords:
                enhanced_prompt += f", {self.industry_keywords[industry]}"
            
            # Add color description
            if color in self.color_palettes:
                enhanced_prompt += f", {self.color_palettes[color]}"
            
            # Add shape-specific keywords
            shape_keywords = {
                "circle": "circular, round, centered, balanced, harmonious, complete",
                "square": "square, geometric, structured, clean, stable, solid, symmetrical",
                "triangle": "triangular, dynamic, energetic, bold, directional, strong, angular",
                "hexagon": "hexagonal, modern, tech, innovative, geometric, futuristic, structured",
                "diamond": "diamond shape, angular, dynamic, luxury, premium, sophisticated",
                "organic": "organic shape, flowing, natural, fluid, curved, soft, approachable"
            }
            
            if shape in shape_keywords:
                enhanced_prompt += f", {shape_keywords[shape]}"
            
            # Add additional requirements
            if additional_requirements:
                enhanced_prompt += f", {', '.join(additional_requirements)}"
            
            # Add quality boosters
            enhanced_prompt += f", {', '.join(self.quality_boosters[:5])}"  # Use top 5 quality boosters
            
            # Create negative prompt
            negative_prompt = self._create_negative_prompt(style, industry)
            
            logger.info(f"✅ Enhanced prompt created")
            logger.info(f"📝 Enhanced: {enhanced_prompt[:100]}...")
            
            return enhanced_prompt, negative_prompt
            
        except Exception as e:
            logger.error(f"❌ Error enhancing prompt: {e}")
            return base_prompt, "low quality, blurry, distorted"
    
    def _create_negative_prompt(self, style: str, industry: str) -> str:
        """Create negative prompt based on style and industry"""
        base_negative = [
            "text", "words", "letters", "typography", "watermark", "signature", 
            "blurry", "low quality", "distorted", "ugly", "bad anatomy", 
            "extra limbs", "complex background", "cluttered", "messy", 
            "amateur", "unprofessional", "cartoon", "childish", 
            "low resolution", "pixelated", "noise", "artifacts"
        ]
        
        # Add style-specific negatives
        style_negatives = {
            "professional": ["playful", "casual", "informal", "colorful", "bright"],
            "creative": ["boring", "plain", "simple", "basic", "generic"],
            "minimalist": ["complex", "detailed", "busy", "cluttered", "ornate"],
            "vintage": ["modern", "futuristic", "tech", "digital", "contemporary"]
        }
        
        if style in style_negatives:
            base_negative.extend(style_negatives[style])
        
        # Add industry-specific negatives
        industry_negatives = {
            "tech": ["organic", "natural", "hand-drawn", "sketchy", "rough"],
            "healthcare": ["aggressive", "harsh", "cold", "mechanical", "industrial"],
            "finance": ["playful", "casual", "colorful", "artistic", "creative"]
        }
        
        if industry in industry_negatives:
            base_negative.extend(industry_negatives[industry])
        
        return ", ".join(base_negative)
    
    def create_style_variations(self, base_prompt: str, industry: str = "general") -> Dict[str, str]:
        """Create multiple style variations of a prompt"""
        try:
            logger.info(f"🎨 Creating style variations for: '{base_prompt}'")
            
            variations = {}
            styles = ["professional", "modern", "creative", "minimalist", "tech", "corporate"]
            
            for style in styles:
                enhanced, _ = self.enhance_prompt(
                    base_prompt=base_prompt,
                    style=style,
                    industry=industry,
                    color="modern",
                    shape="circle"
                )
                variations[style] = enhanced
            
            logger.info(f"✅ Created {len(variations)} style variations")
            return variations
            
        except Exception as e:
            logger.error(f"❌ Error creating variations: {e}")
            return {}
    
    def save_enhanced_prompts(self, prompts: Dict[str, str], filename: str = "enhanced_prompts.json"):
        """Save enhanced prompts to file"""
        try:
            with open(filename, 'w') as f:
                json.dump(prompts, f, indent=2)
            logger.info(f"💾 Enhanced prompts saved to {filename}")
            return True
        except Exception as e:
            logger.error(f"❌ Error saving prompts: {e}")
            return False

def main():
    """Demo the prompt enhancer"""
    try:
        logger.info("🚀 Starting Logo Prompt Enhancer Demo...")
        
        # Initialize enhancer
        enhancer = LogoPromptEnhancer()
        
        # Demo prompts
        demo_prompts = [
            "tech startup logo",
            "healthcare company logo", 
            "creative agency logo",
            "financial services logo"
        ]
        
        enhanced_prompts = {}
        
        for prompt in demo_prompts:
            logger.info(f"\n📝 Processing: '{prompt}'")
            
            # Create style variations
            variations = enhancer.create_style_variations(prompt)
            enhanced_prompts[prompt] = variations
            
            # Show one example
            enhanced, negative = enhancer.enhance_prompt(
                base_prompt=prompt,
                style="professional",
                industry="tech",
                color="blue",
                shape="circle"
            )
            
            logger.info(f"✅ Enhanced: {enhanced[:100]}...")
            logger.info(f"❌ Negative: {negative[:100]}...")
        
        # Save all enhanced prompts
        enhancer.save_enhanced_prompts(enhanced_prompts)
        
        logger.info("\n🎉 Demo completed!")
        logger.info("📁 Enhanced prompts saved to 'enhanced_prompts.json'")
        logger.info("🔧 Use these enhanced prompts with your logo generation!")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Demo failed: {e}")
        return False

if __name__ == "__main__":
    main()


