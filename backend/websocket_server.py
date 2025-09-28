#!/usr/bin/env python3
"""
WebSocket Server for Real-time Collaboration
Handles user presence, document synchronization, and operational transformation
"""

import asyncio
import json
import logging
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set
from dataclasses import dataclass, asdict
from collections import defaultdict

import socketio
from aiohttp import web
import aiohttp_cors

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Socket.IO server
sio = socketio.AsyncServer(
    cors_allowed_origins="*",
    logger=True,
    engineio_logger=True
)

# Create web application
app = web.Application()
sio.attach(app)

# Configure CORS
cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
        allow_credentials=True,
        expose_headers="*",
        allow_headers="*",
        allow_methods="*"
    )
})

# Data structures for collaboration
@dataclass
class User:
    id: str
    name: str
    email: str
    color: str
    cursor_position: Optional[Dict] = None
    last_seen: Optional[datetime] = None
    is_active: bool = True

@dataclass
class DocumentSession:
    document_id: str
    users: Dict[str, User]
    content: Dict
    version: int
    last_modified: datetime
    owner_id: str

# In-memory storage (in production, use Redis or database)
document_sessions: Dict[str, DocumentSession] = {}
user_sessions: Dict[str, str] = {}  # socket_id -> user_id
user_colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
]

# Operational Transformation for conflict resolution
class OperationalTransform:
    def __init__(self):
        self.operations = []
    
    def apply_operation(self, doc: Dict, operation: Dict) -> Dict:
        """Apply an operation to the document"""
        op_type = operation.get('type')
        element_id = operation.get('elementId')
        
        if op_type == 'insert':
            return self._insert_element(doc, operation)
        elif op_type == 'update':
            return self._update_element(doc, operation)
        elif op_type == 'delete':
            return self._delete_element(doc, operation)
        elif op_type == 'move':
            return self._move_element(doc, operation)
        
        return doc
    
    def _insert_element(self, doc: Dict, operation: Dict) -> Dict:
        """Insert a new element"""
        element = operation.get('element')
        if 'slides' in doc and element:
            slide_index = operation.get('slideIndex', 0)
            if slide_index < len(doc['slides']):
                if 'elements' not in doc['slides'][slide_index]:
                    doc['slides'][slide_index]['elements'] = []
                doc['slides'][slide_index]['elements'].append(element)
        return doc
    
    def _update_element(self, doc: Dict, operation: Dict) -> Dict:
        """Update an existing element"""
        element_id = operation.get('elementId')
        updates = operation.get('updates', {})
        
        if 'slides' in doc:
            for slide in doc['slides']:
                if 'elements' in slide:
                    for element in slide['elements']:
                        if element.get('id') == element_id:
                            element.update(updates)
                            break
        return doc
    
    def _delete_element(self, doc: Dict, operation: Dict) -> Dict:
        """Delete an element"""
        element_id = operation.get('elementId')
        
        if 'slides' in doc:
            for slide in doc['slides']:
                if 'elements' in slide:
                    slide['elements'] = [
                        el for el in slide['elements'] 
                        if el.get('id') != element_id
                    ]
        return doc
    
    def _move_element(self, doc: Dict, operation: Dict) -> Dict:
        """Move an element to a new position"""
        element_id = operation.get('elementId')
        new_position = operation.get('newPosition', {})
        
        if 'slides' in doc:
            for slide in doc['slides']:
                if 'elements' in slide:
                    for element in slide['elements']:
                        if element.get('id') == element_id:
                            element.update(new_position)
                            break
        return doc

ot = OperationalTransform()

# Utility functions
def get_user_color(user_id: str) -> str:
    """Get a consistent color for a user"""
    hash_val = hash(user_id) % len(user_colors)
    return user_colors[hash_val]

def get_document_session(document_id: str) -> Optional[DocumentSession]:
    """Get or create a document session"""
    if document_id not in document_sessions:
        document_sessions[document_id] = DocumentSession(
            document_id=document_id,
            users={},
            content={},
            version=0,
            last_modified=datetime.now(),
            owner_id=""
        )
    return document_sessions[document_id]

# Socket.IO event handlers
@sio.event
async def connect(sid, environ, auth):
    """Handle client connection"""
    logger.info(f"Client connected: {sid}")
    
    # Extract user info from auth or headers
    user_id = auth.get('user_id') if auth else None
    user_name = auth.get('user_name', 'Anonymous') if auth else 'Anonymous'
    user_email = auth.get('user_email', '') if auth else ''
    
    if not user_id:
        user_id = str(uuid.uuid4())
    
    user_sessions[sid] = user_id
    
    # Create user object
    user = User(
        id=user_id,
        name=user_name,
        email=user_email,
        color=get_user_color(user_id),
        last_seen=datetime.now()
    )
    
    await sio.emit('user_connected', {
        'user': asdict(user),
        'sid': sid
    }, room=None, skip_sid=sid)

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    logger.info(f"Client disconnected: {sid}")
    
    user_id = user_sessions.get(sid)
    if user_id:
        # Remove user from all document sessions
        for doc_id, session in document_sessions.items():
            if user_id in session.users:
                del session.users[user_id]
                
                # Notify other users in this document
                await sio.emit('user_left', {
                    'user_id': user_id,
                    'document_id': doc_id
                }, room=doc_id, skip_sid=sid)
        
        del user_sessions[sid]

