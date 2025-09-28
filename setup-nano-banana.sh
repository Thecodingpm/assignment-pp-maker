#!/bin/bash

echo "🍌 Setting up Nano Banana API for AI logo generation..."

# Create .env.local file with Nano Banana configuration
cat >> .env.local << EOF

# Nano Banana API Configuration
NANO_BANANA_API_KEY=your_nano_banana_api_key_here
NANO_BANANA_MODEL_ID=stabilityai/stable-diffusion-xl-base-1.0
NANO_BANANA_API_URL=http://localhost:5002
EOF

echo "✅ Added Nano Banana configuration to .env.local"
echo ""
echo "📝 Next steps:"
echo "1. Get your API key from https://nanobanana.ai"
echo "2. Replace 'your_nano_banana_api_key_here' in .env.local with your actual key"
echo "3. Install Python dependencies: pip install requests pillow flask flask-cors"
echo "4. Start the Nano Banana logo generator: python3 nano-banana-logo-generator.py"
echo "5. Start your Next.js app: npm run dev"
echo ""
echo "💰 Note: Nano Banana is a paid service. Check their pricing at https://nanobanana.ai/pricing"


