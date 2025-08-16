'use client';

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createParagraphNode, $createTextNode } from 'lexical';
import { $createImageNode } from './ImageNode';
import { $createVideoNode } from './VideoNode';
import { INSERT_IMAGE_COMMAND, INSERT_VIDEO_COMMAND } from './MediaCommands';

export default function MediaInsertionPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    console.log('🎯 MediaInsertionPlugin: Setting up commands...');
    
    // Wait a bit for editor to be fully initialized
    const timer = setTimeout(() => {
      console.log('🎯 MediaInsertionPlugin: Registering commands after delay...');
      
      // Handle image insertion command
      const removeImageCommand = editor.registerCommand(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          console.log('🎯 INSERT_IMAGE_COMMAND received with payload:', payload);
          if (typeof payload === 'string') {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                console.log('🎯 Creating image node...');
                // Create image node
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
                
                console.log('🎯 Image node created:', imageNode);
                
                // Insert the image node
                selection.insertNodes([imageNode]);
                
                // Add a paragraph after the image for better UX
                const paragraph = $createParagraphNode();
                selection.insertNodes([paragraph]);
                
                console.log('🖼️ Image inserted via command:', payload);
              } else {
                console.warn('🎯 No valid selection found for image insertion');
                // Try to insert at the end if no selection
                const root = editor.getEditorState()._nodeMap.get('root');
                if (root) {
                  console.log('🎯 Attempting to insert at root...');
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
                  root.append(imageNode);
                  console.log('🖼️ Image inserted at root');
                }
              }
            });
            return true;
          } else {
            console.warn('🎯 Invalid payload type for image insertion:', typeof payload);
          }
          return false;
        },
        1
      );

          // Handle video insertion command
      const removeVideoCommand = editor.registerCommand(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          if (typeof payload === 'string') {
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
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
                
                // Insert the video node
                selection.insertNodes([videoNode]);
                
                // Add a paragraph after the video for better UX
                const paragraph = $createParagraphNode();
                selection.insertNodes([paragraph]);
                
                console.log('🎬 Video inserted via command:', payload);
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
    }, 500); // 500ms delay

    return () => {
      console.log('🎯 MediaInsertionPlugin: Component unmounting, clearing timer...');
      clearTimeout(timer);
    };
  }, [editor]); // Add missing dependency array and closing brace

  return null;
}