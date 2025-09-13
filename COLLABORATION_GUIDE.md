# Real-Time Collaboration Guide

## Overview

The Document Maker now supports real-time collaborative editing, allowing multiple users to work on the same document simultaneously. This guide explains how to use all the collaboration features.

## Features

### 🚀 Real-Time Collaboration
- **Live Document Editing**: Multiple users can edit the same document simultaneously (like Figma)
- **Real-Time Cursor Tracking**: See where other users are clicking and typing
- **User Presence**: Know who's currently active in the document
- **Session Management**: Create, join, and manage collaboration sessions
- **Operational Transformation**: Conflict-free real-time editing with character-level precision

### 👥 User Management
- **Session Creation**: Start a new collaboration session
- **Session Joining**: Join existing sessions via session ID or share link
- **User Avatars**: Visual representation of collaborators
- **Active Status**: Real-time status updates for all participants
- **Permission System**: Admin, Edit, and View-only permissions
- **Admin Controls**: Manage user permissions and session settings

### 📡 Real-Time Features
- **Live Cursor Sharing**: See other users' cursors in real-time
- **Document Synchronization**: Changes sync automatically every 2 seconds
- **Presence Updates**: User activity status updates every 30 seconds
- **Session Persistence**: Sessions remain active until manually ended
- **Typing Indicators**: See when other users are typing
- **Character-Level Editing**: Real-time character insertion and deletion
- **Selection Sharing**: See other users' text selections

## How to Use

### Starting a Collaboration Session

1. **Open the Document Editor**
   - Navigate to `/assignment-editor/editor`
   - Create a new document or open an existing one

2. **Click the "Team Up" Button**
   - Located in the top navigation bar
   - Purple button with a people icon

3. **Start a New Session**
   - Click "Start Collaboration Session"
   - The system will create a unique session ID
   - A share link will be generated automatically
   - You'll have admin permissions by default

### Joining an Existing Session

1. **Get the Session Information**
   - Ask the session owner for the session ID or share link
   - The session ID looks like: `session_doc123_1703123456789`

2. **Join the Session**
   - Click "Team Up" in the navigation
   - Enter the session ID in the "Join Existing Session" field
   - Select your desired permission level (View or Edit)
   - Click "Join"

3. **Alternative: Use Share Link**
   - Click the share link provided by the session owner
   - You'll be automatically redirected to the collaboration session

### During Collaboration

#### Real-Time Features
- **Cursor Tracking**: See other users' cursors moving in real-time
- **User Presence**: View who's currently active in the session
- **Live Updates**: Document changes sync automatically
- **Session Info**: Monitor session status and participant count

#### Session Management
- **Copy Session ID**: Click the copy button next to the session ID
- **Share Link**: Use the generated share link to invite others
- **Leave Session**: Click "Leave Session" to exit collaboration
- **End Session**: Session owner can end the session for everyone
- **Permission Management**: Admins can change user permissions
- **Session Settings**: Control who can view and edit

### Collaboration Panel

The collaboration panel shows:

1. **Session Information**
   - Session ID (with copy button)
   - Share link (with copy button)

2. **Active Collaborators**
   - List of all participants
   - User avatars and names
   - Active status indicators
   - Permission badges (👑 Admin, ✏️ Edit, 👁️ View)
   - "(You)" indicator for current user
   - Admin controls for permission management

3. **Session Controls**
   - Leave Session button
   - End Session button (for admins only)
   - Admin Settings panel (for admins only)
     - Allow/Disallow viewers
     - Allow/Disallow editing
     - Require approval for edits

## Technical Details

### Firebase Integration

The collaboration system uses Firebase Firestore for real-time data:

- **Collections Used**:
  - `collaboration_sessions`: Stores session information
  - `presence`: Tracks user presence and cursor positions
  - `document_sync`: Synchronizes document content

### Real-Time Updates

- **Cursor Position**: Updates every 100ms on mouse movement
- **User Presence**: Updates every 30 seconds
- **Document Content**: Syncs every 2 seconds
- **Session Status**: Real-time updates via Firebase listeners
- **Edit Operations**: Character-level operations sent immediately
- **Typing Indicators**: Updates every 1 second when typing
- **Selection Changes**: Real-time selection sharing

### Security

- **User Authentication**: Requires Firebase Auth
- **Session Validation**: Only authenticated users can join sessions
- **Data Privacy**: Session data is isolated per session
- **Permission System**: Role-based access control
- **Admin Controls**: Only admins can manage permissions and settings
- **Session Settings**: Granular control over viewer and editor access

## Troubleshooting

### Common Issues

1. **Can't Join Session**
   - Verify the session ID is correct
   - Ensure you're logged in
   - Check if the session is still active

2. **Cursor Not Showing**
   - Refresh the page
   - Check your internet connection
   - Ensure you're in the collaboration session

3. **Changes Not Syncing**
   - Wait a few seconds for automatic sync
   - Check your internet connection
   - Try refreshing the page

4. **Session Disconnected**
   - The session may have ended
   - Check with the session owner
   - Try joining again with a new session ID

### Performance Tips

- **Limit Participants**: For best performance, limit sessions to 5-10 users
- **Stable Connection**: Use a stable internet connection
- **Browser Compatibility**: Use modern browsers (Chrome, Firefox, Safari, Edge)

## API Reference

### Collaboration Functions

```typescript
// Create a new collaboration session
createCollaborationSession(
  documentId: string,
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  ownerAvatar: string
): Promise<string>

// Join an existing session
joinCollaborationSession(
  sessionId: string,
  userId: string,
  userName: string,
  userEmail: string,
  userAvatar: string
): Promise<void>

// Leave a session
leaveCollaborationSession(
  sessionId: string,
  userId: string
): Promise<void>

// Update user presence
updateUserPresence(
  sessionId: string,
  userId: string,
  cursorPosition?: { x: number; y: number }
): Promise<void>

// Subscribe to session changes
subscribeToCollaborationSession(
  sessionId: string,
  callback: (session: CollaborationSession | null) => void
): () => void

// Subscribe to user presence
subscribeToUserPresence(
  sessionId: string,
  callback: (presence: any[]) => void
): () => void

// Sync document content
syncDocumentContent(
  sessionId: string,
  content: string,
  userId: string
): Promise<void>
```

## Permission System

### Permission Levels

1. **👑 Admin**
   - Full control over the session
   - Can change user permissions
   - Can modify session settings
   - Can end the session
   - Can edit the document

2. **✏️ Edit**
   - Can edit the document in real-time
   - Can see other users' cursors and selections
   - Cannot change permissions or settings

3. **👁️ View**
   - Can only view the document
   - Cannot make any edits
   - Can see other users' cursors
   - Cannot change permissions or settings

### Admin Controls

Admins have access to:
- **User Management**: Change any user's permission level
- **Session Settings**: Control who can view and edit
- **Session Control**: End the session for all participants

## Future Enhancements

Planned features for future releases:

- **Comments and Annotations**: Add comments to specific parts of the document
- **Version History**: Track changes and revert to previous versions
- **Advanced Permissions**: More granular permission levels
- **Chat Integration**: Built-in chat for collaborators
- **File Sharing**: Share additional files within the session
- **Offline Support**: Work offline and sync when reconnected
- **Approval Workflow**: Require approval for specific edits

## Support

If you encounter any issues with the collaboration features:

1. Check this guide for troubleshooting steps
2. Verify your internet connection
3. Try refreshing the page
4. Contact support with the session ID and error details

---

**Note**: The collaboration features require a stable internet connection and work best with modern browsers. Session data is stored temporarily and may be cleared after extended periods of inactivity. 