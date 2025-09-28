import React, { useState, useRef, useEffect } from 'react';
import { EditorElement, TableElement, Slide } from '../../types/editor';
import { useEditorStore } from '../../stores/useEditorStore';
import { AnimatedElement } from '../AnimationSystem';
import ResizeHandles from './ResizeHandles';

interface TableEditorProps {
  element: EditorElement;
  tableElement: TableElement;
  currentSlide: Slide;
  selectedElementIds: string[];
  selectElement: (id: string, multiSelect?: boolean) => void;
  setDragOffset: (offset: { x: number; y: number }) => void;
  setDraggingElement: (element: EditorElement | null) => void;
  zoom: number;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const TableEditor: React.FC<TableEditorProps> = ({
  element,
  tableElement,
  currentSlide,
  selectedElementIds,
  selectElement,
  setDragOffset,
  setDraggingElement,
  zoom,
  canvasRef
}) => {
  const { updateElement } = useEditorStore();

  // Ensure data structure is properly initialized
  const data = tableElement.data || [];
  const headers = tableElement.headers || [];

  // Initialize data if empty
  useEffect(() => {
    if (data.length === 0 || data[0]?.length === 0) {
      const initializedData = Array(tableElement.rows || 3).fill(null).map(() => 
        Array(tableElement.cols || 3).fill('')
      );
      const initializedHeaders = Array(tableElement.cols || 3).fill('').map((_, i) => `Column ${i + 1}`);
      
      updateElement(currentSlide.id, element.id, {
        data: initializedData,
        headers: initializedHeaders
      } as Partial<TableElement>);
    }
  }, [tableElement.data, tableElement.headers, tableElement.rows, tableElement.cols, currentSlide.id, element.id, updateElement]);

  const handleCellChange = (rowIndex: number, colIndex: number, newValue: string) => {
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }
    newData[rowIndex][colIndex] = newValue;
    
    updateElement(currentSlide.id, element.id, {
      data: newData
    } as Partial<TableElement>);
  };

  const handleHeaderChange = (headerIndex: number, newValue: string) => {
    const newHeaders = [...headers];
    newHeaders[headerIndex] = newValue;
    
    updateElement(currentSlide.id, element.id, {
      headers: newHeaders
    } as Partial<TableElement>);
  };

  return (
    <AnimatedElement element={element}>
      <div
        className="absolute cursor-move select-none"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          zIndex: element.zIndex,
        }}
      >
        {/* Selection border area */}
        <div 
          className={`absolute -inset-2 z-10 cursor-pointer border-2 transition-colors ${
            selectedElementIds.includes(element.id) 
              ? 'border-blue-500' 
              : 'border-transparent hover:border-blue-300'
          }`}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.stopPropagation();
              selectElement(element.id, e.shiftKey);
            }
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              const rect = e.currentTarget.getBoundingClientRect();
              const canvasRect = canvasRef.current?.getBoundingClientRect();
              if (canvasRect) {
                const offsetX = (e.clientX - canvasRect.left) / zoom - element.x;
                const offsetY = (e.clientY - canvasRect.top) / zoom - element.y;
                setDragOffset({ x: offsetX, y: offsetY });
              }
              setDraggingElement(element);
            }
          }}
        />
        <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full h-full border-collapse text-xs">
            <thead>
              <tr>
                {headers.map((header: string, index: number) => (
                  <th 
                    key={index}
                    className="border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 text-center min-w-[60px] cursor-text hover:bg-gray-100 transition-colors"
                    title="Click to edit column name"
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none"
                      onBlur={(e) => handleHeaderChange(index, e.target.textContent || '')}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {header || `Column ${index + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {(row || []).map((cell: string, colIndex: number) => (
                    <td 
                      key={colIndex}
                      className="border border-gray-300 px-3 py-2 text-xs text-gray-600 text-center min-w-[60px] min-h-[30px] cursor-text hover:bg-gray-50 transition-colors"
                      title="Click to edit cell content"
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none min-h-[20px]"
                        onBlur={(e) => handleCellChange(rowIndex, colIndex, e.target.textContent || '')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cell || ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Resize handles for selected tables */}
        {selectedElementIds.includes(element.id) && (
          <>
            <ResizeHandles
              element={element}
              onResize={(newWidth, newHeight) => {
                updateElement(currentSlide.id, element.id, {
                  width: newWidth,
                  height: newHeight
                });
              }}
            />
            <div
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                const { deleteElement } = useEditorStore.getState();
                deleteElement(currentSlide.id, element.id);
              }}
            >
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
          </>
        )}
      </div>
    </AnimatedElement>
  );
};

export default TableEditor;