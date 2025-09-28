#!/bin/bash

echo "🚀 Setting up Replicate Logo Generator (Production Ready)..."

# Install dependencies
pip install requests flask flask-cors

# Get Replicate API token
echo "📝 To use Replicate, you need an API token:"
echo "1. Go to https://replicate.com/account/api-tokens"
echo "2. Create a new token"
echo "3. Copy the token"
echo ""
echo "Then run:"
echo "export REPLICATE_API_TOKEN='your_token_here'"
echo "python replicate-logo-generator.py"
echo ""
echo "✅ Setup complete! This is the most reliable production solution."
