#!/bin/bash

# Start WebSocket Server for Real-time Collaboration
echo "🚀 Starting WebSocket Collaboration Server..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Set environment variables
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
export WS_PORT=3001
export WS_HOST=0.0.0.0

# Start the WebSocket server
echo "🌐 Starting WebSocket server on port $WS_PORT..."
python websocket_server.py

