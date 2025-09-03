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
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const maxRows = 10;
  const maxCols = 10;

  const handleCellHover = (row: number, col: number) => {
    setHoveredCells({ rows: row + 1, cols: col + 1 });
  };

  const handleCellClick = (row: number, col: number) => {
    const selectedRows = row + 1;
    const selectedCols = col + 1;
    setSelectedCells({ rows: selectedRows, cols: selectedCols });
    
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
        width: Math.max(300, selectedCols * 80),
        height: Math.max(200, selectedRows * 40),
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
  };

  const handleMouseLeave = () => {
    setHoveredCells({ rows: 0, cols: 0 });
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
                  const isHovered = row < hoveredCells.rows && col < hoveredCells.cols;
                  const isSelected = row < selectedCells.rows && col < selectedCells.cols;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`w-6 h-6 border border-gray-300 rounded-sm cursor-pointer transition-all duration-150 ${
                        isHovered || isSelected
                          ? 'bg-blue-500 border-blue-600'
                          : 'bg-white hover:bg-gray-100'
                      }`}
                      onMouseEnter={() => handleCellHover(row, col)}
                      onClick={() => handleCellClick(row, col)}
                      title={`${row + 1} × ${col + 1} table`}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Selection Display */}
          <div className="text-center">
            {hoveredCells.rows > 0 && hoveredCells.cols > 0 ? (
              <div className="text-sm font-medium text-blue-600">
                Insert {hoveredCells.rows} × {hoveredCells.cols} table
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
                    handleCellClick(preset.rows - 1, preset.cols - 1);
                  }}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TablePopup;
