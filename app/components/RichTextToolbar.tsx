'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FormattingUtils,
  KeyboardShortcuts,
  MARK_TYPES,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  COLOR_OPTIONS,
  ALIGNMENT_OPTIONS,
  ELEMENT_TYPES,
} from '../utils/slateConfig';

interface RichTextToolbarProps {
  editor: any;
  isVisible?: boolean;
  onFormatChange?: () => void;
}

const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  editor,
  isVisible = true,
  onFormatChange,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const bgColorPickerRef = useRef<HTMLDivElement>(null);

  // Close color pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (bgColorPickerRef.current && !bgColorPickerRef.current.contains(event.target as Node)) {
        setShowBgColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormatToggle = (format: string) => {
    FormattingUtils.toggleFormat(editor, format);
    onFormatChange?.();
  };

  const handleColorSelect = (color: string) => {
    FormattingUtils.setTextColor(editor, color);
    setShowColorPicker(false);
    onFormatChange?.();
  };

  const handleBgColorSelect = (color: string) => {
    FormattingUtils.setBackgroundColor(editor, color);
    setShowBgColorPicker(false);
    onFormatChange?.();
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    FormattingUtils.setFontFamily(editor, fontFamily);
    onFormatChange?.();
  };

  const handleFontSizeChange = (fontSize: string) => {
    FormattingUtils.setFontSize(editor, fontSize);
    onFormatChange?.();
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right' | 'justify') => {
    FormattingUtils.setTextAlign(editor, align);
    onFormatChange?.();
  };

  const handleLinkInsert = () => {
    if (linkUrl.trim()) {
      FormattingUtils.insertLink(editor, linkUrl.trim());
      setLinkUrl('');
      setShowLinkDialog(false);
      onFormatChange?.();
    }
  };

  const handleLinkRemove = () => {
    FormattingUtils.unwrapLink(editor);
    onFormatChange?.();
  };

  if (!isVisible) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      marginBottom: '8px',
      flexWrap: 'wrap',
    }}>
      {/* Bold */}
      <button
        onClick={() => handleFormatToggle(MARK_TYPES.BOLD)}
        style={{
          background: FormattingUtils.isFormatActive(editor, MARK_TYPES.BOLD) ? '#007bff' : '#fff',
          color: FormattingUtils.isFormatActive(editor, MARK_TYPES.BOLD) ? '#fff' : '#000',
          border: '1px solid #ced4da',
          padding: '6px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
        }}
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      {/* Italic */}
      <button
        onClick={() => handleFormatToggle(MARK_TYPES.ITALIC)}
        style={{
          background: FormattingUtils.isFormatActive(editor, MARK_TYPES.ITALIC) ? '#007bff' : '#fff',
          color: FormattingUtils.isFormatActive(editor, MARK_TYPES.ITALIC) ? '#fff' : '#000',
          border: '1px solid #ced4da',
          padding: '6px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontStyle: 'italic',
          fontSize: '14px',
        }}
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      {/* Underline */}
      <button
        onClick={() => handleFormatToggle(MARK_TYPES.UNDERLINE)}
        style={{
          background: FormattingUtils.isFormatActive(editor, MARK_TYPES.UNDERLINE) ? '#007bff' : '#fff',
          color: FormattingUtils.isFormatActive(editor, MARK_TYPES.UNDERLINE) ? '#fff' : '#000',
          border: '1px solid #ced4da',
          padding: '6px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '14px',
        }}
        title="Underline (Ctrl+U)"
      >
        U
      </button>

      {/* Strikethrough */}
      <button
        onClick={() => handleFormatToggle(MARK_TYPES.STRIKETHROUGH)}
        style={{
          background: FormattingUtils.isFormatActive(editor, MARK_TYPES.STRIKETHROUGH) ? '#007bff' : '#fff',
          color: FormattingUtils.isFormatActive(editor, MARK_TYPES.STRIKETHROUGH) ? '#fff' : '#000',
          border: '1px solid #ced4da',
          padding: '6px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          textDecoration: 'line-through',
          fontSize: '14px',
        }}
        title="Strikethrough (Ctrl+Shift+X)"
      >
        S
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6' }} />

      {/* Text Color */}
      <div style={{ position: 'relative' }} ref={colorPickerRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            background: '#fff',
            border: '1px solid #ced4da',
            padding: '6px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Text Color"
        >
          <span style={{ color: '#000' }}>A</span>
          <span style={{ fontSize: '10px' }}>▼</span>
        </button>
        
        {showColorPicker && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            minWidth: '200px',
          }}>
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: color,
                  border: '1px solid #dee2e6',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Background Color */}
      <div style={{ position: 'relative' }} ref={bgColorPickerRef}>
        <button
          onClick={() => setShowBgColorPicker(!showBgColorPicker)}
          style={{
            background: '#fff',
            border: '1px solid #ced4da',
            padding: '6px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Background Color"
        >
          <span style={{ backgroundColor: '#ffeb3b', padding: '2px 4px', borderRadius: '2px' }}>A</span>
          <span style={{ fontSize: '10px' }}>▼</span>
        </button>
        
        {showBgColorPicker && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: 1000,
            backgroundColor: '#fff',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px',
            minWidth: '200px',
          }}>
            {COLOR_OPTIONS.map(color => (
              <button
                key={color}
                onClick={() => handleBgColorSelect(color)}
                style={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: color,
                  border: '1px solid #dee2e6',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6' }} />

      {/* Font Family */}
      <select
        onChange={(e) => handleFontFamilyChange(e.target.value)}
        style={{
          padding: '6px 8px',
          border: '1px solid #ced4da',
          borderRadius: '3px',
          fontSize: '14px',
          minWidth: '120px',
        }}
        title="Font Family"
      >
        {FONT_OPTIONS.map(font => (
          <option key={font.value} value={font.value}>
            {font.label}
          </option>
        ))}
      </select>

      {/* Font Size */}
      <select
        onChange={(e) => handleFontSizeChange(e.target.value)}
        style={{
          padding: '6px 8px',
          border: '1px solid #ced4da',
          borderRadius: '3px',
          fontSize: '14px',
          minWidth: '80px',
        }}
        title="Font Size"
      >
        {FONT_SIZE_OPTIONS.map(size => (
          <option key={size.value} value={size.value}>
            {size.label}
          </option>
        ))}
      </select>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6' }} />

      {/* Alignment Buttons */}
      {ALIGNMENT_OPTIONS.map(align => (
        <button
          key={align.value}
          onClick={() => handleAlignmentChange(align.value as any)}
          style={{
            background: '#fff',
            border: '1px solid #ced4da',
            padding: '6px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
          title={align.label}
        >
          {align.icon}
        </button>
      ))}

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', backgroundColor: '#dee2e6' }} />

      {/* Link */}
      <button
        onClick={() => setShowLinkDialog(true)}
        style={{
          background: FormattingUtils.isLinkActive(editor) ? '#007bff' : '#fff',
          color: FormattingUtils.isLinkActive(editor) ? '#fff' : '#000',
          border: '1px solid #ced4da',
          padding: '6px 10px',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        title="Insert Link (Ctrl+K)"
      >
        🔗
      </button>

      {/* Remove Link */}
      {FormattingUtils.isLinkActive(editor) && (
        <button
          onClick={handleLinkRemove}
          style={{
            background: '#dc3545',
            color: '#fff',
            border: '1px solid #dc3545',
            padding: '6px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          title="Remove Link"
        >
          ✕
        </button>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1001,
          minWidth: '300px',
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Insert Link</h3>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '16px',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLinkInsert();
              } else if (e.key === 'Escape') {
                setShowLinkDialog(false);
                setLinkUrl('');
              }
            }}
            autoFocus
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setShowLinkDialog(false);
                setLinkUrl('');
              }}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleLinkInsert}
              style={{
                background: '#007bff',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Insert
            </button>
          </div>
        </div>
      )}

      {/* Overlay for link dialog */}
      {showLinkDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
          }}
          onClick={() => {
            setShowLinkDialog(false);
            setLinkUrl('');
          }}
        />
      )}
    </div>
  );
};

export default RichTextToolbar;
