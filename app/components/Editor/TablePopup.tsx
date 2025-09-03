'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Table, Grid, Plus } from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';

interface TablePopupProps {
  isVisible: boolean;
  onClose: () => void;
  position: { x: number; y: number };
}

const TablePopup: React.FC<TablePopupProps> = ({
  isVisible,
  onClose,
  position
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const { addElement, canvasSize } = useEditorStore();
  const [hoveredCells, setHoveredCells] = useState({ rows: 0, cols: 0 });
  const [selectedCells, setSelectedCells] = useState({ rows: 0, cols: 0 });
  const [isSelecting, setIsSelecting] = useState(false);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isVisible) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  // Close popup when pressing Escape
  useEffect(() => {
    if (!isVisible) return;
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    // Delete or Backspace to clear selection
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedCells.rows > 0 && selectedCells.cols > 0) {
        setSelectedCells({ rows: 0, cols: 0 });
        setHoveredCells({ rows: 0, cols: 0 });
      }
    }
    
    // Ctrl+A or Cmd+A to select all
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      setSelectedCells({ rows: maxRows, cols: maxCols });
      setHoveredCells({ rows: maxRows, cols: maxCols });
    }
  };

  if (!isVisible) return null;

  const maxRows = 10;
  const maxCols = 10;

  const handleCellHover = (row: number, col: number) => {
    if (!isSelecting) {
      setHoveredCells({ rows: row + 1, cols: col + 1 });
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const selectedRows = row + 1;
    const selectedCols = col + 1;
    
    // If clicking on already selected area, create and insert the table
    if (selectedCells.rows === selectedRows && selectedCells.cols === selectedCols) {
      // Create table element and add it to the canvas
      const { slides, currentSlideIndex } = useEditorStore.getState();
      const currentSlide = slides[currentSlideIndex];
      
      if (currentSlide) {
        // Calculate center position for new table element
        const centerX = (canvasSize.width / 2) - 200;
        const centerY = (canvasSize.height / 2) - 150;
        
        const newTableElement = {
          type: 'table' as const,
          x: centerX,
          y: centerY,
          width: Math.max(400, selectedCols * 100), // Increased from 80 to 100
          height: Math.max(300, selectedRows * 50),  // Increased from 40 to 50
          rotation: 0,
          zIndex: 1,
          rows: selectedRows,
          cols: selectedCols,
          data: Array(selectedRows).fill(null).map(() => 
            Array(selectedCols).fill('')
          ),
          headers: Array(selectedCols).fill('').map((_, i) => `Column ${i + 1}`),
          rowHeaders: Array(selectedRows).fill('').map((_, i) => `Row ${i + 1}`)
        };
        
        addElement(currentSlide.id, newTableElement);
        console.log('Added table to canvas:', newTableElement);
      }
      
      onClose();
      return;
    }
    
    // Otherwise, select the new area
    setSelectedCells({ rows: selectedRows, cols: selectedCols });
    setHoveredCells({ rows: selectedRows, cols: selectedCols });
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    const selectedRows = row + 1;
    const selectedCols = col + 1;
    setSelectedCells({ rows: selectedRows, cols: selectedCols });
    setHoveredCells({ rows: selectedRows, cols: selectedCols });
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
  };

  const handleMouseLeave = () => {
    if (!isSelecting) {
      setHoveredCells({ rows: 0, cols: 0 });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998] bg-black bg-opacity-20"
        onClick={onClose}
      />
      
      {/* Table Popup */}
      <div
        ref={popupRef}
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border border-gray-200 w-80 overflow-hidden"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center space-x-2">
            <Table className="w-5 h-5 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Insert Table</h3>
          </div>
        </div>

        {/* Table Grid Selector */}
        <div className="p-4">
          <div className="mb-3">
            <p className="text-xs text-gray-600 text-center">
              Select table dimensions by hovering over the grid
            </p>
          </div>
          
          {/* Grid Container */}
          <div className="flex justify-center mb-4">
            <div 
              className="grid gap-0.5 border border-gray-200 rounded-lg p-2 bg-gray-50"
              style={{
                gridTemplateColumns: `repeat(${maxCols}, 1fr)`,
                gridTemplateRows: `repeat(${maxRows}, 1fr)`
              }}
              onMouseLeave={handleMouseLeave}
            >
              {Array.from({ length: maxRows }, (_, row) =>
                Array.from({ length: maxCols }, (_, col) => {
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`w-6 h-6 border border-gray-300 rounded-sm cursor-pointer transition-all duration-150 ${
                        row < selectedCells.rows && col < selectedCells.cols
                          ? 'bg-blue-600 border-blue-700' // Selected cells - darker blue
                          : row < hoveredCells.rows && col < hoveredCells.cols
                          ? 'bg-blue-300 border-blue-400' // Hovered cells - lighter blue
                          : 'bg-white hover:bg-gray-100' // Default state
                      }`}
                      onMouseEnter={() => handleCellHover(row, col)}
                      onClick={() => handleCellClick(row, col)}
                      onMouseDown={() => handleCellMouseDown(row, col)}
                      onMouseUp={handleCellMouseUp}
                      title={`${row + 1} × ${col + 1} table`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Selection Display */}
          <div className="text-center">
            {selectedCells.rows > 0 && selectedCells.cols > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-medium text-blue-600">
                  Selected: {selectedCells.rows} × {selectedCells.cols} table
                </div>
                <div className="text-xs text-gray-600">
                  Click the selected area again to insert the table
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Hover over grid to select dimensions
              </div>
            )}
          </div>

          {/* Quick Presets */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2 text-center">Quick presets:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { rows: 2, cols: 2, label: '2×2' },
                { rows: 3, cols: 3, label: '3×3' },
                { rows: 4, cols: 4, label: '4×4' },
                { rows: 5, cols: 5, label: '5×5' },
                { rows: 3, cols: 5, label: '3×5' },
                { rows: 5, cols: 3, label: '5×3' }
              ].map((preset) => (
                <button
                  key={`${preset.rows}-${preset.cols}`}
                  onClick={() => {
                    setSelectedCells({ rows: preset.rows, cols: preset.cols });
                    setHoveredCells({ rows: preset.rows, cols: preset.cols });
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 mb-2 text-center">Keyboard shortcuts:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Delete</kbd> or <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Backspace</kbd> - Clear selection</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+A</kbd> or <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Cmd+A</kbd> - Select all (10×10)</p>
              <p>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> - Close popup</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TablePopup;
