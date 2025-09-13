import { createEditor, Descendant, Element as SlateElement, Transforms, Text } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

// Custom element types
export const ELEMENT_TYPES = {
  PARAGRAPH: 'paragraph',
  HEADING: 'heading',
  LIST_ITEM: 'list-item',
  LINK: 'link',
} as const;

// Custom mark types
export const MARK_TYPES = {
  BOLD: 'bold',
  ITALIC: 'italic',
  UNDERLINE: 'underline',
  STRIKETHROUGH: 'strikethrough',
  CODE: 'code',
} as const;

// Text formatting interface
export interface TextFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

// Link element interface
export interface LinkElement {
  type: typeof ELEMENT_TYPES.LINK;
  url: string;
  children: Descendant[];
}

// Heading element interface
export interface HeadingElement {
  type: typeof ELEMENT_TYPES.HEADING;
  level: number;
  children: Descendant[];
}

// List item element interface
export interface ListItemElement {
  type: typeof ELEMENT_TYPES.LIST_ITEM;
  children: Descendant[];
}

// Custom element types
declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: 
      | ParagraphElement 
      | HeadingElement 
      | ListItemElement 
      | LinkElement;
    Text: {
      text: string;
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      code?: boolean;
      color?: string;
      backgroundColor?: string;
      fontSize?: string;
      fontFamily?: string;
    } & Text;
  }
}

// Create editor with plugins
export function createSlateEditor() {
  return withHistory(withReact(createEditor()));
}

// Formatting helpers
export const FormattingUtils = {
  // Check if format is active
  isFormatActive(editor: any, format: string): boolean {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  // Toggle format
  toggleFormat(editor: any, format: string) {
    const isActive = FormattingUtils.isFormatActive(editor, format);
    
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  },

  // Set text color
  setTextColor(editor: any, color: string) {
    Editor.addMark(editor, 'color', color);
  },

  // Set background color
  setBackgroundColor(editor: any, color: string) {
    Editor.addMark(editor, 'backgroundColor', color);
  },

  // Set font family
  setFontFamily(editor: any, fontFamily: string) {
    Editor.addMark(editor, 'fontFamily', fontFamily);
  },

  // Set font size
  setFontSize(editor: any, fontSize: string) {
    Editor.addMark(editor, 'fontSize', fontSize);
  },

  // Set text alignment
  setTextAlign(editor: any, align: 'left' | 'center' | 'right' | 'justify') {
    const { selection } = editor;
    
    if (!selection) return;

    const [match] = Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type !== ELEMENT_TYPES.LIST_ITEM,
    });

    if (match) {
      const newProperties: Partial<SlateElement> = {
        textAlign: align,
      };
      Transforms.setNodes<SlateElement>(editor, newProperties, {
        match: n =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          n.type !== ELEMENT_TYPES.LIST_ITEM,
      });
    }
  },

  // Insert link
  insertLink(editor: any, url: string) {
    const { selection } = editor;
    
    if (!selection) return;

    const isLinkActive = FormattingUtils.isLinkActive(editor);
    
    if (isLinkActive) {
      FormattingUtils.unwrapLink(editor);
    }

    if (url) {
      const link: LinkElement = {
        type: ELEMENT_TYPES.LINK,
        url,
        children: [{ text: url }],
      };
      Transforms.wrapNodes(editor, link, { at: selection, split: true });
    }
  },

  // Check if link is active
  isLinkActive(editor: any): boolean {
    const [link] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === ELEMENT_TYPES.LINK,
    });
    return !!link;
  },

  // Unwrap link
  unwrapLink(editor: any) {
    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === ELEMENT_TYPES.LINK,
    });
  },

  // Get link URL
  getLinkUrl(editor: any): string {
    const [link] = Editor.nodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === ELEMENT_TYPES.LINK,
    });
    return link ? (link[0] as LinkElement).url : '';
  },
};

// Keyboard shortcuts
export const KeyboardShortcuts = {
  // Handle keyboard shortcuts
  handleKeyDown(event: KeyboardEvent, editor: any): boolean {
    // Bold: Ctrl+B
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      FormattingUtils.toggleFormat(editor, MARK_TYPES.BOLD);
      return true;
    }

    // Italic: Ctrl+I
    if (event.ctrlKey && event.key === 'i') {
      event.preventDefault();
      FormattingUtils.toggleFormat(editor, MARK_TYPES.ITALIC);
      return true;
    }

    // Underline: Ctrl+U
    if (event.ctrlKey && event.key === 'u') {
      event.preventDefault();
      FormattingUtils.toggleFormat(editor, MARK_TYPES.UNDERLINE);
      return true;
    }

    // Strikethrough: Ctrl+Shift+X
    if (event.ctrlKey && event.shiftKey && event.key === 'X') {
      event.preventDefault();
      FormattingUtils.toggleFormat(editor, MARK_TYPES.STRIKETHROUGH);
      return true;
    }

    // Code: Ctrl+`
    if (event.ctrlKey && event.key === '`') {
      event.preventDefault();
      FormattingUtils.toggleFormat(editor, MARK_TYPES.CODE);
      return true;
    }

    // Link: Ctrl+K
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      const url = window.prompt('Enter URL:');
      if (url) {
        FormattingUtils.insertLink(editor, url);
      }
      return true;
    }

    return false;
  },
};

// Default formatting options
export const DEFAULT_FORMATTING: TextFormatting = {
  color: '#000000',
  backgroundColor: 'transparent',
  fontSize: '16px',
  fontFamily: 'Arial, sans-serif',
  textAlign: 'left',
};

// Font options
export const FONT_OPTIONS = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' },
  { value: 'Impact, sans-serif', label: 'Impact' },
];

// Font size options
export const FONT_SIZE_OPTIONS = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
  { value: '24px', label: '24px' },
  { value: '28px', label: '28px' },
  { value: '32px', label: '32px' },
  { value: '36px', label: '36px' },
  { value: '48px', label: '48px' },
];

// Color options
export const COLOR_OPTIONS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#008000', '#FFC0CB', '#A52A2A', '#808080', '#C0C0C0',
];

// Alignment options
export const ALIGNMENT_OPTIONS = [
  { value: 'left', label: 'Left', icon: '⫷' },
  { value: 'center', label: 'Center', icon: '⫸' },
  { value: 'right', label: 'Right', icon: '⫹' },
  { value: 'justify', label: 'Justify', icon: '⫺' },
];

// Convert plain text to Slate value
export function textToSlateValue(text: string): Descendant[] {
  return [
    {
      type: ELEMENT_TYPES.PARAGRAPH,
      children: [{ text }],
    },
  ];
}

// Convert Slate value to plain text
export function slateValueToText(value: Descendant[]): string {
  return value
    .map(n => SlateElement.isElement(n) ? n.children.map(child => 'text' in child ? child.text : '').join('') : '')
    .join('\n');
}

// Apply default formatting to Slate value
export function applyDefaultFormatting(value: Descendant[], defaultFormatting: TextFormatting): Descendant[] {
  return value.map(node => {
    if (SlateElement.isElement(node)) {
      return {
        ...node,
        textAlign: defaultFormatting.textAlign,
        children: node.children.map(child => {
          if (Text.isText(child)) {
            return {
              ...child,
              color: defaultFormatting.color,
              backgroundColor: defaultFormatting.backgroundColor,
              fontSize: defaultFormatting.fontSize,
              fontFamily: defaultFormatting.fontFamily,
            };
          }
          return child;
        }),
      };
    }
    return node;
  });
}
