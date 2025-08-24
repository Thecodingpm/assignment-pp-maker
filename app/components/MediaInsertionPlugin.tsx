'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode, $getRoot } from 'lexical';
import { $createImageNode } from './ImageNode';
import { $createVideoNode } from './VideoNode';
import { INSERT_IMAGE_COMMAND, INSERT_VIDEO_COMMAND } from './MediaCommands';

export default function MediaInsertionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle image insertion command
    const removeImageCommand = editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      (payload) => {
        if (typeof payload === 'string' && payload.length > 0) {
          // Get original image dimensions
          const img = new Image();
          img.onload = () => {
            editor.update(() => {
              try {
                const selection = $getSelection();
                const root = $getRoot();
                
                // Calculate dimensions while maintaining aspect ratio
                let width = img.naturalWidth;
                let height = img.naturalHeight;
                
                // Limit maximum size to prevent oversized images
                const maxWidth = 800;
                const maxHeight = 600;
                
                if (width > maxWidth || height > maxHeight) {
                  const ratio = Math.min(maxWidth / width, maxHeight / height);
                  width = Math.round(width * ratio);
                  height = Math.round(height * ratio);
                }
                
                // Create image node with original dimensions
                const imageNode = $createImageNode(
                  payload, // src
                  'Image', // alt
                  width, // width
                  height, // height
                  8, // borderRadius
                  1, // borderWidth
                  '#e5e7eb', // borderColor
                  '0 4px 6px -1px rgba(0,0,0,0.1)' // shadow
                );
              
              if ($isRangeSelection(selection)) {
                // Insert at current selection
                selection.insertNodes([imageNode]);
              } else {
                // Insert at the end of the document
                root.append(imageNode);
              }
              
                              // Add a paragraph after the image for better UX
                const paragraph = $createParagraphNode();
                if ($isRangeSelection(selection)) {
                  selection.insertNodes([paragraph]);
                } else {
                  root.append(paragraph);
                }
              } catch (error) {
                console.error('Error inserting image:', error);
              }
            });
          };
          
          img.onerror = () => {
            // Fallback to default size if image loading fails
            editor.update(() => {
              try {
                const selection = $getSelection();
                const root = $getRoot();
                
                const imageNode = $createImageNode(
                  payload, // src
                  'Image', // alt
                  300, // width
                  200, // height
                  8, // borderRadius
                  1, // borderWidth
                  '#e5e7eb', // borderColor
                  '0 4px 6px -1px rgba(0,0,0,0.1)' // shadow
                );
                
                if ($isRangeSelection(selection)) {
                  selection.insertNodes([imageNode]);
                } else {
                  root.append(imageNode);
                }
                
                const paragraph = $createParagraphNode();
                if ($isRangeSelection(selection)) {
                  selection.insertNodes([paragraph]);
                } else {
                  root.append(paragraph);
                }
              } catch (error) {
                console.error('Error inserting image:', error);
              }
            });
          };
          
          img.src = payload;
          return true;
        }
        return false;
      },
      1
    );

    // Handle video insertion command
    const removeVideoCommand = editor.registerCommand(
      INSERT_VIDEO_COMMAND,
      (payload) => {
        if (typeof payload === 'string' && payload.length > 0) {
          editor.update(() => {
            try {
              const selection = $getSelection();
              const root = $getRoot();
              
              // Create video node
              const videoNode = $createVideoNode(
                payload, // src
                'Video', // alt
                400, // width
                225, // height
                8, // borderRadius
                1, // borderWidth
                '#e5e7eb', // borderColor
                '0 4px 6px -1px rgba(0,0,0,0.1)' // shadow
              );
              
              if ($isRangeSelection(selection)) {
                // Insert at current selection
                selection.insertNodes([videoNode]);
              } else {
                // Insert at the end of the document
                root.append(videoNode);
              }
              
              // Add a paragraph after the video for better UX
              const paragraph = $createParagraphNode();
              if ($isRangeSelection(selection)) {
                selection.insertNodes([paragraph]);
              } else {
                root.append(paragraph);
              }
              
              console.log('🎬 Video inserted successfully via command');
            } catch (error) {
              console.error('🎯 Error inserting video:', error);
            }
          });
          return true;
        }
        return false;
      },
      1
    );

    console.log('🎯 MediaInsertionPlugin: Commands registered successfully');
    
    return () => {
      console.log('🎯 MediaInsertionPlugin: Cleaning up commands...');
      removeImageCommand();
      removeVideoCommand();
    };
  }, [editor]);

  return null;
}