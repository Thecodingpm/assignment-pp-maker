'use client';

import React, { useState, useEffect } from 'react';
import { getCurrentEditor } from './EditorRegistry';
import {
  $createParagraphNode,
  $createTextNode,
  $createRangeSelection,
  $setSelection,
  $getSelection,
  $getRoot,
  $isRangeSelection
} from 'lexical';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { HeadingNode } from '@lexical/rich-text';

// Custom command constants
const INSERT_IMAGE_COMMAND = 'INSERT_IMAGE_COMMAND';
const INSERT_TABLE_COMMAND = 'INSERT_TABLE_COMMAND';



const $createListNode = (type: 'bullet' | 'number') => {
  const node = $createParagraphNode();
  // We'll rely on CSS styling instead of trying to set tags
  return node;
};

const $createListItemNode = () => {
  const node = $createParagraphNode();
  // We'll rely on CSS styling instead of trying to set tags
  return node;
};
import { INSERT_VIDEO_COMMAND } from './MediaCommands';
import { $createImageNode } from './ImageNode';
import TranslationButton from './TranslationButton';
import { applyFontFormat, applyColorFormat } from './CustomFormatPlugin';

interface LeftToolbarProps {
  // No props needed
}

export default function LeftToolbar({}: LeftToolbarProps) {
  const fonts = [
    // Most Popular Web Fonts
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Ubuntu', 'Playfair Display', 'Merriweather',
    // Essential System Fonts
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New',
    // Premium Web Fonts
    'Nunito', 'Work Sans', 'Raleway', 'Quicksand', 'Comfortaa', 'Josefin Sans', 'Bebas Neue', 'Pacifico',
    // Professional Fonts
    'Garamond', 'Baskerville', 'Palatino', 'Optima', 'Futura', 'Gill Sans', 'Myriad Pro', 'Segoe UI',
    // Modern & Beautiful Fonts
    'DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Albert Sans', 'Onest', 'Geist', 'Cabinet Grotesk', 'General Sans',
    // Serif & Display Fonts
    'Libre Baskerville', 'Crimson Text', 'Lora', 'Source Serif Pro', 'Merriweather', 'Playfair Display', 'Abril Fatface', 'Bodoni Moda',
    // Monospace & Coding Fonts
    'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Consolas', 'Menlo', 'SF Mono', 'Inconsolata',
    // Handwriting & Creative Fonts
    'Caveat', 'Dancing Script', 'Great Vibes', 'Satisfy', 'Kaushan Script', 'Allura', 'Alex Brush', 'Tangerine'
  ];

  const fontCategories = {
    all: fonts,
    web: ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat', 'Source Sans Pro', 'Ubuntu', 'Playfair Display', 'Merriweather'],
    system: ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Courier New'],
    premium: ['Nunito', 'Work Sans', 'Raleway', 'Quicksand', 'Comfortaa', 'Josefin Sans', 'Bebas Neue', 'Pacifico'],
    professional: ['Garamond', 'Baskerville', 'Palatino', 'Optima', 'Futura', 'Gill Sans', 'Myriad Pro', 'Segoe UI'],
    modern: ['DM Sans', 'Outfit', 'Plus Jakarta Sans', 'Albert Sans', 'Onest', 'Geist', 'Cabinet Grotesk', 'General Sans'],
    serif: ['Libre Baskerville', 'Crimson Text', 'Lora', 'Source Serif Pro', 'Merriweather', 'Playfair Display', 'Abril Fatface', 'Bodoni Moda'],
    monospace: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Monaco', 'Consolas', 'Menlo', 'SF Mono', 'Inconsolata'],
    creative: ['Caveat', 'Dancing Script', 'Great Vibes', 'Satisfy', 'Kaushan Script', 'Allura', 'Alex Brush', 'Tangerine']
  };

  const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#FFC0CB'];
  
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🙈', '🙉', '🙊', '👶', '👧', '🧒', '👦', '👩', '🧑', '👨', '👵', '🧓', '👴', '👮‍♀️', '👮', '👮‍♂️', '🕵️‍♀️', '🕵️', '🕵️‍♂️', '💂‍♀️', '💂', '💂‍♂️', '👷‍♀️', '👷', '👷‍♂️', '🤴', '👸', '👳‍♀️', '👳', '👳‍♂️', '👲', '🧕‍♀️', '🧕', '🧕‍♂️', '🤵‍♀️', '🤵', '🤵‍♂️', '👰‍♀️', '👰', '👰‍♂️', '🤰', '🤱', '👼', '🎅', '🤶', '🧙‍♀️', '🧙', '🧙‍♂️', '🧝‍♀️', '🧝', '🧝‍♂️', '🧛‍♀️', '🧛', '🧛‍♂️', '🧟‍♀️', '🧟', '🧟‍♂️', '🧞‍♀️', '🧞', '🧞‍♂️', '🧜‍♀️', '🧜', '🧜‍♂️', '🧚‍♀️', '🧚', '🧚‍♂️', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼', '👼'];
  
  const specialChars = ['©', '®', '™', '℠', '℗', '℡', '℣', 'ℤ', '℥', 'Ω', '℧', 'ℨ', '℩', 'K', 'Å', 'ℬ', 'ℭ', '℮', 'ℯ', 'ℰ', 'ℱ', 'Ⅎ', 'ℳ', 'ℴ', 'ℵ', 'ℶ', 'ℷ', 'ℸ', 'ℹ', '℺', '℻', 'ℼ', 'ℽ', 'ℾ', 'ℿ', '⅀', '⅁', '⅂', '⅃', '⅄', 'ⅅ', 'ⅆ', 'ⅇ', 'ⅈ', 'ⅉ', '⅊', '⅋', '⅌', '⅍', 'ⅎ', '⅏', '←', '↑', '→', '↓', '↔', '↕', '↖', '↗', '↘', '↙', '↚', '↛', '↜', '↝', '↞', '↟', '↠', '↡', '↢', '↣', '↤', '↥', '↦', '↧', '↨', '↩', '↪', '↫', '↬', '↭', '↮', '↯', '↰', '↱', '↲', '↳', '↴', '↵', '↶', '↷', '↸', '↹', '↺', '↻', '↼', '↽', '↾', '↿', '⇀', '⇁', '⇂', '⇃', '⇄', '⇅', '⇆', '⇇', '⇈', '⇉', '⇊', '⇋', '⇌', '⇍', '⇎', '⇏', '⇐', '⇑', '⇒', '⇓', '⇔', '⇕', '⇖', '⇗', '⇘', '⇙', '⇚', '⇛', '⇜', '⇝', '⇞', '⇟', '⇠', '⇡', '⇢', '⇣', '⇤', '⇥', '⇦', '⇧', '⇨', '⇩', '⇪'];

  const tabs = [
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'shapes', label: 'Shapes', icon: '🔷' },
    { id: 'media', label: 'Media', icon: '🖼️' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'tools', label: 'Tools', icon: '🛠️' },
    { id: 'math', label: 'Math', icon: '🧮' },
    { id: 'emojis', label: 'Emojis', icon: '😀' },
    { id: 'advanced', label: 'Advanced', icon: '⚙️' }
  ];

  const mathSymbols = [
    // Most commonly used symbols (top priority)
    '∑', '∫', '∏', '√', '∞', '±', '≤', '≥', '≠', '≈', '≡', '∈', '∉', '⊂', '⊃', '∪', '∩', '∴', '∵', 'α', 'β', 'γ', 'δ', 'θ', 'π', 'σ', 'μ', 'Δ', 'Ω',
    // Greek letters
    'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
    'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ', 'Φ', 'Χ', 'Ψ', 'Ω',
    // Mathematical operators
    '±', '∓', '×', '÷', '⋅', '∗', '∘', '⊗', '⊕', '⊖', '⊙', '⊘', '⊚', '⊛', '⊜', '⊝', '⊞', '⊟', '⊠', '⊡',
    // Comparison and logic
    '≤', '≥', '≠', '≈', '≡', '≅', '≃', '≅', '≉', '≊', '≋', '≌', '≍', '≎', '≏', '≐', '≑', '≒', '≓', '≔', '≕', '≖', '≗', '≘', '≙', '≚', '≛', '≜', '≝', '≞', '≟',
    // Set theory
    '∈', '∉', '∋', '∌', '⊂', '⊃', '⊆', '⊇', '⊊', '⊋', '⊏', '⊐', '⊑', '⊒', '⊓', '⊔', '⊎', '⊏', '⊐', '⊑', '⊒',
    '∪', '∩', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅', '∅',
    // Calculus and analysis
    '∫', '∬', '∭', '∮', '∯', '∰', '∱', '∲', '∳', '∑', '∏', '∐', '∂', '∇', '∆', '∎', '∏', '∐', '∅', '∅',
    // Arrows and relations
    '→', '←', '↔', '⇒', '⇐', '⇔', '↦', '↤', '↪', '↩', '↫', '↬', '↭', '↮', '↯', '↰', '↱', '↲', '↳', '↴', '↵', '↶', '↷', '↸', '↹', '↺', '↻', '↼', '↽', '↾', '↿', '⇀', '⇁', '⇂', '⇃', '⇄', '⇅', '⇆', '⇇', '⇈', '⇉', '⇊', '⇋', '⇌', '⇍', '⇎', '⇏', '⇐', '⇑', '⇒', '⇓', '⇔', '⇕', '⇖', '⇗', '⇘', '⇙', '⇚', '⇛', '⇜', '⇝', '⇞', '⇟', '⇠', '⇡', '⇢', '⇣', '⇤', '⇥', '⇦', '⇧', '⇨', '⇩', '⇪',
    // Subscripts and superscripts
    '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉', '₊', '₋', '₌', '₍', '₎', 'ₐ', 'ₑ', 'ₒ', 'ₓ', 'ₔ', 'ₕ', 'ₖ', 'ₗ', 'ₘ', 'ₙ', 'ₚ', 'ₛ', 'ₜ', '₝', '₞', '₟',
    '⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹', '⁺', '⁻', '⁼', '⁽', '⁾', 'ⁿ', 'ₐ', 'ₑ', 'ₒ', 'ₓ', 'ₔ', 'ₕ', 'ₖ', 'ₗ', 'ₘ', 'ₙ', 'ₚ', 'ₛ', 'ₜ', '₝', '₞', '₟',
    // Fractions and mathematical structures
    '⅟', '½', '⅓', '⅔', '¼', '¾', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅐', '⅛', '⅜', '⅝', '⅞', '⅑', '⅒', '⅓', '⅔', '⅕', '⅖', '⅗', '⅘', '⅙', '⅚', '⅛', '⅜', '⅝', '⅞',
    // Additional symbols
    '⌈', '⌉', '⌊', '⌋', '〈', '〉', '⌈', '⌉', '⌊', '⌋', '〈', '〉', '⌈', '⌉', '⌊', '⌋', '〈', '〉', '⌈', '⌉', '⌊', '⌋', '〈', '〉',
    '◊', '○', '●', '◐', '◑', '◒', '◓', '◔', '◕', '◖', '◗', '◘', '◙', '◚', '◛', '◜', '◝', '◞', '◟', '◠', '◡', '◢', '◣', '◤', '◥', '◦', '◧', '◨', '◩', '◪', '◫', '◬', '◭', '◮', '◯'
  ];

  const mathFormulas = [
    // Basic arithmetic
    'a + b = c', 'a - b = c', 'a × b = c', 'a ÷ b = c', 'a² + b² = c²',
    // Algebra
    'x² + y² = z²', 'ax² + bx + c = 0', 'y = mx + b', 'f(x) = x²', 'g(x) = √x',
    // Calculus
    '∫ f(x) dx', 'd/dx [f(x)]', 'lim(x→∞) f(x)', '∑(i=1 to n) x_i', '∏(i=1 to n) x_i',
    // Physics
    'E = mc²', 'F = ma', 'PV = nRT', 'E = hf', 'F = G(m₁m₂)/r²',
    // Geometry
    'A = πr²', 'C = 2πr', 'V = (4/3)πr³', 'A = ½bh', 'P = 2(l + w)',
    // Statistics
    'μ = (∑x)/n', 'σ = √(∑(x-μ)²/n)', 'P(A|B) = P(A∩B)/P(B)', 'r = ∑(xy)/√(∑x²∑y²)',
    // Trigonometry
    'sin²θ + cos²θ = 1', 'tan θ = sin θ/cos θ', 'csc θ = 1/sin θ', 'sec θ = 1/cos θ', 'cot θ = 1/tan θ',
    // Complex numbers
    'z = a + bi', '|z| = √(a² + b²)', 'e^(iπ) + 1 = 0', 'z* = a - bi',
    // Linear algebra
    'Ax = b', 'det(A) = |A|', 'A⁻¹A = I', 'tr(A) = ∑a_ii', 'rank(A) = r',
    // Number theory
    'gcd(a,b) = gcd(b,a mod b)', 'lcm(a,b) = |ab|/gcd(a,b)', 'φ(n) = n∏(1-1/p)', 'σ(n) = ∑d|n d',
    // Analysis
    '|f(x) - L| < ε', '∀ε > 0, ∃δ > 0', 'f\'(x) = lim(h→0) [f(x+h)-f(x)]/h', '∫_a^b f(x) dx = F(b) - F(a)',
    // Set theory
    'A ∪ B = {x | x ∈ A ∨ x ∈ B}', 'A ∩ B = {x | x ∈ A ∧ x ∈ B}', 'A ⊆ B ⇔ ∀x(x ∈ A → x ∈ B)', 'P(A) = {X | X ⊆ A}',
    // Logic
    'p ∧ q', 'p ∨ q', 'p → q', 'p ↔ q', '¬p', '∀x P(x)', '∃x P(x)', 'p ⊢ q', 'p ⊨ q'
  ];

  const templates = [
    'Meeting Agenda:\n1. Introduction\n2. Discussion Points\n3. Action Items\n4. Next Steps',
    'Project Plan:\n1. Project Overview\n2. Objectives\n3. Timeline\n4. Resources\n5. Risk Assessment',
    'Research Paper:\n1. Abstract\n2. Introduction\n3. Literature Review\n4. Methodology\n5. Results\n6. Discussion\n7. Conclusion',
    'Business Proposal:\n1. Executive Summary\n2. Problem Statement\n3. Solution\n4. Market Analysis\n5. Financial Projections',
    'Lesson Plan:\n1. Learning Objectives\n2. Materials\n3. Activities\n4. Assessment\n5. Homework'
  ];

  const shapes = ['rectangle', 'circle', 'triangle', 'star', 'diamond', 'hexagon', 'oval', 'polygon'];

  const [activeTab, setActiveTab] = useState('content');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHeadingPopup, setShowHeadingPopup] = useState(false);
  const [showMathDropdown, setShowMathDropdown] = useState(false);
  const [activeMathCategory, setActiveMathCategory] = useState('common');
  const [fontSearchTerm, setFontSearchTerm] = useState('');
  const [filteredFonts, setFilteredFonts] = useState(fonts);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [activeFontCategory, setActiveFontCategory] = useState('all');
  const [currentHeadingStyle, setCurrentHeadingStyle] = useState<'h1' | 'h2' | 'h3' | 'sub' | 'body' | 'caption' | null>(null);
  
  // Debug effect to log state changes
  useEffect(() => {
    console.log('🎯 currentHeadingStyle changed to:', currentHeadingStyle);
  }, [currentHeadingStyle]);
  
  // Function to set default formatting for new text using Lexical's built-in system
  const setDefaultFormatting = (font?: string, color?: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      console.log('Setting default formatting:', { font, color });
      
      // Store the default formatting in the editor's state
      editor.update(() => {
        const root = $getRoot();
        const selection = $getSelection();
        
        if ($isRangeSelection(selection)) {
          // Create a temporary text node with the desired formatting
          const tempText = $createTextNode(' ');
          
          // Apply the formatting to the temporary text
          if (font) {
            try {
              (tempText as any).setFormat('font-family', font);
            } catch (error) {
              (tempText as any).setFormat('custom-font', font);
            }
          }
          if (color) {
            try {
              (tempText as any).setFormat('color', color);
            } catch (error) {
              (tempText as any).setFormat('custom-color', color);
            }
          }
          
          // Insert the temporary text at the current cursor position
          selection.insertNodes([tempText]);
          
          // Remove the temporary text (this preserves the formatting context)
          tempText.remove();
          
          console.log('Default formatting context set for new text');
        }
      });
    }
  };

  // Function to apply formatting to selected text only
  const applyFormattingToSelection = (font?: string, color?: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      if (font) {
        applyFontFormat(editor, font);
        console.log('Font applied to selected text:', font);
      }
      if (color) {
        applyColorFormat(editor, color);
        console.log('Color applied to selection');
      }
    }
  };

  // Function to apply formatting to new text being typed
  const applyFormattingToNewText = (font?: string, color?: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      console.log('Applying formatting to new text:', { font, color });
      
      // Set this as the default formatting context for new text
      setDefaultFormatting(font, color);
      
      // Also store the selected values for future use
      if (font) setSelectedFont(font);
      if (color) setSelectedColor(color);
    }
  };

  // Function to ensure formatting context is maintained for new text
  const maintainFormattingContext = (font?: string, color?: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      // Always set the formatting context for new text
      setDefaultFormatting(font, color);
      
      // Update local state
      if (font) setSelectedFont(font);
      if (color) setSelectedColor(color);
    }
  };

  // Function to clear all formatting
  const clearFormatting = () => {
    // Reset to default values
    setSelectedFont('Inter');
    setSelectedColor('#000000');
    
    console.log('Formatting cleared');
  };

  // Function to apply formatting to the current cursor position
  const applyFormattingAtCursor = (font?: string, color?: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      if (font) {
        applyFontFormat(editor, font);
      }
      if (color) {
        applyColorFormat(editor, color);
      }
      console.log('Formatting context set at cursor:', { font, color });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.font-dropdown') && !target.closest('.color-dropdown') && !target.closest('.heading-popup') && !target.closest('.math-symbols-dropdown')) {
        setShowFontDropdown(false);
        setShowColorDropdown(false);
        setShowHeadingPopup(false);
        setShowMathDropdown(false);
        setFontSearchTerm('');
        setFilteredFonts(fonts);
        
        // Close math symbols dropdown
        setShowMathDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Text Insertion Functions
  const insertTextBlock = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('New text block'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertHeading = (level: 1 | 2 | 3) => {
    const editor = getCurrentEditor();
    if (!editor) return;
    
    editor.update(() => {
      const selection = $getSelection();
      
      if ($isRangeSelection(selection)) {
        // Get the selected text content
        const selectedText = selection.getTextContent();
        
        if (selectedText.length > 0) {
          // Convert selected text to heading
          const heading = new HeadingNode(`h${level}`);
          const textNode = $createTextNode(selectedText);
          heading.append(textNode);
          
          // Replace the selected content with the heading
          selection.insertNodes([heading]);
          
          // Set cursor at the end of the heading text
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(textNode.getKey(), selectedText.length, 'text');
          newSelection.focus.set(textNode.getKey(), selectedText.length, 'text');
          $setSelection(newSelection);
          
        } else {
          // No text selected, create new heading at cursor position
          const heading = new HeadingNode(`h${level}`);
          const textNode = $createTextNode(`Heading ${level}`);
          heading.append(textNode);
          
          // Insert the heading
          selection.insertNodes([heading]);
          
          // Select all the default text so user can immediately start typing
          const newSelection = $createRangeSelection();
          newSelection.anchor.set(textNode.getKey(), 0, 'text');
          newSelection.focus.set(textNode.getKey(), textNode.getTextContent().length, 'text');
          $setSelection(newSelection);
        }
      } else {
        // No selection, insert at root
        const root = $getRoot();
        const heading = new HeadingNode(`h${level}`);
        const textNode = $createTextNode(`Heading ${level}`);
        heading.append(textNode);
        
        root.append(heading);
        
        // Select the heading text
        const newSelection = $createRangeSelection();
        newSelection.anchor.set(textNode.getKey(), 0, 'text');
        newSelection.focus.set(textNode.getKey(), textNode.getTextContent().length, 'text');
        $setSelection(newSelection);
      }
    });
  };

  // Simple function to insert subheading text
  const insertSubheading = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          const text = $createTextNode('Subheading');
          (text as any).setFormat('font-size', '18px');
          (text as any).setFormat('font-weight', '600');
          (text as any).setFormat('color', '#6b7280');
          paragraph.append(text);
          
          // Add a space with the same formatting for new text
          const spaceText = $createTextNode(' ');
          (spaceText as any).setFormat('font-size', '18px');
          (spaceText as any).setFormat('font-weight', '600');
          (spaceText as any).setFormat('color', '#6b7280');
          paragraph.append(spaceText);
          
          selection.insertNodes([paragraph]);
          
          // Move cursor to the space character
          selection.anchor.set(paragraph.getKey(), 1, 'text');
          selection.focus.set(paragraph.getKey(), 1, 'text');
        }
      });
    }
  };

  // Simple function to insert body text
  const insertBody = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          const text = $createTextNode('Body text');
          (text as any).setFormat('font-size', '16px');
          (text as any).setFormat('font-weight', '400');
          paragraph.append(text);
          
          // Add a space with the same formatting for new text
          const spaceText = $createTextNode(' ');
          (spaceText as any).setFormat('font-size', '16px');
          (spaceText as any).setFormat('font-weight', '400');
          paragraph.append(spaceText);
          
          selection.insertNodes([paragraph]);
          
          // Move cursor to the space character
          selection.anchor.set(paragraph.getKey(), 1, 'text');
          selection.focus.set(paragraph.getKey(), 1, 'text');
        }
      });
    }
  };

  // Simple function to insert caption text
  const insertCaption = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          const text = $createTextNode('Caption text');
          (text as any).setFormat('font-size', '14px');
          (text as any).setFormat('font-weight', '400');
          (text as any).setFormat('color', '#9ca3af');
          paragraph.append(text);
          
          // Add a space with the same formatting for new text
          const spaceText = $createTextNode(' ');
          (spaceText as any).setFormat('font-size', '14px');
          (spaceText as any).setFormat('font-weight', '400');
          (spaceText as any).setFormat('color', '#9ca3af');
          paragraph.append(spaceText);
          
          selection.insertNodes([paragraph]);
          
          // Move cursor to the space character
          selection.anchor.set(paragraph.getKey(), 1, 'text');
          selection.focus.set(paragraph.getKey(), 1, 'text');
        }
      });
    }
  };

  const insertList = (type: 'ul' | 'ol') => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const list = type === 'ul' ? $createListNode('bullet') : $createListNode('number');
          const listItem = $createListItemNode();
          listItem.append($createTextNode('List item'));
          list.append(listItem);
          selection.insertNodes([list]);
        }
      });
    }
  };

  // Media Functions
  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            console.log('🎯 LeftToolbar: File read successfully, dispatching INSERT_IMAGE_COMMAND');
            const editor = getCurrentEditor();
            if (editor) {
              console.log('🎯 LeftToolbar: Editor found, dispatching command with result length:', result.length);
              // First, try to focus the editor
            const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
            if (editorElement) {
              editorElement.focus();
              console.log('🎯 LeftToolbar: Editor focused');
            }
            
            editor.dispatchCommand(INSERT_IMAGE_COMMAND, result);
              
              // Fallback: if command doesn't work, try direct insertion
              setTimeout(() => {
                console.log('🎯 LeftToolbar: Attempting fallback direct insertion...');
                editor.update(() => {
                  try {
                    const { $getRoot, $createParagraphNode } = require('lexical');
                    const { $createImageNode } = require('./ImageNode');
                    
                    const root = $getRoot();
                    const paragraph = $createParagraphNode();
                    const imageNode = $createImageNode(
                      result, // src
                      'Image', // alt
                      300, // width
                      200, // height
                      8, // borderRadius
                      1, // borderWidth
                      '#e5e7eb', // borderColor
                      '0 4px 6px -1px rgba(0,0,0,0.1)' // shadow
                    );
                    
                    paragraph.append(imageNode);
                    root.append(paragraph);
                    console.log('🎯 LeftToolbar: Fallback insertion successful');
                  } catch (error) {
                    console.error('🎯 LeftToolbar: Fallback insertion failed:', error);
                  }
                });
              }, 100);
            } else {
              console.error('🎯 LeftToolbar: No editor found!');
            }
          } else {
            console.error('🎯 LeftToolbar: File read failed - no result');
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const insertTable = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, { rows: 3, columns: 3 });
    }
  };

  const insertVideo = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            const editor = getCurrentEditor();
            if (editor) {
              editor.dispatchCommand(INSERT_VIDEO_COMMAND, result);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  };

  const insertAudio = () => {
    const editor = getCurrentEditor();
    if (editor) {
      const audioUrl = prompt('Enter audio URL:');
      if (audioUrl) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const paragraph = $createParagraphNode();
            paragraph.append($createTextNode(`[Audio: ${audioUrl}]`));
            selection.insertNodes([paragraph]);
          }
        });
      }
    }
  };

  // Advanced Content Functions
  const insertQuote = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('"Quote text here"'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertCode = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('console.log("Hello World");'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertChecklist = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('☐ Checklist item'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertCallout = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('💡 Important note: Your text here'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertMath = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('E = mc²'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertLink = () => {
    const editor = getCurrentEditor();
    if (editor) {
      const url = prompt('Enter URL:');
      const text = prompt('Enter link text:') || url;
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Create a link element
            const linkText = $createTextNode(text);
            linkText.setFormat('underline', true);
            linkText.setFormat('color', '#0066cc');
            
            // Insert the link text
            selection.insertNodes([linkText]);
            console.log('Link inserted:', url);
          }
        });
      }
    }
  };

  const insertDivider = () => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode('───────────────'));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  const insertEmoji = (emoji: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const text = $createTextNode(emoji);
          selection.insertNodes([text]);
        }
      });
    }
  };

  // Shape Functions
  const insertShape = (shape: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(`[${shape} Shape]`));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  // Template Functions
  const insertTemplate = (template: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(template));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  // Tool Functions
  const changeTextDirection = (direction: 'ltr' | 'rtl') => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.getNodes().forEach(node => {
            if (node.getParent()) {
              node.getParent()?.setDirection(direction);
            }
          });
        }
      });
    }
  };

  // Function to maintain current formatting context
  const maintainCurrentFormattingContext = () => {
    const editor = getCurrentEditor();
    if (editor) {
      // Set the current formatting as default for new text
      setDefaultFormatting(selectedFont, selectedColor);
    }
  };

  // Listen for editor focus events to maintain formatting context
  useEffect(() => {
    const handleEditorFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('lexical-editor')) {
        // Maintain formatting context when editor gains focus
        maintainCurrentFormattingContext();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('lexical-editor')) {
        // Ensure formatting context is maintained when typing
        maintainCurrentFormattingContext();
      }
    };

    // Close heading popup when pressing Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHeadingPopup(false);
      }
    };

    document.addEventListener('focusin', handleEditorFocus);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('focusin', handleEditorFocus);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [selectedFont, selectedColor]);

  // Advanced tools array - defined after all functions
  const advancedTools = [
    {
      name: 'Quote',
      icon: '💬',
      action: insertQuote
    },
    {
      name: 'Code',
      icon: '💻',
      action: insertCode
    },
    {
      name: 'Checklist',
      icon: '☐',
      action: insertChecklist
    },
    {
      name: 'Callout',
      icon: '💡',
      action: insertCallout
    },
    {
      name: 'Math',
      icon: '🧮',
      action: insertMath
    },
    {
      name: 'Link',
      icon: '🔗',
      action: insertLink
    },
    {
      name: 'Divider',
      icon: '➖',
      action: insertDivider
    }
  ];



  return (
    <div 
      className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out left-toolbar ${
        isCollapsed ? 'w-16' : 'w-80'
      } bg-white dark:bg-gray-50 border-r border-gray-200 dark:border-gray-300 shadow-lg z-50 overflow-hidden`} 
      style={{ 
        left: '-50px !important', 
        top: '-40px !important', 
        marginLeft: '0 !important', 
        marginRight: '0 !important', 
        paddingLeft: '0 !important', 
        paddingRight: '0 !important', 
        position: 'fixed !important' 
      }}
    >
      
      {/* Pages-style Header with Notion-like simplicity */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-gray-300 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Document Editor</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Create & design content</p>
          </div>
        </div>
      </div>

      {/* Canva-style Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-300 bg-gray-50 dark:bg-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search elements, templates, shapes..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white border border-gray-300 dark:border-gray-400 rounded-xl text-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 shadow-sm"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notion-style Tab Navigation */}
      <div className="px-6 py-4 bg-white dark:bg-gray-50">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-200 p-1.5 rounded-lg overflow-x-auto scrollbar-hide">
          {tabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-2.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-white text-gray-900 dark:text-gray-900 shadow-sm ring-1 ring-gray-200 dark:ring-gray-300'
                  : 'text-gray-600 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-800 hover:bg-gray-200 dark:hover:bg-gray-300'
              }`}
            >
              {!isCollapsed && tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Pages + Notion + Canva Mix */}
      <div className="px-6 py-4 h-[calc(100vh-200px)] overflow-visible bg-gray-50 dark:bg-gray-100" style={{ position: 'relative', zIndex: 99999 }}>
        {/* Content Tab - Notion-style blocks */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Basic blocks section */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Basic blocks</div>
              
              {/* Text Block - Notion-style */}
              <button
                onClick={insertTextBlock}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Text</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Just start writing</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Heading - Notion-style */}
              <button
                onClick={() => setShowHeadingPopup(!showHeadingPopup)}
                className={`w-full p-4 border rounded-lg transition-all duration-200 group mb-3 relative ${
                  showHeadingPopup 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                    : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">
                      {currentHeadingStyle === 'h1' ? 'Heading 1' : 
                       currentHeadingStyle === 'h2' ? 'Heading 2' : 
                       currentHeadingStyle === 'h3' ? 'Heading 3' : 
                       currentHeadingStyle === 'sub' ? 'Subheading' : 
                       currentHeadingStyle === 'body' ? 'Body Text' : 
                       currentHeadingStyle === 'caption' ? 'Caption' : 
                       'Heading 1'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {currentHeadingStyle === 'h1' ? 'Big section heading' : 
                       currentHeadingStyle === 'h2' ? 'Medium section heading' : 
                       currentHeadingStyle === 'h3' ? 'Small section heading' : 
                       currentHeadingStyle === 'sub' ? 'Subsection text' : 
                       currentHeadingStyle === 'body' ? 'Regular body text' : 
                       currentHeadingStyle === 'caption' ? 'Small caption text' : 
                       'Big section heading'}
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {/* Popup indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                
                {/* Heading Style Popup */}
                {showHeadingPopup && (
                  <div className="fixed bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg shadow-xl z-[999999] w-64 overflow-hidden heading-popup animate-in slide-in-from-left-2 duration-200" style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '320px',
                      top: '200px'
                    }}>

                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Heading Styles</div>
                      <div className="text-xs text-gray-500 mt-1">Current: {currentHeadingStyle || 'None'}</div>
                    </div>
                    
                    {/* Heading Options - Compact Grid */}
                    <div className="p-2">
                                              {/* Heading 1 */}
                        <button
                          onClick={() => {
                            console.log('🎯 H1 clicked - setting state to h1');
                            insertHeading(1);
                            setCurrentHeadingStyle('h1');
                            setSelectedColor('#111827');
                            setShowHeadingPopup(false);
                            console.log('🎯 H1 state updated');
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            currentHeadingStyle === 'h1' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-lg font-bold ${currentHeadingStyle === 'h1' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-900'}`}>H1</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">32px</div>
                          </div>
                        </button>
                      
                                              {/* Heading 2 */}
                        <button
                          onClick={() => {
                            console.log('🎯 H2 clicked - setting state to h2');
                            insertHeading(2);
                            setCurrentHeadingStyle('h2');
                            setSelectedColor('#1f2937');
                            setShowHeadingPopup(false);
                            console.log('🎯 H2 state updated');
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            currentHeadingStyle === 'h2' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-base font-semibold ${currentHeadingStyle === 'h2' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-900'}`}>H2</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">24px</div>
                          </div>
                        </button>
                      
                                              {/* Heading 3 */}
                        <button
                          onClick={() => {
                            insertHeading(3);
                            setCurrentHeadingStyle('h3');
                            setSelectedColor('#374151');
                            setShowHeadingPopup(false);
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            currentHeadingStyle === 'h3' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-semibold ${currentHeadingStyle === 'h3' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-900'}`}>H3</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">20px</div>
                          </div>
                        </button>
                        
                        {/* Test button to verify CSS */}
                        <button
                          onClick={() => {
                            console.log('🎯 TEST button clicked');
                            const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
                            if (editorElement) {
                              console.log('🎯 Found editor element:', editorElement);
                              
                              // Create test heading with INLINE styles to override everything
                              const testHeading = document.createElement('h1');
                              testHeading.textContent = 'TEST H1 - Should be 32px';
                              testHeading.style.cssText = `
                                font-size: 32px !important;
                                font-weight: 700 !important;
                                color: #111827 !important;
                                background-color: yellow !important;
                                padding: 10px !important;
                                border: 2px solid red !important;
                                margin: 20px 0 !important;
                              `;
                              
                              // Also inject CSS directly to test if that works
                              const testCSS = document.createElement('style');
                              testCSS.textContent = `
                                .injected-test-h1 {
                                  font-size: 32px !important;
                                  font-weight: 700 !important;
                                  color: #111827 !important;
                                  background-color: lime !important;
                                  padding: 10px !important;
                                  border: 3px solid blue !important;
                                  margin: 20px 0 !important;
                                }
                              `;
                              document.head.appendChild(testCSS);
                              testHeading.className = 'injected-test-h1';
                              
                              // Add to editor
                              editorElement.appendChild(testHeading);
                              console.log('🎯 Test H1 element added with inline styles');
                              
                              // Check computed styles
                              setTimeout(() => {
                                const computedStyle = window.getComputedStyle(testHeading);
                                console.log('🎯 Computed styles:', {
                                  fontSize: computedStyle.fontSize,
                                  fontWeight: computedStyle.fontWeight,
                                  color: computedStyle.color,
                                  backgroundColor: computedStyle.backgroundColor,
                                  border: computedStyle.border
                                });
                                
                                // Also check if our CSS is loaded
                                const styleSheets = Array.from(document.styleSheets);
                                const hasOurCSS = styleSheets.some(sheet => 
                                  sheet.href === null && 
                                  sheet.cssRules && 
                                  Array.from(sheet.cssRules).some(rule => 
                                    rule.cssText.includes('.lexical-editor h1')
                                  )
                                );
                                console.log('🎯 Our CSS loaded:', hasOurCSS);
                                
                                // Force a re-render
                                testHeading.style.display = 'none';
                                testHeading.offsetHeight; // Force reflow
                                testHeading.style.display = 'block';
                                console.log('🎯 Forced re-render of test heading');
                              }, 100);
                            } else {
                              console.log('❌ No editor element found');
                            }
                          }}
                          className="w-full p-2 text-left hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-600"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-red-700 dark:text-red-300">TEST</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">CSS Test</div>
                          </div>
                        </button>
                      
                                              {/* Subheading */}
                        <button
                          onClick={() => {
                            insertSubheading();
                            setCurrentHeadingStyle('sub');
                            setSelectedColor('#6b7280');
                            setShowHeadingPopup(false);
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            currentHeadingStyle === 'sub' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-semibold ${currentHeadingStyle === 'sub' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>Sub</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">18px</div>
                          </div>
                        </button>
                      
                                              {/* Body */}
                        <button
                          onClick={() => {
                            insertBody();
                            setCurrentHeadingStyle('body');
                            setShowHeadingPopup(false);
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            currentHeadingStyle === 'body' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-normal ${currentHeadingStyle === 'body' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-900'}`}>Body</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">16px</div>
                          </div>
                        </button>
                      
                                              {/* Caption */}
                        <button
                          onClick={() => {
                            insertCaption();
                            setCurrentHeadingStyle('caption');
                            setSelectedColor('#9ca3af');
                            setShowHeadingPopup(false);
                          }}
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group ${
                            currentHeadingStyle === 'caption' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-normal ${currentHeadingStyle === 'caption' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>Caption</div>
                            <div className="text-xs text-gray-400 dark:text-gray-400">14px</div>
                          </div>
                        </button>
                                          </div>
                    </div>
                )}
              </button>

              {/* Lists - Notion-style */}
              <button
                onClick={() => insertList('ul')}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Bullet list</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Create a simple list</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>


            </div>

            {/* Fonts section - Dropdown with search */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Fonts</div>
              <div className="relative">
                <button
                  onClick={() => {
                    console.log('Font button clicked, current state:', showFontDropdown);
                    if (showFontDropdown) {
                      setShowFontDropdown(false);
                      setFontSearchTerm('');
                      setFilteredFonts(fonts);
                      console.log('Font dropdown closed');
                    } else {
                      setShowFontDropdown(true);
                      console.log('Font dropdown opened');
                    }
                  }}
                  className={`w-full p-3 border transition-all duration-200 text-left flex items-center justify-between group ${
                    showFontDropdown 
                      ? 'bg-blue-50 dark:bg-blue-50 border-blue-300 dark:border-blue-300' 
                      : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-900">Font</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500" style={{ fontFamily: selectedFont }}>{selectedFont}</div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${showFontDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Font Dropdown */}
                {showFontDropdown && (
                  <div className="absolute bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-xl shadow-xl z-[99999] min-w-[300px] max-w-[350px] overflow-hidden font-dropdown" style={{ 
                    top: '100%',
                    left: '0',
                    marginTop: '8px',
                    position: 'absolute',
                    isolation: 'isolate'
                  }}>
                    {/* Search Input */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search fonts..."
                          value={fontSearchTerm}
                          onChange={(e) => {
                            const searchTerm = e.target.value;
                            setFontSearchTerm(searchTerm);
                            if (searchTerm.trim() === '') {
                              setFilteredFonts(fonts);
                            } else {
                              const filtered = fonts.filter(font => 
                                font.toLowerCase().includes(searchTerm.toLowerCase())
                              );
                              setFilteredFonts(filtered);
                            }
                          }}
                          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg text-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Font Categories */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-200 bg-gray-50 dark:bg-gray-100">
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(fontCategories).map(([key, categoryFonts]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveFontCategory(key);
                              setFilteredFonts(categoryFonts);
                              setFontSearchTerm('');
                            }}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                              activeFontCategory === key
                                ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'bg-gray-100 dark:bg-gray-200 text-gray-600 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-300'
                            }`}
                          >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Font List */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredFonts.map((font) => (
                        <button
                          key={font}
                          onClick={() => {
                            const editor = getCurrentEditor();
                            if (editor) {
                              console.log('Applying font:', font);
                              
                              // Apply formatting to selection if any, otherwise set as default for new text
                              applyFormattingToSelection(font, selectedColor);
                              
                              // Also apply formatting at cursor for immediate feedback
                              applyFormattingAtCursor(font, selectedColor);
                              
                              // Always maintain the formatting context for new text
                              maintainFormattingContext(font, selectedColor);
                              
                              setShowFontDropdown(false);
                              setFontSearchTerm('');
                              setFilteredFonts(fonts);
                              setActiveFontCategory('all');
                            } else {
                              console.log('No editor found');
                            }
                          }}
                          className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-b border-gray-50 dark:border-gray-100 last:border-b-0 group"
                          style={{ fontFamily: font }}
                        >
                          <div className="text-base font-medium text-gray-900 dark:text-gray-900 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">{font}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400">The quick brown fox jumps over the lazy dog</div>
                        </button>
                      ))}
                      {filteredFonts.length === 0 && (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No fonts found matching "{fontSearchTerm}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Colors section - Color picker box */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Colors</div>
              <div className="relative">
                <button
                  onClick={() => {
                    console.log('Color button clicked, current state:', showColorDropdown);
                    if (showColorDropdown) {
                      setShowColorDropdown(false);
                      console.log('Color dropdown closed');
                    } else {
                      setShowColorDropdown(true);
                      console.log('Color dropdown opened');
                    }
                  }}
                  className={`w-full p-3 border transition-all duration-200 text-left flex items-center justify-between group ${
                    showColorDropdown 
                      ? 'bg-blue-50 dark:bg-blue-50 border-blue-300 dark:border-blue-300' 
                      : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center border-2 border-gray-200 dark:border-gray-300" style={{ backgroundColor: selectedColor }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a4 4 0 014-4h5.5a4 4 0 014 4v12a4 4 0 01-4 4H7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-900">Color</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{selectedColor}</div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${showColorDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Color Picker Dropdown */}
                {showColorDropdown && (
                  <div className="absolute bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-xl shadow-xl z-[99999] min-w-[300px] max-w-[350px] p-4 color-dropdown" style={{ 
                    top: '100%',
                    left: '0',
                    marginTop: '8px',
                    position: 'absolute',
                    isolation: 'isolate'
                  }}>
                    {/* Search Input */}
                    <div className="mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search colors..."
                          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg text-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Quick Colors */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Colors</div>
                      <div className="grid grid-cols-8 gap-3">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              const editor = getCurrentEditor();
                              if (editor) {
                                console.log('Applying color:', color);
                                
                                // Apply this color as default for new text
                                applyFormattingToSelection(selectedFont, color);
                                
                                // Also apply formatting at cursor for immediate feedback
                                applyFormattingAtCursor(selectedFont, color);
                                
                                // Always maintain the formatting context for new text
                                maintainFormattingContext(selectedFont, color);
                                
                                // Store the selected color for future use
                                setSelectedColor(color);
                                setShowColorDropdown(false);
                              } else {
                                console.log('No editor found');
                              }
                            }}
                            className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-110 transition-all duration-200 shadow-sm group"
                            style={{ backgroundColor: color }}
                            title={`Apply ${color}`}
                          >
                            <div className="w-full h-full rounded-lg bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Color Palettes */}
                    <div className="mb-6">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Color Palettes</div>
                      <div className="space-y-3">
                        {/* Professional Palette */}
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Professional</div>
                          <div className="flex gap-2">
                            {['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb'].map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  const editor = getCurrentEditor();
                                  if (editor) {
                                    console.log('Applying color:', color);
                                    
                                    // Apply this color as default for new text
                                    applyFormattingToSelection(selectedFont, color);
                                    
                                    // Always maintain the formatting context for new text
                                    maintainFormattingContext(selectedFont, color);
                                    
                                    // Store the selected color for future use
                                    setSelectedColor(color);
                                    setShowColorDropdown(false);
                                  } else {
                                    console.log('No editor found');
                                  }
                                }}
                                className="w-8 h-8 rounded border border-gray-200 dark:border-gray-300 hover:scale-110 transition-colors"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Vibrant Palette */}
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vibrant</div>
                          <div className="flex gap-2">
                            {['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  const editor = getCurrentEditor();
                                  if (editor) {
                                    console.log('Applying color:', color);
                                    
                                    // Apply this color as default for new text
                                    applyFormattingToSelection(selectedFont, color);
                                    
                                    // Always maintain the formatting context for new text
                                    maintainFormattingContext(selectedFont, color);
                                    
                                    // Store the selected color for future use
                                    setSelectedColor(color);
                                    setShowColorDropdown(false);
                                  } else {
                                    console.log('No editor found');
                                  }
                                }}
                                className="w-8 h-8 rounded border border-gray-200 dark:border-gray-300 hover:scale-110 transition-all duration-200"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Color Input */}
                    <div>
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Custom Color</div>
                      <div className="flex gap-3 items-center">
                        <input
                          type="color"
                          className="w-14 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-300 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                          onChange={(e) => {
                            const color = e.target.value;
                            const editor = getCurrentEditor();
                            if (editor) {
                              console.log('Applying color:', color);
                              
                              // Apply this color as default for new text
                              applyFormattingToSelection(selectedFont, color);
                              
                              // Always maintain the formatting context for new text
                              maintainFormattingContext(selectedFont, color);
                              
                              // Store the selected color for future use
                              setSelectedColor(color);
                              setShowColorDropdown(false);
                            } else {
                              console.log('No editor found');
                            }
                          }}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="#000000"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg text-sm text-gray-900 dark:text-gray-900 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200"
                            onChange={(e) => {
                              const color = e.target.value;
                              if (color.match(/^#[0-9A-F]{6}$/i)) {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  console.log('Applying color:', color);
                                  
                                  // Apply this color as default for new text
                                  applyFormattingToSelection(selectedFont, color);
                                  
                                  // Always maintain the formatting context for new text
                                  maintainFormattingContext(selectedFont, color);
                                  
                                  // Store the selected color for future use
                                  setSelectedColor(color);
                                  setShowColorDropdown(false);
                                } else {
                                  console.log('No editor found');
                                }
                                setShowColorDropdown(false);
                              }
                            }}
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">Enter hex color code</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media & Elements section */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Media & Elements</div>



              {/* Image - Canva-style */}
              <button
                onClick={insertImage}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-200 transition-colors">
                    <svg className="w-5 h-5 text-pink-600 dark:text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Image</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Upload from file</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Video - Canva-style */}
              <button
                onClick={insertVideo}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Video</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Upload from file</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Table - Pages-style */}
              <button
                onClick={insertTable}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-200 transition-colors">
                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Table</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Add a data table</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>

            {/* Mathematical Symbols section */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Mathematical Symbols</div>
              
              {/* Quick Access - Most Common Symbols */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Quick Access</div>
                <div className="grid grid-cols-8 gap-2">
                  {mathSymbols.slice(0, 16).map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(symbol);
                            }
                          });
                        }
                      }}
                      className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                      title={`Insert ${symbol}`}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>

                             {/* All Symbols Dropdown */}
               <div className="relative overflow-visible" style={{ minHeight: '500px' }}>
                                 <button
                                     onClick={() => {
                                       const newState = !showMathDropdown;
                                       setShowMathDropdown(newState);
                                       console.log('Math dropdown state changed to:', newState);
                                       if (newState) {
                                         // Force a re-render and check positioning
                                         setTimeout(() => {
                                           const dropdown = document.querySelector('.math-symbols-dropdown');
                                           const container = dropdown?.parentElement;
                                           if (dropdown) {
                                             console.log('Dropdown element found:', dropdown);
                                             console.log('Dropdown position:', dropdown.getBoundingClientRect());
                                             console.log('Dropdown z-index:', window.getComputedStyle(dropdown).zIndex);
                                             console.log('Container dimensions:', container?.getBoundingClientRect());
                                             console.log('Container overflow:', window.getComputedStyle(container || document.body).overflow);
                                             console.log('Dropdown computed styles:', {
                                               display: window.getComputedStyle(dropdown).display,
                                               visibility: window.getComputedStyle(dropdown).visibility,
                                               opacity: window.getComputedStyle(dropdown).opacity,
                                               position: window.getComputedStyle(dropdown).position
                                             });
                                           } else {
                                             console.log('Dropdown element not found');
                                           }
                                         }, 100);
                                       }
                                     }}
                  className={`w-full p-3 border transition-all duration-200 text-left flex items-center justify-between group ${
                    showMathDropdown 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' 
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-600 hover:from-blue-100 dark:hover:from-blue-900/30 hover:to-indigo-100 dark:hover:to-indigo-900/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M9 11h.01M12 11h.01M15 8h.01M9 8h.01M12 8h.01M15 5h.01M9 5h.01M12 5h.01M15 2h.01M9 2h.01M12 2h.01" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-900">All Mathematical Symbols</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Greek letters, operators, formulas & more</div>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                 {/* Math Symbols Dropdown */}
                 {showMathDropdown && (
                   <div className="absolute bg-white dark:bg-white border-2 border-red-500 rounded-xl shadow-xl z-[99999] min-w-[400px] max-w-[500px] overflow-hidden math-symbols-dropdown" style={{ 
                     top: '-200px',
                     left: '0',
                     position: 'absolute',
                     isolation: 'isolate',
                     transform: 'translateZ(0)',
                     willChange: 'transform',
                     backgroundColor: 'white',
                     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                     pointerEvents: 'auto',
                     visibility: 'visible',
                     minHeight: '400px',
                     width: '400px'
                   }}>
                  {/* Header */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 relative">
                    {/* Arrow indicator for top positioning */}
                    <div className="absolute top-full left-6 w-4 h-4 bg-white dark:bg-white border-l border-t border-gray-200 dark:border-gray-300 transform rotate-45"></div>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mathematical Symbols Library</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Click any symbol to insert into your document</div>
                  </div>
                  
                  {/* Tabs for different symbol categories */}
                  <div className="p-3 border-b border-gray-100 dark:border-gray-200 bg-gray-50 dark:bg-gray-100">
                    <div className="flex gap-2 flex-wrap">
                      {['common', 'greek', 'operators', 'arrows', 'formulas'].map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setActiveMathCategory(category);
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                            activeMathCategory === category
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                              : 'bg-gray-100 dark:bg-gray-200 text-gray-600 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-300'
                          }`}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="max-h-96 overflow-y-auto p-4">
                    {/* Common Symbols */}
                    {activeMathCategory === 'common' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-3">Most Common Symbols</div>
                        <div className="grid grid-cols-8 gap-2">
                          {mathSymbols.slice(0, 32).map((symbol) => (
                            <button
                              key={symbol}
                              onClick={() => {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                      selection.insertText(symbol);
                                    }
                                  });
                                }
                              }}
                              className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                              title={`Insert ${symbol}`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Greek Letters */}
                    {activeMathCategory === 'greek' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-3">Greek Letters</div>
                        <div className="grid grid-cols-8 gap-2">
                          {mathSymbols.slice(32, 80).map((symbol) => (
                            <button
                              key={symbol}
                              onClick={() => {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                      selection.insertText(symbol);
                                    }
                                  });
                                }
                              }}
                              className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-green-600 dark:hover:text-green-400"
                              title={`Insert ${symbol}`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mathematical Operators */}
                    {activeMathCategory === 'operators' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-3">Mathematical Operators</div>
                        <div className="grid grid-cols-8 gap-2">
                          {mathSymbols.slice(80, 120).map((symbol) => (
                            <button
                              key={symbol}
                              onClick={() => {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                      selection.insertText(symbol);
                                    }
                                  });
                                }
                              }}
                              className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-purple-600 dark:hover:text-purple-400"
                              title={`Insert ${symbol}`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Arrows and Relations */}
                    {activeMathCategory === 'arrows' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-3">Arrows & Relations</div>
                        <div className="grid grid-cols-8 gap-2">
                          {mathSymbols.slice(120, 180).map((symbol) => (
                            <button
                              key={symbol}
                              onClick={() => {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                      selection.insertText(symbol);
                                    }
                                  });
                                }
                              }}
                              className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-orange-600 dark:hover:text-orange-400"
                              title={`Insert ${symbol}`}
                            >
                              {symbol}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Formulas */}
                    {activeMathCategory === 'formulas' && (
                      <div>
                        <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-3">Common Formulas</div>
                        <div className="space-y-2">
                          {mathFormulas.slice(0, 15).map((formula) => (
                            <button
                              key={formula}
                              onClick={() => {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const selection = $getSelection();
                                    if ($isRangeSelection(selection)) {
                                      selection.insertText(formula);
                                    }
                                  });
                                }
                              }}
                              className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 text-center font-mono text-sm hover:text-orange-600 dark:hover:text-orange-400"
                            >
                              {formula}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                 )}
              </div>
            </div>

            {/* Text Formatting */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Text Formatting</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Toggle bold formatting
                            const isBold = selection.hasFormat('bold');
                            selection.formatText('bold', !isBold);
                          } else {
                            // Set bold as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-900 mb-1">B</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Bold</div>
                </button>
                
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Toggle italic formatting
                            const isItalic = selection.hasFormat('italic');
                            selection.formatText('italic', !isItalic);
                          } else {
                            // Set italic as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg italic text-gray-900 dark:text-gray-900 mb-1">I</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Italic</div>
                </button>
                
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Toggle underline formatting
                            const isUnderline = selection.hasFormat('underline');
                            selection.formatText('underline', !isUnderline);
                          } else {
                            // Set underline as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg underline text-gray-900 dark:text-gray-900 mb-1">U</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Underline</div>
                </button>
                
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Toggle strikethrough formatting
                            const isStrikethrough = selection.hasFormat('strikethrough');
                            selection.formatText('strikethrough', !isStrikethrough);
                          } else {
                            // Set strikethrough as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg line-through text-gray-900 dark:text-gray-900 mb-1">S</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Strike</div>
                </button>
              </div>
              
              {/* Clear Formatting Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Clear all formatting from selected text
                            selection.formatText('bold', false);
                            selection.formatText('italic', false);
                            selection.formatText('underline', false);
                            selection.formatText('strikethrough', false);
                            selection.formatText('font-family', 'Inter');
                            selection.formatText('color', '#000000');
                            console.log('Formatting cleared from selection');
                          }
                        }
                      });
                    }
                  }}
                  className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 text-center group"
                >
                  <div className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Clear Formatting</div>
                  <div className="text-xs text-red-500 dark:text-red-400">Remove all formatting</div>
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Text Alignment</div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Apply left alignment to selected text
                            selection.formatText('text-align', 'left');
                          } else {
                            // Set left alignment as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg text-gray-900 dark:text-gray-900 mb-1">⫷</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Left</div>
                </button>
                
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Apply center alignment to selected text
                            selection.formatText('text-align', 'center');
                          } else {
                            // Set center alignment as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg text-gray-900 dark:text-gray-900 mb-1">⫸</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Center</div>
                </button>
                
                <button
                  onClick={() => {
                    const editor = getCurrentEditor();
                    if (editor) {
                      editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                          if (!selection.isCollapsed()) {
                            // Apply right alignment to selected text
                            selection.formatText('text-align', 'right');
                          } else {
                            // Set right alignment as default for new text
                            maintainFormattingContext(selectedFont, selectedColor);
                          }
                        }
                      });
                    }
                  }}
                  className="p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-center group"
                >
                  <div className="text-lg text-gray-900 dark:text-gray-900 mb-1">⫹</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Right</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Shapes Tab - Canva-style */}
        {activeTab === 'shapes' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Shapes & Elements</div>
            
            <div className="grid grid-cols-2 gap-3">
              {shapes.map((shape) => (
                <button
                  key={shape}
                  onClick={() => insertShape(shape)}
                  className="p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-100 dark:to-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-all duration-200">
                    <div className="w-6 h-6 bg-blue-500 rounded-sm"></div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 capitalize">{shape}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Add shape</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Media Tab - Canva-style */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Media</div>
            
            <button
              onClick={insertImage}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-200 transition-colors">
                  <svg className="w-5 h-5 text-pink-600 dark:text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Image</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Upload or embed</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onClick={insertVideo}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-200 transition-colors">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Video</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Upload from file</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Templates Tab - Pages-style */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Templates</div>
            
            {templates.slice(0, 3).map((template, index) => (
              <button
                key={index}
                onClick={() => insertTemplate(template)}
                className="w-full p-4 bg-gradient-to-br from-white to-gray-50 dark:from-white dark:to-gray-50 border border-gray-200 dark:border-gray-300 rounded-lg hover:from-gray-50 dark:hover:from-gray-50 hover:to-gray-100 dark:hover:to-gray-100 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-200 shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Template {index + 1}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{template.split('\n')[0]}...</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tools Tab - Notion-style */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Tools</div>
            
            {/* Translation Button */}
            <div className="p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg">
              <TranslationButton variant="left" className="w-full" />
            </div>
            
            <button
              onClick={() => changeTextDirection('ltr')}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Left to Right</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Change text direction</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onClick={() => changeTextDirection('rtl')}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Right to Left</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Change text direction</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            <button
              onClick={insertDivider}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Divider</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Add a visual separator</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Advanced Tab - Pages-style */}
        {activeTab === 'advanced' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Advanced</div>
            
            {/* Translation Button */}
            <div className="p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg">
              <TranslationButton variant="left" className="w-full" />
            </div>
            
            {advancedTools.map((tool, index) => (
              <button
                key={index}
                onClick={tool.action}
                className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-100 rounded-lg flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-200 transition-colors">
                    <span className="text-lg">{tool.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">{tool.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Advanced feature</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Media & Elements Tab - Pages-style */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2 mt-6">Media & Elements</div>

            {/* Image - Canva-style */}
            <button
              onClick={insertImage}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-200 transition-colors">
                  <svg className="w-5 h-5 text-pink-600 dark:text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Image</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Upload from file</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Table - Pages-style */}
            <button
              onClick={insertTable}
              className="w-full p-4 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Table</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Add a data table</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Math Tab - Professional */}
        {activeTab === 'math' && (
          <div className="space-y-6 overflow-visible" style={{ position: 'relative', zIndex: 99999 }}>
            {/* Most Common Symbols */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Most Common</div>
              <div className="grid grid-cols-8 gap-2">
                {mathSymbols.slice(0, 32).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(symbol);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
                    title={`Insert ${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Greek Letters */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Greek Letters</div>
              <div className="grid grid-cols-8 gap-2">
                {mathSymbols.slice(32, 80).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(symbol);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-green-600 dark:hover:text-green-400"
                    title={`Insert ${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Mathematical Operators */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Operators</div>
              <div className="grid grid-cols-8 gap-2">
                {mathSymbols.slice(80, 120).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(symbol);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-purple-600 dark:hover:text-purple-400"
                    title={`Insert ${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Arrows and Relations */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Arrows & Relations</div>
              <div className="grid grid-cols-8 gap-2">
                {mathSymbols.slice(120, 180).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(symbol);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-orange-600 dark:hover:text-orange-400"
                    title={`Insert ${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Subscripts and Superscripts */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Subscripts & Superscripts</div>
              <div className="grid grid-cols-8 gap-2">
                {mathSymbols.slice(180, 240).map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(symbol);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 dark:hover:border-pink-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-pink-600 dark:hover:text-pink-400"
                    title={`Insert ${symbol}`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Common Formulas */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Common Formulas</div>
              
              {/* Basic Arithmetic */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Basic Arithmetic</div>
                <div className="grid grid-cols-1 gap-2">
                  {mathFormulas.slice(0, 5).map((formula) => (
                    <button
                      key={formula}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(formula);
                            }
                          });
                        }
                      }}
                      className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 text-center font-mono text-sm hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {formula}
                    </button>
                  ))}
                </div>
              </div>

              {/* Algebra */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Algebra</div>
                <div className="grid grid-cols-1 gap-2">
                  {mathFormulas.slice(5, 10).map((formula) => (
                    <button
                      key={formula}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(formula);
                            }
                          });
                        }
                      }}
                      className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200 text-center font-mono text-sm hover:text-green-600 dark:hover:text-green-400"
                    >
                      {formula}
                    </button>
                  ))}
                </div>
              </div>

              {/* Calculus */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Calculus</div>
                <div className="grid grid-cols-1 gap-2">
                  {mathFormulas.slice(10, 15).map((formula) => (
                    <button
                      key={formula}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(formula);
                            }
                          });
                        }
                      }}
                      className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-center font-mono text-sm hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      {formula}
                    </button>
                  ))}
                </div>
              </div>

              {/* Physics */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">Physics</div>
                <div className="grid grid-cols-1 gap-2">
                  {mathFormulas.slice(15, 20).map((formula) => (
                    <button
                      key={formula}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(formula);
                            }
                          });
                        }
                      }}
                      className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 text-center font-mono text-sm hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      {formula}
                    </button>
                  ))}
                </div>
              </div>

              {/* More formulas in a scrollable container */}
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">More Formulas</div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {mathFormulas.slice(20).map((formula) => (
                    <button
                      key={formula}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(formula);
                            }
                          });
                        }
                      }}
                      className="w-full p-3 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 text-center font-mono text-sm"
                    >
                      {formula}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Emojis Tab - Fun and Expressive */}
        {activeTab === 'emojis' && (
          <div className="space-y-6">
            {/* Popular Emojis */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Popular Emojis</div>
              <div className="grid grid-cols-8 gap-2">
                {emojis.slice(0, 64).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(emoji);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-200 flex items-center justify-center text-lg hover:scale-110"
                    title={`Insert ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Characters */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Special Characters</div>
              <div className="grid grid-cols-8 gap-2">
                {specialChars.slice(0, 64).map((char) => (
                  <button
                    key={char}
                    onClick={() => {
                      const editor = getCurrentEditor();
                      if (editor) {
                        editor.update(() => {
                          const selection = $getSelection();
                          if ($isRangeSelection(selection)) {
                            selection.insertText(char);
                          }
                        });
                      }
                    }}
                    className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title={`Insert ${char}`}
                  >
                    {char}
                  </button>
                ))}
              </div>
            </div>

            {/* More Emojis */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">More Emojis</div>
              <div className="max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-2">
                  {emojis.slice(64).map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        const editor = getCurrentEditor();
                        if (editor) {
                          editor.update(() => {
                            const selection = $getSelection();
                            if ($isRangeSelection(selection)) {
                              selection.insertText(emoji);
                            }
                          });
                        }
                      }}
                      className="w-10 h-10 bg-white dark:bg-white border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-300 dark:hover:border-yellow-600 transition-all duration-200 flex items-center justify-center text-lg hover:scale-110"
                      title={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 