'use client';

import React, { useState, useMemo } from 'react';
import { DocumentBlock } from '../../types/document';

interface TableBlockProps {
  block: DocumentBlock;
  onChange: (blockId: string, content: string, styling: DocumentBlock['styling']) => void;
  isEditing?: boolean;
}

interface TableData {
  rows: string[][];
  headers?: string[];
}

const TableBlock: React.FC<TableBlockProps> = ({ block, onChange, isEditing = true }) => {
  const [tableData, setTableData] = useState<TableData>(() => {
    try {
      // Try to parse existing table data from content
      const parsed = JSON.parse(block.content);
      return parsed.rows ? parsed : { rows: [['']], headers: [''] };
    } catch {
      // If parsing fails, create a simple table from content
      const lines = block.content.split('\n').filter(line => line.trim());
      if (lines.length === 0) {
        return { rows: [['']], headers: [''] };
      }
      
      const rows = lines.map(line => 
        line.split('\t').map(cell => cell.trim())
      );
      
      return {
        rows: rows.length > 0 ? rows : [['']],
        headers: rows[0] || ['']
      };
    }
  });

  const updateTableData = (newData: TableData) => {
    setTableData(newData);
    // Convert table data back to string for storage
    const content = JSON.stringify(newData);
    onChange(block.id, content, block.styling);
  };

  const addRow = () => {
    const newRow = new Array(tableData.rows[0]?.length || 1).fill('');
    const newData = {
      ...tableData,
      rows: [...tableData.rows, newRow]
    };
    updateTableData(newData);
  };

  const removeRow = (rowIndex: number) => {
    if (tableData.rows.length > 1) {
      const newData = {
        ...tableData,
        rows: tableData.rows.filter((_, index) => index !== rowIndex)
      };
      updateTableData(newData);
    }
  };

  const addColumn = () => {
    const newData = {
      ...tableData,
      rows: tableData.rows.map(row => [...row, '']),
      headers: tableData.headers ? [...tableData.headers, ''] : undefined
    };
    updateTableData(newData);
  };

  const removeColumn = (colIndex: number) => {
    if (tableData.rows[0]?.length > 1) {
      const newData = {
        ...tableData,
        rows: tableData.rows.map(row => row.filter((_, index) => index !== colIndex)),
        headers: tableData.headers ? tableData.headers.filter((_, index) => index !== colIndex) : undefined
      };
      updateTableData(newData);
    }
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...tableData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][colIndex] = value;
    
    const newData = {
      ...tableData,
      rows: newRows
    };
    updateTableData(newData);
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: 'collapse',
    width: '100%',
    margin: '10px 0',
    fontSize: block.styling.fontSize || '14px',
    fontFamily: block.styling.fontFamily || 'inherit',
    color: block.styling.color || '#000000',
    backgroundColor: block.styling.backgroundColor || 'transparent',
    ...(block.styling.marginTop && { marginTop: block.styling.marginTop }),
    ...(block.styling.marginBottom && { marginBottom: block.styling.marginBottom }),
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
    verticalAlign: 'top',
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  };

  if (!isEditing) {
    return (
      <table style={tableStyle}>
        <thead>
          <tr>
            {tableData.headers?.map((header, index) => (
              <th key={index} style={headerCellStyle}>
                {header}
              </th>
            )) || tableData.rows[0]?.map((_, index) => (
              <th key={index} style={headerCellStyle}>
                Column {index + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} style={cellStyle}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {isEditing && (
        <div style={{
          position: 'absolute',
          top: '-40px',
          left: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <button
            onClick={addRow}
            style={{
              background: '#28a745',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            + Row
          </button>
          <button
            onClick={addColumn}
            style={{
              background: '#28a745',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            + Col
          </button>
        </div>
      )}
      
      <table style={tableStyle}>
        <thead>
          <tr>
            {tableData.rows[0]?.map((_, colIndex) => (
              <th key={colIndex} style={headerCellStyle}>
                <input
                  type="text"
                  value={tableData.headers?.[colIndex] || `Column ${colIndex + 1}`}
                  onChange={(e) => {
                    const newHeaders = [...(tableData.headers || tableData.rows[0].map((_, i) => `Column ${i + 1}`))];
                    newHeaders[colIndex] = e.target.value;
                    const newData = { ...tableData, headers: newHeaders };
                    updateTableData(newData);
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    fontSize: 'inherit',
                    fontWeight: 'bold',
                  }}
                />
                {isEditing && (
                  <button
                    onClick={() => removeColumn(colIndex)}
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#dc3545',
                      border: 'none',
                      color: 'white',
                      borderRadius: '50%',
                      width: '16px',
                      height: '16px',
                      fontSize: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ×
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td key={colIndex} style={cellStyle}>
                  <input
                    type="text"
                    value={cell}
                    onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      fontSize: 'inherit',
                    }}
                  />
                </td>
              ))}
              {isEditing && (
                <td style={{ border: 'none', padding: '4px' }}>
                  <button
                    onClick={() => removeRow(rowIndex)}
                    style={{
                      background: '#dc3545',
                      border: 'none',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableBlock;
