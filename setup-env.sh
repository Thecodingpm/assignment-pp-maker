#!/bin/bash

echo "🔧 Setting up environment variables for logo generation..."

# Create .env.local file
cat > .env.local << EOF
# Logo Generation API Configuration
GOOGLE_API_KEY=AIzaSyCbAVf7KAgBWI7G2iaC5djloq63HrAuwG0
FREE_LOCAL_API_URL=http://localhost:5001
REQUIRE_FREE_LOCAL=true

# Logo Generation Options
USE_MOCK_LOGO=false
REQUIRE_ENHANCED_SDXL=false

# Replicate API (if you want to use it later)
REPLICATE_API_TOKEN=your_replicate_token_here

# Enhanced Colab API (if you want to use Google Colab)
ENHANCED_COLAB_API_URL=your_colab_ngrok_url_here
EOF

echo "✅ Created .env.local file with your Google API key"
echo "📝 You can edit .env.local to add other API keys as needed"
echo ""
echo "🚀 Now you can run:"
echo "   npm run dev          # Start Next.js frontend"
echo "   python3 advanced-logo-generator.py  # Start logo generator backend"
