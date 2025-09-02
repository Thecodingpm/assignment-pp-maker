'use client';

import React, { useState } from 'react';
import { StructuredDocument } from '../types/document';
import { ExportOptions, DEFAULT_EXPORT_OPTIONS, exportDocument } from '../utils/exportUtils';

interface ExportDialogProps {
  document: StructuredDocument;
  isOpen: boolean;
  onClose: () => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ document, isOpen, onClose }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    ...DEFAULT_EXPORT_OPTIONS,
    filename: document.title || 'document',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string>('');

  const handleExport = async () => {
    if (!exportOptions.filename?.trim()) {
      alert('Please enter a filename');
      return;
    }

    setIsExporting(true);
    setExportProgress('Preparing export...');

    try {
      await exportDocument(document, exportOptions);
      setExportProgress('Export completed successfully!');
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportProgress('');
      }, 1500);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress('Export failed. Please try again.');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
      }, 2000);
    }
  };

  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', color: '#333' }}>Export Document</h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Export Format */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Export Format
          </label>
          <select
            value={exportOptions.format}
            onChange={(e) => handleOptionChange('format', e.target.value)}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="pdf">PDF Document (.pdf)</option>
            <option value="docx">Word Document (.docx)</option>
            <option value="html">HTML File (.html)</option>
          </select>
        </div>

        {/* Filename */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
            Filename
          </label>
          <input
            type="text"
            value={exportOptions.filename}
            onChange={(e) => handleOptionChange('filename', e.target.value)}
            disabled={isExporting}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            placeholder="Enter filename"
          />
        </div>

        {/* Include Metadata */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={exportOptions.includeMetadata}
              onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
              disabled={isExporting}
              style={{ marginRight: '8px' }}
            />
            <span style={{ color: '#333' }}>Include document metadata</span>
          </label>
        </div>

        {/* PDF Options (only show for PDF format) */}
        {exportOptions.format === 'pdf' && (
          <>
            {/* Page Size */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Page Size
              </label>
              <select
                value={exportOptions.pageSize}
                onChange={(e) => handleOptionChange('pageSize', e.target.value)}
                disabled={isExporting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="A4">A4 (210 × 297 mm)</option>
                <option value="Letter">Letter (8.5 × 11 in)</option>
                <option value="Legal">Legal (8.5 × 14 in)</option>
              </select>
            </div>

            {/* Orientation */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Orientation
              </label>
              <select
                value={exportOptions.orientation}
                onChange={(e) => handleOptionChange('orientation', e.target.value)}
                disabled={isExporting}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Margins */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Margins (mm)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    Top
                  </label>
                  <input
                    type="number"
                    value={exportOptions.margins?.top}
                    onChange={(e) => handleOptionChange('margins', {
                      ...exportOptions.margins,
                      top: parseInt(e.target.value) || 20,
                    })}
                    disabled={isExporting}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    Bottom
                  </label>
                  <input
                    type="number"
                    value={exportOptions.margins?.bottom}
                    onChange={(e) => handleOptionChange('margins', {
                      ...exportOptions.margins,
                      bottom: parseInt(e.target.value) || 20,
                    })}
                    disabled={isExporting}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    Left
                  </label>
                  <input
                    type="number"
                    value={exportOptions.margins?.left}
                    onChange={(e) => handleOptionChange('margins', {
                      ...exportOptions.margins,
                      left: parseInt(e.target.value) || 20,
                    })}
                    disabled={isExporting}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#666' }}>
                    Right
                  </label>
                  <input
                    type="number"
                    value={exportOptions.margins?.right}
                    onChange={(e) => handleOptionChange('margins', {
                      ...exportOptions.margins,
                      right: parseInt(e.target.value) || 20,
                    })}
                    disabled={isExporting}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Progress Message */}
        {isExporting && (
          <div style={{
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            color: '#1976d2',
            textAlign: 'center',
          }}>
            {exportProgress}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isExporting ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              background: isExporting ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isExporting ? 0.6 : 1,
            }}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
