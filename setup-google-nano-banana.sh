#!/bin/bash

echo "🍌 Setting up Google Nano Banana (FREE AI model) for logo generation..."

# Create .env.local file with Google Nano Banana configuration
cat >> .env.local << EOF

# Google Nano Banana API Configuration (FREE)
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_NANO_API_URL=http://localhost:5003
EOF

echo "✅ Added Google Nano Banana configuration to .env.local"
echo ""
echo "📝 Next steps:"
echo "1. Get your FREE Google API key from: https://aistudio.google.com/app/apikey"
echo "2. Replace 'your_google_api_key_here' in .env.local with your actual key"
echo "3. Install Python dependencies: pip install requests pillow flask flask-cors"
echo "4. Start the Google Nano Banana logo generator: python3 google-nano-banana-logo-generator.py"
echo "5. Start your Next.js app: npm run dev"
echo ""
echo "💰 Note: Google Nano Banana is COMPLETELY FREE!"
echo "🎯 This uses Google's Gemini 1.5 Flash model for AI logo generation"


