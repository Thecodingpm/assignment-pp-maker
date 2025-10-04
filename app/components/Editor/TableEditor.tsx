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
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [editingHeader, setEditingHeader] = useState<number | null>(null);

  // Ensure data structure is properly initialized
  const data = tableElement.data || [];
  const headers = tableElement.headers || [];

  // Initialize data if empty
  useEffect(() => {
    console.log('🔍 TableEditor useEffect - data:', data, 'headers:', headers, 'rows:', tableElement.rows, 'cols:', tableElement.cols);
    
    if (data.length === 0 || data[0]?.length === 0) {
      console.log('🔄 Initializing table data...');
      const initializedData = Array(tableElement.rows || 3).fill(null).map(() => 
        Array(tableElement.cols || 3).fill('')
      );
      const initializedHeaders = Array(tableElement.cols || 3).fill('').map((_, i) => `Column ${i + 1}`);
      
      console.log('📊 Initialized data:', initializedData);
      console.log('📊 Initialized headers:', initializedHeaders);
      
      updateElement(currentSlide.id, element.id, {
        data: initializedData,
        headers: initializedHeaders
      } as Partial<TableElement>);
    }
  }, [tableElement.data, tableElement.headers, tableElement.rows, tableElement.cols, currentSlide.id, element.id, updateElement]);

  const handleCellChange = (rowIndex: number, colIndex: number, newValue: string) => {
    console.log('🔄 Cell change:', { rowIndex, colIndex, newValue });
    const newData = [...data];
    if (!newData[rowIndex]) {
      newData[rowIndex] = [];
    }
    newData[rowIndex][colIndex] = newValue;
    
    updateElement(currentSlide.id, element.id, {
      data: newData
    } as Partial<TableElement>);
  };

  // Debug function to test if editing is working
  const testEditing = () => {
    console.log('🧪 Testing table editing...');
    console.log('📊 Current data:', data);
    console.log('📊 Current headers:', headers);
    console.log('🎯 Table element:', tableElement);
  };

  const handleHeaderChange = (headerIndex: number, newValue: string) => {
    console.log('🔄 Header change:', { headerIndex, newValue });
    const newHeaders = [...headers];
    newHeaders[headerIndex] = newValue;
    
    updateElement(currentSlide.id, element.id, {
      headers: newHeaders
    } as Partial<TableElement>);
  };

  return (
    <AnimatedElement element={element}>
      <div
        className="absolute cursor-move select-none presentation-editor"
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
                    className={`border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 text-center min-w-[60px] cursor-text hover:bg-gray-100 transition-colors ${
                      editingHeader === index 
                        ? 'bg-blue-50 border-blue-300' 
                        : ''
                    }`}
                    title="Click to edit column name"
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="outline-none min-h-[20px] w-full cursor-text"
                      style={{
                        userSelect: 'text',
                        WebkitUserSelect: 'text',
                        MozUserSelect: 'text',
                        msUserSelect: 'text',
                        pointerEvents: 'auto',
                        position: 'relative',
                        zIndex: 10
                      }}
                      onBlur={(e) => {
                        const newValue = e.target.textContent?.trim() || '';
                        console.log('📝 Header blur:', { index, newValue });
                        handleHeaderChange(index, newValue);
                        setEditingHeader(null);
                      }}
                      onInput={(e) => {
                        // Real-time updates as user types
                        const newValue = e.currentTarget.textContent?.trim() || '';
                        console.log('📝 Header input:', { index, newValue });
                        handleHeaderChange(index, newValue);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                        if (e.key === 'Escape') {
                          e.currentTarget.blur();
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.currentTarget.focus();
                      }}
                      onFocus={(e) => {
                        console.log('🎯 Header focused:', index);
                        setEditingHeader(index);
                        // Select all text when focused
                        const range = document.createRange();
                        range.selectNodeContents(e.target);
                        const selection = window.getSelection();
                        selection?.removeAllRanges();
                        selection?.addRange(range);
                      }}
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
                      className={`border border-gray-300 px-3 py-2 text-xs text-gray-600 text-center min-w-[60px] min-h-[30px] cursor-text hover:bg-gray-50 transition-colors ${
                        editingCell?.row === rowIndex && editingCell?.col === colIndex 
                          ? 'bg-blue-50 border-blue-300' 
                          : ''
                      }`}
                      title="Click to edit cell content"
                    >
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="outline-none min-h-[20px] w-full cursor-text"
                        style={{
                          userSelect: 'text',
                          WebkitUserSelect: 'text',
                          MozUserSelect: 'text',
                          msUserSelect: 'text',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 10
                        }}
                        onBlur={(e) => {
                          const newValue = e.target.textContent?.trim() || '';
                          console.log('📝 Cell blur:', { rowIndex, colIndex, newValue });
                          handleCellChange(rowIndex, colIndex, newValue);
                          setEditingCell(null);
                        }}
                        onInput={(e) => {
                          // Real-time updates as user types
                          const newValue = e.currentTarget.textContent?.trim() || '';
                          console.log('📝 Cell input:', { rowIndex, colIndex, newValue });
                          handleCellChange(rowIndex, colIndex, newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                          if (e.key === 'Escape') {
                            e.currentTarget.blur();
                          }
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            // Move to next cell
                            const nextCell = e.currentTarget.parentElement?.parentElement?.nextElementSibling?.querySelector('[contenteditable]') as HTMLElement;
                            if (nextCell) {
                              nextCell.focus();
                            }
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.currentTarget.focus();
                        }}
                        onFocus={(e) => {
                          console.log('🎯 Cell focused:', { rowIndex, colIndex });
                          setEditingCell({ row: rowIndex, col: colIndex });
                          // Select all text when focused
                          const range = document.createRange();
                          range.selectNodeContents(e.target);
                          const selection = window.getSelection();
                          selection?.removeAllRanges();
                          selection?.addRange(range);
                        }}
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
            {/* Debug button */}
            <div
              className="absolute -top-2 -left-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                testEditing();
              }}
              title="Test table editing"
            >
              <span className="text-white text-xs font-bold">T</span>
            </div>
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