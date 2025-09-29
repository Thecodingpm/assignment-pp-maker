// ===== STRUCTURED DOCUMENT EDITOR TYPES =====

// User role types
export type UserRole = 'user' | 'admin';

// User interface with role
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
}

// Base styling interface for document blocks
export interface BlockStyling {
  fontSize?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor?: string;
  borderRadius?: string;
  boxShadow?: string;
}

// Individual document block interface
export interface DocumentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'table';
  content: string;
  styling: {
    fontSize?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
    fontWeight?: string;
    marginTop?: string;
    marginBottom?: string;
  };
  level?: number; // for headings
  listType?: 'bullet' | 'numbered'; // for lists
  imageUrl?: string; // for images
}

// Table data structure
export interface TableData {
  headers: string[];
  rows: string[][];
  styling: {
    borderWidth?: string;
    borderColor?: string;
    headerBackground?: string;
    headerColor?: string;
    rowBackground?: string;
    rowColor?: string;
    cellPadding?: string;
  };
}

// Main structured document interface
export interface StructuredDocument {
  id: string;
  title: string;
  blocks: DocumentBlock[];
  metadata: {
    originalFileName: string;
    createdAt: string;
    lastModified: string;
  };
}

// Editor state interface
export interface EditorState {
  selectedBlockId: string | null;
  isEditing: boolean;
  isFullscreen: boolean;
  zoomLevel: number;
  showGrid: boolean;
  showRulers: boolean;
  autoSave: boolean;
  lastSaved: string | null;
}

// Block operation types
export type BlockOperation = 
  | { type: 'ADD_BLOCK'; block: DocumentBlock; position: number }
  | { type: 'UPDATE_BLOCK'; id: string; updates: Partial<DocumentBlock> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; id: string; newPosition: number }
  | { type: 'DUPLICATE_BLOCK'; id: string }
  | { type: 'MERGE_BLOCKS'; sourceId: string; targetId: string }
  | { type: 'SPLIT_BLOCK'; id: string; splitIndex: number };

// Document history for undo/redo
export interface DocumentHistory {
  past: StructuredDocument[];
  present: StructuredDocument;
  future: StructuredDocument[];
}

// Export format types
export type ExportFormat = 'pdf' | 'docx' | 'html' | 'txt' | 'json';

// Export options interface
export interface ExportOptions {
  format: ExportFormat;
  includeMetadata?: boolean;
  includeStyling?: boolean;
  pageBreaks?: boolean;
  watermark?: string;
  header?: string;
  footer?: string;
  quality?: 'low' | 'medium' | 'high';
}

// Template interface for reusable document structures
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  document: StructuredDocument;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  usageCount: number;
}

// Editor template interface for presentation templates
export interface EditorTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  slides: any[]; // Editor slides from useEditorStore
  createdBy: string;
  createdByRole: UserRole;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  usageCount: number;
  tags: string[];
}

// Template creation data
export interface TemplateCreationData {
  title: string;
  description: string;
  category: string;
  thumbnail?: string;
  slides: any[];
  tags?: string[];
}

// Collaboration types
export interface CollaborationSession {
  id: string;
  documentId: string;
  participants: CollaborationParticipant[];
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

export interface CollaborationParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'editor' | 'viewer';
  cursorPosition?: { blockId: string; offset: number };
  isOnline: boolean;
  lastSeen: string;
}

// Plugin system types
export interface DocumentPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  blockTypes?: string[];
  commands?: PluginCommand[];
  settings?: PluginSetting[];
  isEnabled: boolean;
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  execute: (document: StructuredDocument, context: any) => StructuredDocument;
}

export interface PluginSetting {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color';
  defaultValue: any;
  options?: any[];
  description: string;
}

// Validation types
export interface ValidationError {
  blockId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Search and filter types
export interface SearchFilter {
  text?: string;
  blockTypes?: string[];
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  author?: string;
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number;
  saveTime: number;
  exportTime: number;
  memoryUsage: number;
  blockCount: number;
  documentSize: number;
}

// Utility types
export type BlockType = DocumentBlock['type'];
export type StylingProperty = keyof BlockStyling;

// Event types for the editor
export interface EditorEvents {
  onBlockSelect: (blockId: string) => void;
  onBlockUpdate: (block: DocumentBlock) => void;
  onDocumentSave: (document: StructuredDocument) => void;
  onDocumentExport: (document: StructuredDocument, format: ExportFormat) => void;
  onError: (error: Error) => void;
}

// Configuration types
export interface EditorConfig {
  allowEditing: boolean;
  allowExport: boolean;
  allowCollaboration: boolean;
  autoSaveInterval: number;
  maxUndoSteps: number;
  defaultBlockTypes: BlockType[];
  customBlockTypes: BlockType[];
  plugins: DocumentPlugin[];
  theme: 'light' | 'dark' | 'auto';
  language: string;
}