@sio.event
async def join_document(sid, data):
    """Join a document session"""
    document_id = data.get('document_id')
    user_id = user_sessions.get(sid)
    
    if not document_id or not user_id:
        return
    
    # Get or create document session
    session = get_document_session(document_id)
    
    # Add user to session
    user = User(
        id=user_id,
        name=data.get('user_name', 'Anonymous'),
        email=data.get('user_email', ''),
        color=get_user_color(user_id),
        last_seen=datetime.now()
    )
    
    session.users[user_id] = user
    
    # Join the room for this document
    await sio.enter_room(sid, document_id)
    
    # Send current document state to the new user
    await sio.emit('document_state', {
        'content': session.content,
        'version': session.version,
        'users': {uid: asdict(u) for uid, u in session.users.items()}
    }, room=sid)
    
    # Notify other users about the new user
    await sio.emit('user_joined', {
        'user': asdict(user),
        'document_id': document_id
    }, room=document_id, skip_sid=sid)
    
    logger.info(f"User {user_id} joined document {document_id}")

@sio.event
async def leave_document(sid, data):
    """Leave a document session"""
    document_id = data.get('document_id')
    user_id = user_sessions.get(sid)
    
    if not document_id or not user_id:
        return
    
    # Remove user from session
    if document_id in document_sessions:
        session = document_sessions[document_id]
        if user_id in session.users:
            del session.users[user_id]
    
    # Leave the room
    await sio.leave_room(sid, document_id)
    
    # Notify other users
    await sio.emit('user_left', {
        'user_id': user_id,
        'document_id': document_id
    }, room=document_id, skip_sid=sid)
    
    logger.info(f"User {user_id} left document {document_id}")

@sio.event
async def document_change(sid, data):
    """Handle document changes with operational transformation"""
    document_id = data.get('document_id')
    operation = data.get('operation')
    user_id = user_sessions.get(sid)
    
    if not document_id or not operation or not user_id:
        return
    
    # Get document session
    session = get_document_session(document_id)
    
    # Check if user has permission to edit
    user = session.users.get(user_id)
    if not user:
        return
    
    # Apply operation using OT
    session.content = ot.apply_operation(session.content, operation)
    session.version += 1
    session.last_modified = datetime.now()
    
    # Broadcast change to other users in the document
    await sio.emit('document_updated', {
        'operation': operation,
        'version': session.version,
        'user_id': user_id,
        'timestamp': session.last_modified.isoformat()
    }, room=document_id, skip_sid=sid)
    
    logger.info(f"Document {document_id} updated by user {user_id}")

@sio.event
async def cursor_move(sid, data):
    """Handle cursor movement"""
    document_id = data.get('document_id')
    position = data.get('position')
    user_id = user_sessions.get(sid)
    
    if not document_id or not position or not user_id:
        return
    
    # Update user's cursor position
    session = get_document_session(document_id)
    if user_id in session.users:
        session.users[user_id].cursor_position = position
        session.users[user_id].last_seen = datetime.now()
        
        # Broadcast cursor position to other users
        await sio.emit('cursor_moved', {
            'user_id': user_id,
            'position': position,
            'user_name': session.users[user_id].name,
            'user_color': session.users[user_id].color
        }, room=document_id, skip_sid=sid)

@sio.event
async def typing_start(sid, data):
    """Handle typing start"""
    document_id = data.get('document_id')
    element_id = data.get('element_id')
    user_id = user_sessions.get(sid)
    
    if not document_id or not user_id:
        return
    
    session = get_document_session(document_id)
    if user_id in session.users:
        await sio.emit('user_typing', {
            'user_id': user_id,
            'user_name': session.users[user_id].name,
            'user_color': session.users[user_id].color,
            'element_id': element_id
        }, room=document_id, skip_sid=sid)

@sio.event
async def typing_stop(sid, data):
    """Handle typing stop"""
    document_id = data.get('document_id')
    user_id = user_sessions.get(sid)
    
    if not document_id or not user_id:
        return
    
    await sio.emit('user_stopped_typing', {
        'user_id': user_id
    }, room=document_id, skip_sid=sid)

@sio.event
async def request_document_state(sid, data):
    """Send current document state to requesting client"""
    document_id = data.get('document_id')
    user_id = user_sessions.get(sid)
    
    if not document_id or not user_id:
        return
    
    session = get_document_session(document_id)
    
    await sio.emit('document_state', {
        'content': session.content,
        'version': session.version,
        'users': {uid: asdict(u) for uid, u in session.users.items()},
        'last_modified': session.last_modified.isoformat()
    }, room=sid)

# Health check endpoint
async def health_check(request):
    """Health check endpoint"""
    return web.json_response({
        'status': 'healthy',
        'active_sessions': len(user_sessions),
        'active_documents': len(document_sessions),
        'timestamp': datetime.now().isoformat()
    })

# Add routes
app.router.add_get('/health', health_check)

# Configure CORS for specific routes (skip Socket.IO routes)
for route in list(app.router.routes()):
    if not route.resource.canonical.startswith('/socket.io'):
        cors.add(route)

if __name__ == '__main__':
    logger.info("Starting WebSocket server...")
    web.run_app(app, host='0.0.0.0', port=3001)
