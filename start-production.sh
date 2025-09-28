#!/bin/bash

echo "🚀 Starting Production Logo Generator..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.8+"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv-production" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv-production
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv-production/bin/activate

# Install requirements
echo "📥 Installing requirements..."
pip install -r requirements-production.txt

# Start the server
echo "🎯 Starting logo generator server..."
python production-logo-generator.py
