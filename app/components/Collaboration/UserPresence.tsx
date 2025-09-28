'use client';

import React, { useState } from 'react';
import { useCollaboration } from '../../contexts/CollaborationContext';
import { Users, Eye, Edit, Shield } from 'lucide-react';

interface UserPresenceProps {
  className?: string;
  showTyping?: boolean;
  maxVisible?: number;
}

export default function UserPresence({ 
  className = '', 
  showTyping = true, 
  maxVisible = 5 
}: UserPresenceProps) {
  const { state, getCurrentUsers } = useCollaboration();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const users = getCurrentUsers();
  const visibleUsers = users.slice(0, maxVisible);
  const hiddenCount = users.length - maxVisible;

  if (users.length === 0) return null;

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'edit':
        return <Edit className="w-3 h-3" />;
      case 'view':
        return <Eye className="w-3 h-3" />;
      default:
        return <Eye className="w-3 h-3" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'admin':
        return 'text-purple-600';
      case 'edit':
        return 'text-green-600';
      case 'view':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* User avatars */}
      <div className="flex items-center space-x-1">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className="relative group"
            style={{ zIndex: users.length - index }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:scale-110 transition-transform duration-200"
              style={{ 
                backgroundColor: user.color,
                marginLeft: index > 0 ? '-8px' : '0'
              }}
              title={`${user.name} (${user.is_typing ? 'typing...' : 'online'})`}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            
            {/* Typing indicator */}
            {user.is_typing && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        ))}
        
        {/* More users indicator */}
        {hiddenCount > 0 && (
          <div
            className="w-8 h-8 rounded-full border-2 border-white shadow-sm bg-gray-500 flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:scale-110 transition-transform duration-200"
            style={{ marginLeft: '-8px' }}
            onClick={() => setIsExpanded(!isExpanded)}
            title={`${hiddenCount} more users`}
          >
            +{hiddenCount}
          </div>
        )}
      </div>

      {/* Expanded user list */}
      {isExpanded && (
        <div className="absolute top-10 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-64 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Online Users ({users.length})
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                
                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    {user.is_typing && (
                      <span className="text-xs text-yellow-600 font-medium">
                        typing...
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                
                {/* Status indicators */}
                <div className="flex items-center space-x-1">
                  {/* Online status */}
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  
                  {/* Permission indicator */}
                  <div className={getPermissionColor('edit')}>
                    {getPermissionIcon('edit')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {showTyping && Object.keys(state.typingUsers).length > 0 && (
        <div className="absolute top-10 left-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          {Object.values(state.typingUsers).map((user, index) => (
            <span key={user.name}>
              <span style={{ color: user.color }}>{user.name}</span>
              {index < Object.values(state.typingUsers).length - 1 ? ', ' : ''}
            </span>
          ))}
          {Object.keys(state.typingUsers).length === 1 ? ' is typing...' : ' are typing...'}
        </div>
      )}
    </div>
  );
}

