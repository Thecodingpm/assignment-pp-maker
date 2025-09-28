#!/usr/bin/env python3
"""
Test script for the WebSocket collaboration server
"""

import asyncio
import socketio
import json

# Test client
sio = socketio.AsyncClient()

@sio.event
async def connect():
    print("✅ Connected to WebSocket server")

@sio.event
async def disconnect():
    print("❌ Disconnected from WebSocket server")

@sio.event
async def user_joined(data):
    print(f"👤 User joined: {data}")

@sio.event
async def user_left(data):
    print(f"👤 User left: {data}")

@sio.event
async def document_state(data):
    print(f"📄 Document state: {data}")

@sio.event
async def document_updated(data):
    print(f"📝 Document updated: {data}")

async def test_collaboration():
    try:
        # Connect to server
        await sio.connect('http://localhost:3001', auth={
            'user_id': 'test_user_1',
            'user_name': 'Test User 1',
            'user_email': 'test1@example.com'
        })
        
        # Join a test document
        await sio.emit('join_document', {
            'document_id': 'test_doc_123',
            'user_name': 'Test User 1',
            'user_email': 'test1@example.com'
        })
        
        # Send a test operation
        await sio.emit('document_change', {
            'document_id': 'test_doc_123',
            'operation': {
                'type': 'insert',
                'elementId': 'test_element_1',
                'element': {
                    'id': 'test_element_1',
                    'type': 'text',
                    'content': 'Hello World!',
                    'x': 100,
                    'y': 100
                },
                'slideIndex': 0,
                'timestamp': 1234567890
            }
        })
        
        # Move cursor
        await sio.emit('cursor_move', {
            'document_id': 'test_doc_123',
            'position': {'x': 200, 'y': 300}
        })
        
        # Start typing
        await sio.emit('typing_start', {
            'document_id': 'test_doc_123',
            'element_id': 'test_element_1'
        })
        
        # Wait a bit
        await asyncio.sleep(2)
        
        # Stop typing
        await sio.emit('typing_stop', {
            'document_id': 'test_doc_123'
        })
        
        # Leave document
        await sio.emit('leave_document', {
            'document_id': 'test_doc_123'
        })
        
        # Disconnect
        await sio.disconnect()
        
        print("🎉 Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    print("🧪 Starting WebSocket collaboration test...")
    print("Make sure the WebSocket server is running on http://localhost:3001")
    asyncio.run(test_collaboration())

