#!/bin/bash

echo "🎨 Setting up Real Stable Diffusion Logo Generation..."
echo ""

echo "📋 Step 1: Get your Hugging Face API token"
echo "1. Go to: https://huggingface.co/settings/tokens"
echo "2. Click 'New token'"
echo "3. Name it 'Logo Generator'"
echo "4. Select 'Read' permissions"
echo "5. Click 'Generate a token'"
echo "6. Copy the token (starts with hf_)"
echo ""

read -p "🔑 Enter your Hugging Face API token: " HF_TOKEN

if [ -z "$HF_TOKEN" ]; then
    echo "❌ No token provided. Exiting..."
    exit 1
fi

echo ""
echo "📝 Adding token to .env.local..."

# Create or update .env.local
if [ -f ".env.local" ]; then
    # Update existing file
    if grep -q "HUGGINGFACE_API_KEY" .env.local; then
        sed -i '' "s/HUGGINGFACE_API_KEY=.*/HUGGINGFACE_API_KEY=$HF_TOKEN/" .env.local
        echo "✅ Updated existing HUGGINGFACE_API_KEY in .env.local"
    else
        echo "HUGGINGFACE_API_KEY=$HF_TOKEN" >> .env.local
        echo "✅ Added HUGGINGFACE_API_KEY to .env.local"
    fi
else
    # Create new file
    echo "HUGGINGFACE_API_KEY=$HF_TOKEN" > .env.local
    echo "✅ Created .env.local with HUGGINGFACE_API_KEY"
fi

echo ""
echo "🚀 Testing Stable Diffusion API..."

# Test the API
curl -s -X POST http://localhost:3000/api/generate-logo \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test logo", "options": {"style": "modern"}}' \
  | grep -q "stable-diffusion-xl"

if [ $? -eq 0 ]; then
    echo "✅ Stable Diffusion is working!"
    echo "🎨 You now have REAL AI-generated logos!"
else
    echo "⚠️  API test failed, but token is set up"
    echo "💡 Try restarting your Next.js server: npm run dev"
fi

echo ""
echo "🎯 Ready to generate real AI logos!"
echo "Visit your dashboard and try the logo generation feature."


