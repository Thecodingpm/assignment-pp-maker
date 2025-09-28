#!/bin/bash

# Enhanced Logo Pipeline Setup Script
echo "🎨 Setting up Enhanced Logo Pipeline..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Starting Enhanced Logo Pipeline Setup..."

# Step 1: Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cat > .env.local << EOF
# Enhanced AI Logo Generation Configuration

# OpenAI API Configuration (for DALL-E fallback)
OPENAI_API_KEY=your_openai_api_key_here

# Enhanced SDXL Colab Inference Server (ngrok URL)
ENHANCED_COLAB_API_URL=https://YOUR_ENHANCED_NGROK_URL_HERE

# Require Enhanced SDXL server (disable mocks, fail if unreachable)
REQUIRE_ENHANCED_SDXL=false

# Original SDXL Configuration (fallback)
COLAB_API_URL=https://YOUR_ORIGINAL_NGROK_URL_HERE
REQUIRE_SDXL=false

# Enhanced Features Configuration
ENABLE_CONTROLNET=true
ENABLE_UPSCALING=true
ENABLE_SVG_CONVERSION=true

# LoRA Configuration (if using custom LoRA)
LORA_ENABLED=true
LORA_NAME=logo_lora
LORA_SCALE=0.8

# Upscaling Configuration
UPSCALE_FACTOR=2
UPSCALE_MODEL=RealESRGAN_x4plus

# Vector Conversion Configuration
VECTOR_CONVERSION_METHOD=potrace
VECTOR_QUALITY=high
EOF
    print_success ".env.local file created"
else
    print_warning ".env.local already exists, skipping creation"
fi

# Step 2: Install dependencies
print_status "Installing Node.js dependencies..."
npm install

# Step 3: Check if servers are running
print_status "Checking server status..."

# Check Next.js server
if curl -s http://localhost:3000 > /dev/null; then
    print_success "Next.js server is running on http://localhost:3000"
else
    print_warning "Next.js server is not running. Please start it with: npm run dev"
fi

# Check Flask backend
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Flask backend is running on http://localhost:5001"
else
    print_warning "Flask backend is not running. Please start it with: cd backend && source venv/bin/activate && python app.py"
fi

# Step 4: Test API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
if curl -s http://localhost:3000/api/health > /dev/null; then
    print_success "Health endpoint is accessible"
else
    print_error "Health endpoint is not accessible"
fi

# Step 5: Display next steps
echo ""
print_status "Setup completed! Next steps:"
echo ""
echo "1. 📝 Edit .env.local with your actual API keys and URLs:"
echo "   - Add your OpenAI API key"
echo "   - Add your ngrok URL from Google Colab"
echo ""
echo "2. 🚀 Set up Google Colab:"
echo "   - Upload enhanced-logo-generator.ipynb to Google Colab"
echo "   - Run all cells in the notebook"
echo "   - Copy the ngrok URL to .env.local"
echo ""
echo "3. 🧪 Test the pipeline:"
echo "   - Run: node test-enhanced-pipeline.js"
echo "   - Or test through the web interface at http://localhost:3000"
echo ""
echo "4. 🎨 Use the enhanced features:"
echo "   - Shape control (circle, square, hexagon, triangle)"
echo "   - AI upscaling for high resolution"
echo "   - Vector output for scalability"
echo ""

print_success "Enhanced Logo Pipeline setup complete! 🎉"

