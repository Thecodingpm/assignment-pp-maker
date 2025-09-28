# Real-time Collaboration System Setup Guide

## 🚀 Overview

This guide will help you set up the complete real-time collaboration system with WebSocket, user presence, operational transformation, and role-based permissions.

## 📋 Features Implemented

✅ **WebSocket Server** - Real-time communication using Socket.IO  
✅ **User Presence** - See who's online and what they're doing  
✅ **Real-time Sync** - Changes sync instantly across all users  
✅ **Cursor Indicators** - See other users' cursors with different colors  
✅ **Operational Transformation** - Conflict-free editing with OT  
✅ **Auto-save** - Automatic document saving every 2 seconds  
✅ **Version History** - Undo/redo with full history tracking  
✅ **Role System** - Owner, Admin, Edit, View permissions  

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Frontend dependencies (already installed)
npm install socket.io socket.io-client @types/socket.io-client

# Backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Start the WebSocket Server

```bash
# Option 1: Using the startup script
cd backend
./start_websocket.sh

# Option 2: Manual start
cd backend
python websocket_server.py
```

The WebSocket server will start on `http://localhost:3001`

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### 4. Start the Frontend

```bash
npm run dev
```

## 🎯 How to Use

### 1. **Enable Collaboration**

- Open any presentation editor (`/presentation-editor?id=your-document-id`)
- The collaboration system automatically activates when a document ID is provided
- You'll see a green status bar indicating "Live Collaboration Active"

### 2. **User Presence**

- **Online Users**: See who's currently viewing the document
- **User Avatars**: Color-coded avatars for each user
- **Typing Indicators**: See when someone is typing
- **Cursor Tracking**: Real-time cursor positions with user names

### 3. **Real-time Editing**

- **Instant Sync**: All changes sync immediately across users
- **Conflict Resolution**: Operational Transformation prevents conflicts
- **Auto-save**: Document saves automatically every 2 seconds
- **Version History**: Full undo/redo support with action tracking

### 4. **Permission System**

- **Owner**: Full control, can delete document and manage permissions
- **Admin**: Can edit, invite users, and manage settings
- **Edit**: Can edit content and add elements
- **View**: Can only view the document

## 🔧 Technical Architecture

### Backend (WebSocket Server)

```
backend/websocket_server.py
├── Socket.IO server on port 3001
├── Operational Transformation engine
├── User presence management
├── Document session handling
└── Real-time event broadcasting
```

### Frontend (React Components)

```
app/contexts/CollaborationContext.tsx     # Main collaboration context
app/hooks/useRealtimeCollaboration.ts     # Real-time collaboration hook
app/hooks/useVersionHistory.ts            # Version history & undo/redo
app/hooks/usePermissions.ts               # Role-based permissions
app/hooks/useAutoSave.ts                  # Auto-save functionality
app/components/Collaboration/
├── UserPresence.tsx                      # User presence UI
└── CursorIndicator.tsx                   # Cursor indicators
```

## 🎨 UI Components

### 1. **Collaboration Status Bar**
- Shows when collaboration is active
- Displays online user count
- Green indicator with pulse animation

### 2. **User Presence Panel**
- Color-coded user avatars
- Online/offline indicators
- Typing status
- Expandable user list with details

### 3. **Cursor Indicators**
- Real-time cursor positions
- User names and colors
- Smooth animations
- Non-intrusive overlay

## 🔄 Real-time Events

### Client → Server
- `join_document` - Join a document session
- `leave_document` - Leave a document session
- `document_change` - Send document changes
- `cursor_move` - Update cursor position
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server → Client
- `user_joined` - User joined the document
- `user_left` - User left the document
- `document_state` - Current document state
- `document_updated` - Document was updated
- `cursor_moved` - User moved cursor
- `user_typing` - User is typing
- `user_stopped_typing` - User stopped typing

## 🛡️ Security & Permissions

### Permission Levels

1. **Owner** 👑
   - Full document control
   - Can delete document
   - Can manage all permissions
   - Can invite/remove users

2. **Admin** 🛡️
   - Can edit content
   - Can invite users
   - Can manage most settings
   - Cannot delete document

3. **Edit** ✏️
   - Can edit content
   - Can add/remove elements
   - Cannot invite users
   - Cannot change permissions

4. **View** 👁️
   - Can only view document
   - Cannot make any changes
   - Cannot invite users

### Security Features

- **Authentication Required**: Users must be logged in
- **Document-based Access**: Permissions tied to specific documents
- **Real-time Validation**: Server validates all operations
- **Rate Limiting**: Prevents spam and abuse
- **Input Sanitization**: All inputs are sanitized

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running on port 3001
   - Verify `NEXT_PUBLIC_WS_URL` environment variable
   - Check browser console for connection errors

2. **Changes Not Syncing**
   - Ensure document has a valid ID (not 'new')
   - Check WebSocket connection status
   - Verify user permissions

3. **Cursor Indicators Not Showing**
   - Check if `CursorIndicator` component is properly mounted
   - Verify container ref is correct
   - Check zoom level settings

4. **Auto-save Not Working**
   - Ensure document ID is valid
   - Check network connectivity
   - Verify API endpoints are accessible

### Debug Mode

Enable debug logging by adding to your browser console:

```javascript
localStorage.setItem('collaboration_debug', 'true');
```

## 📊 Performance Considerations

### Optimization Features

- **Debounced Operations**: Cursor and typing events are debounced
- **Selective Updates**: Only changed elements are synced
- **History Limiting**: Version history limited to 50 states
- **Connection Pooling**: Efficient WebSocket connection management
- **Memory Management**: Automatic cleanup of disconnected users

### Monitoring

- **Connection Status**: Real-time connection monitoring
- **User Activity**: Track active users and their actions
- **Performance Metrics**: Monitor sync times and operation counts
- **Error Tracking**: Comprehensive error logging

## 🔮 Future Enhancements

### Planned Features

- **Voice Chat**: Integrated voice communication
- **Video Calls**: Video collaboration features
- **Comments System**: Document commenting and feedback
- **Live Cursors**: More advanced cursor interactions
- **Conflict Resolution UI**: Visual conflict resolution
- **Offline Support**: Work offline with sync when reconnected
- **Mobile Support**: Optimized mobile collaboration

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all services are running
3. Check network connectivity
4. Review the troubleshooting section above

## 🎉 Success!

Your real-time collaboration system is now fully set up and ready to use! Users can now collaborate in real-time with full conflict resolution, user presence, and role-based permissions.

---

**Happy Collaborating! 🚀**

