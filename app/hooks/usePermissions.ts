'use client';

import { useCallback, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';

export type PermissionLevel = 'owner' | 'admin' | 'edit' | 'view';

export interface UserPermission {
  userId: string;
  permission: PermissionLevel;
  grantedBy: string;
  grantedAt: string;
}

export interface DocumentPermissions {
  documentId: string;
  ownerId: string;
  permissions: UserPermission[];
  isPublic: boolean;
  publicPermission: PermissionLevel;
}

export function usePermissions(documentId: string, permissions?: DocumentPermissions) {
  const { user } = useAuth();

  const currentUserPermission = useMemo(() => {
    if (!user || !permissions) return 'view';
    
    // Owner has full access
    if (permissions.ownerId === user.id) return 'owner';
    
    // Check user-specific permissions
    const userPermission = permissions.permissions.find(p => p.userId === user.id);
    if (userPermission) return userPermission.permission;
    
    // Check public permission
    if (permissions.isPublic) return permissions.publicPermission;
    
    return 'view';
  }, [user, permissions]);

  const canEdit = useCallback(() => {
    return ['owner', 'admin', 'edit'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canAdmin = useCallback(() => {
    return ['owner', 'admin'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canView = useCallback(() => {
    return ['owner', 'admin', 'edit', 'view'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canDelete = useCallback(() => {
    return ['owner', 'admin'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canInvite = useCallback(() => {
    return ['owner', 'admin'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canChangePermissions = useCallback(() => {
    return currentUserPermission === 'owner';
  }, [currentUserPermission]);

  const canExport = useCallback(() => {
    return ['owner', 'admin', 'edit'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const canPresent = useCallback(() => {
    return ['owner', 'admin', 'edit', 'view'].includes(currentUserPermission);
  }, [currentUserPermission]);

  const getPermissionColor = useCallback((permission: PermissionLevel) => {
    switch (permission) {
      case 'owner':
        return 'text-purple-600 bg-purple-100';
      case 'admin':
        return 'text-red-600 bg-red-100';
      case 'edit':
        return 'text-green-600 bg-green-100';
      case 'view':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const getPermissionIcon = useCallback((permission: PermissionLevel) => {
    switch (permission) {
      case 'owner':
        return '👑';
      case 'admin':
        return '🛡️';
      case 'edit':
        return '✏️';
      case 'view':
        return '👁️';
      default:
        return '❓';
    }
  }, []);

  const getPermissionDescription = useCallback((permission: PermissionLevel) => {
    switch (permission) {
      case 'owner':
        return 'Full control including deleting document and managing permissions';
      case 'admin':
        return 'Can edit, invite users, and manage most settings';
      case 'edit':
        return 'Can edit content and add elements';
      case 'view':
        return 'Can only view the document';
      default:
        return 'Unknown permission level';
    }
  }, []);

  return {
    currentUserPermission,
    canEdit,
    canAdmin,
    canView,
    canDelete,
    canInvite,
    canChangePermissions,
    canExport,
    canPresent,
    getPermissionColor,
    getPermissionIcon,
    getPermissionDescription,
  };
}

