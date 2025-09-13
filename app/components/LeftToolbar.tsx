'use client';

import React, { useState, useEffect } from 'react';
// EditorRegistry removed
// Mock function to replace getCurrentEditor
const getCurrentEditor = () => null;
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
// MediaCommands and SimpleFormatPlugin removed
import TranslationButton from './TranslationButton';

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



  const shapes = ['rectangle', 'circle', 'triangle', 'star', 'diamond', 'hexagon', 'oval', 'polygon'];

  // Tables data
  const tableCategories = {
    basic: {
      name: 'Basic',
      tables: [
        { id: '3x3-header-row-col', name: '3x3 Header Row & Col', description: 'Table with header row and first column highlighted', preview: '3x3' },
        { id: '3x3-header-row', name: '3x3 Header Row', description: 'Table with header row highlighted', preview: '3x3' },
        { id: '3x3-plain', name: '3x3 Plain', description: 'Basic table with no highlights', preview: '3x3' },
        { id: '3x3-header-col', name: '3x3 Header Column', description: 'Table with first column highlighted', preview: '3x3' }
      ]
    },
    structured: {
      name: 'Structured',
      tables: [
        { id: '4x4-header', name: '4x4 Header', description: '4x4 table with header row', preview: '4x4' },
        { id: '5x5-header', name: '5x5 Header', description: '5x5 table with header row', preview: '5x5' },
        { id: '3x5-header', name: '3x5 Header', description: '3 columns, 5 rows with header', preview: '3x5' },
        { id: '5x3-header', name: '5x3 Header', description: '5 columns, 3 rows with header', preview: '5x3' }
      ]
    },
    data: {
      name: 'Data Tables',
      tables: [
        { id: 'data-table', name: 'Data Table', description: 'Table optimized for data display', preview: 'Data' },
        { id: 'comparison-table', name: 'Comparison', description: 'Table for comparing items', preview: 'Comp' },
        { id: 'pricing-table', name: 'Pricing', description: 'Table for pricing information', preview: 'Price' },
        { id: 'schedule-table', name: 'Schedule', description: 'Table for scheduling', preview: 'Sched' }
      ]
    }
  };

  // Charts data
  const chartCategories = {
    '2d': {
      name: '2D',
      charts: [
        { id: 'bar-vertical', name: 'Vertical Bar', icon: '📊', description: 'Vertical bar chart' },
        { id: 'bar-stacked-vertical', name: 'Stacked Bar', icon: '📈', description: 'Stacked vertical bar chart' },
        { id: 'bar-horizontal', name: 'Horizontal Bar', icon: '📉', description: 'Horizontal bar chart' },
        { id: 'bar-stacked-horizontal', name: 'Stacked Horizontal', icon: '📊', description: 'Stacked horizontal bar chart' },
        { id: 'area', name: 'Area Chart', icon: '📊', description: 'Area chart' },
        { id: 'area-stacked', name: 'Stacked Area', icon: '📈', description: 'Stacked area chart' },
        { id: 'pie', name: 'Pie Chart', icon: '🥧', description: 'Pie chart' },
        { id: 'donut', name: 'Donut Chart', icon: '🍩', description: 'Donut chart' },
        { id: 'line', name: 'Line Chart', icon: '📈', description: 'Line chart' },
        { id: 'combo-bar-line', name: 'Combo Chart', icon: '📊', description: 'Bar and line combination' },
        { id: 'scatter', name: 'Scatter Plot', icon: '🔍', description: 'Scatter plot' },
        { id: 'bubble', name: 'Bubble Chart', icon: '🫧', description: 'Bubble chart' }
      ]
    },
    '3d': {
      name: '3D',
      charts: [
        { id: '3d-bar', name: '3D Bar', icon: '📊', description: '3D bar chart' },
        { id: '3d-pie', name: '3D Pie', icon: '🥧', description: '3D pie chart' },
        { id: '3d-surface', name: '3D Surface', icon: '🏔️', description: '3D surface chart' },
        { id: '3d-scatter', name: '3D Scatter', icon: '🔍', description: '3D scatter plot' }
      ]
    },
    interactive: {
      name: 'Interactive',
      charts: [
        { id: 'interactive-bar', name: 'Interactive Bar', icon: '📊', description: 'Interactive bar chart' },
        { id: 'interactive-pie', name: 'Interactive Pie', icon: '🥧', description: 'Interactive pie chart' },
        { id: 'interactive-line', name: 'Interactive Line', icon: '📈', description: 'Interactive line chart' },
        { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Interactive dashboard' }
      ]
    }
  };

  // Enhanced shapes data with categories and icons
  const shapeCategories = {
    basic: {
      name: 'Basic',
      shapes: [
        { id: 'line', name: 'Line', icon: '╱', description: 'Diagonal line' },
        { id: 'arrow-up-right', name: 'Arrow Up-Right', icon: '↗', description: 'Diagonal arrow' },
        { id: 'curve', name: 'Curve', icon: '⌒', description: 'Curved path' },
        { id: 'square', name: 'Square', icon: '■', description: 'Solid square' },
        { id: 'rounded-rect', name: 'Rounded Rectangle', icon: '▢', description: 'Rounded rectangle' },
        { id: 'circle', name: 'Circle', icon: '●', description: 'Solid circle' },
        { id: 'triangle', name: 'Triangle', icon: '▲', description: 'Equilateral triangle' },
        { id: 'right-triangle', name: 'Right Triangle', icon: '◣', description: 'Right-angled triangle' },
        { id: 'arrow-right', name: 'Arrow Right', icon: '→', description: 'Right-pointing arrow' },
        { id: 'double-arrow', name: 'Double Arrow', icon: '↔', description: 'Double-headed arrow' },
        { id: 'diamond', name: 'Diamond', icon: '◆', description: 'Diamond shape' },
        { id: 'speech-bubble', name: 'Speech Bubble', icon: '💬', description: 'Speech bubble' },
        { id: 'pentagon', name: 'Pentagon', icon: '⬟', description: 'Five-sided polygon' },
        { id: 'star', name: 'Star', icon: '★', description: 'Five-pointed star' }
      ]
    },
    geometry: {
      name: 'Geometry',
      shapes: [
        { id: 'hexagon', name: 'Hexagon', icon: '⬡', description: 'Six-sided polygon' },
        { id: 'octagon', name: 'Octagon', icon: '⬢', description: 'Eight-sided polygon' },
        { id: 'cross', name: 'Cross', icon: '✚', description: 'Plus symbol' },
        { id: 'ellipse', name: 'Ellipse', icon: '⬭', description: 'Oval shape' },
        { id: 'parallelogram', name: 'Parallelogram', icon: '▱', description: 'Slanted rectangle' },
        { id: 'trapezoid', name: 'Trapezoid', icon: '⏢', description: 'Trapezoid shape' }
      ]
    },
    objects: {
      name: 'Objects',
      shapes: [
        { id: 'cube', name: 'Cube', icon: '⬛', description: '3D cube' },
        { id: 'cylinder', name: 'Cylinder', icon: '⬡', description: '3D cylinder' },
        { id: 'sphere', name: 'Sphere', icon: '●', description: '3D sphere' },
        { id: 'pyramid', name: 'Pyramid', icon: '▲', description: '3D pyramid' }
      ]
    },
    nature: {
      name: 'Nature',
      shapes: [
        { id: 'leaf', name: 'Leaf', icon: '🍃', description: 'Leaf shape' },
        { id: 'flower', name: 'Flower', icon: '🌸', description: 'Flower shape' },
        { id: 'tree', name: 'Tree', icon: '🌳', description: 'Tree shape' },
        { id: 'cloud', name: 'Cloud', icon: '☁', description: 'Cloud shape' }
      ]
    },
    symbols: {
      name: 'Symbols',
      shapes: [
        { id: 'heart', name: 'Heart', icon: '❤', description: 'Heart symbol' },
        { id: 'infinity', name: 'Infinity', icon: '∞', description: 'Infinity symbol' },
        { id: 'checkmark', name: 'Checkmark', icon: '✓', description: 'Check mark' },
        { id: 'x-mark', name: 'X Mark', icon: '✗', description: 'X mark' }
      ]
    }
  };

  // List Styles data
  const listStyles = [
    { id: 'none', name: 'None', icon: '', description: 'No list formatting' },
    { id: 'none1', name: 'None 1', icon: '', description: 'No list formatting variant 1' },
    { id: 'bullet', name: 'Bullet', icon: '•', description: 'Simple bullet points' },
    { id: 'bullet-big', name: 'Bullet Big', icon: '●', description: 'Large bullet points' },
    { id: 'image', name: 'Image', icon: '☐', description: 'Image-based bullets' },
    { id: 'lettered', name: 'Lettered', icon: 'A.', description: 'A, B, C... format' },
    { id: 'numbered', name: 'Numbered', icon: '1.', description: '1, 2, 3... format' },
    { id: 'harvard', name: 'Harvard', icon: 'I.', description: 'I, II, III... format' },
    { id: 'dash', name: 'Dash', icon: '-', description: 'Dash-separated items' },
    { id: 'note-taking', name: 'Note Taking', icon: '☑', description: 'Checkbox-style items' }
  ];

  const [activeTab, setActiveTab] = useState('content');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showHeadingPopup, setShowHeadingPopup] = useState(false);
  const [showListPopup, setShowListPopup] = useState(false);
  const [showShapesPopup, setShowShapesPopup] = useState(false);
  const [showMathDropdown, setShowMathDropdown] = useState(false);
  const [activeMathCategory, setActiveMathCategory] = useState('common');
  const [fontSearchTerm, setFontSearchTerm] = useState('');
  const [filteredFonts, setFilteredFonts] = useState(fonts);
  const [selectedFont, setSelectedFont] = useState('Inter');
  const [selectedColor, setSelectedColor] = useState('#000000');
  
  // Function to handle color changes
  const handleColorChange = (color: string) => {
    console.log(`LeftToolbar: Text color changed to ${color}`);
    
    const editor = getCurrentEditor();
    if (editor) {
      // SimpleFormatPlugin removed - color application disabled
      
      // Update component state
      setSelectedColor(color);
        
        // Ensure editor focus is maintained
        setTimeout(() => {
          const contentEditable = document.querySelector('[contenteditable="true"]') as HTMLElement;
          if (contentEditable) {
            contentEditable.focus();
          }
        }, 10);
        
        console.log(`LeftToolbar: Color ${color} applied successfully`);
      } else {
        console.log('LeftToolbar: Failed to apply color');
      }
    } else {
      console.log('LeftToolbar: No editor found for color change');
    }
  };
  const [activeFontCategory, setActiveFontCategory] = useState('all');
  const [currentHeadingStyle, setCurrentHeadingStyle] = useState<'h1' | 'h2' | 'h3' | 'sub' | 'body' | 'caption' | null>(null);
  const [currentListStyle, setCurrentListStyle] = useState<string>('None');
  const [activeShapeCategory, setActiveShapeCategory] = useState('basic');
  const [shapeSearchTerm, setShapeSearchTerm] = useState('');
  const [showChartsPopup, setShowChartsPopup] = useState(false);
  const [activeChartCategory, setActiveChartCategory] = useState('2d');
  const [showTablesPopup, setShowTablesPopup] = useState(false);
  const [activeTableCategory, setActiveTableCategory] = useState('basic');
  const [activeMathTab, setActiveMathTab] = useState('symbols');
  const [symbolSearchTerm, setSymbolSearchTerm] = useState('');
  const [formulaSearchTerm, setFormulaSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  
  // Filtered results for search
  const filteredSymbols = mathSymbols.filter(symbol => 
    symbol.toLowerCase().includes(symbolSearchTerm.toLowerCase())
  );
  
  const filteredFormulas = mathFormulas.filter(formula => 
    formula.toLowerCase().includes(formulaSearchTerm.toLowerCase())
  );
  
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
        // Font format not implemented in simple version
        console.log('Font applied to selected text:', font);
      }
      if (color) {
        // SimpleFormatPlugin removed - color application disabled
        console.log('Color application disabled - SimpleFormatPlugin removed');
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
        // Font format not implemented in simple version
        console.log('Font format applied:', font);
      }
      if (color) {
        // SimpleFormatPlugin removed - color application disabled
      }
      console.log('Formatting context set at cursor:', { font, color });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Check if click is outside all popups
      const isOutsidePopups = !target.closest('.font-dropdown') && 
                             !target.closest('.color-dropdown') && 
                             !target.closest('.heading-popup') && 
                             !target.closest('.list-popup') && 
                             !target.closest('.shapes-popup') && 
                             !target.closest('.charts-popup') && 
                             !target.closest('.tables-popup') && 
                             !target.closest('.math-symbols-dropdown');
      
      if (isOutsidePopups) {
        setShowFontDropdown(false);
        setShowColorDropdown(false);
        setShowHeadingPopup(false);
        setShowListPopup(false);
        setShowShapesPopup(false);
        setShowChartsPopup(false);
        setShowTablesPopup(false);
        setShowMathDropdown(false);
        setSymbolSearchTerm('');
        setFormulaSearchTerm('');
        setFontSearchTerm('');
        setFilteredFonts(fonts);
        setShapeSearchTerm('');
      }
    };

    // Handle keyboard events for math popup
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showMathDropdown) {
        setShowMathDropdown(false);
        setSymbolSearchTerm('');
        setFormulaSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
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

  // Function to insert table with specific type
  const insertTableWithType = (tableType: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(`[${tableType} Table]`));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  // Function to insert chart
  const insertChart = (chartType: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(`[${chartType} Chart]`));
          selection.insertNodes([paragraph]);
        }
      });
    }
  };

  // Function to convert selected text to list
  const convertToList = (style: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const selectedText = selection.getTextContent();
          
          if (selectedText.trim()) {
            // Split text by lines to create multiple list items
            const lines = selectedText.split('\n').filter(line => line.trim());
            
            let listType: 'bullet' | 'number' = 'bullet';
            let prefix = '';
            
            // Determine list type and prefix
            switch (style) {
              case 'bullet':
                listType = 'bullet';
                break;
              case 'bullet-big':
                listType = 'bullet';
                prefix = '● ';
                break;
              case 'numbered':
                listType = 'number';
                break;
              case 'lettered':
                listType = 'number';
                prefix = 'A. ';
                break;
              case 'harvard':
                listType = 'number';
                prefix = 'I. ';
                break;
              case 'dash':
                listType = 'bullet';
                prefix = '- ';
                break;
              case 'note-taking':
                listType = 'bullet';
                prefix = '☐ ';
                break;
              case 'image':
                listType = 'bullet';
                prefix = '☐ ';
                break;
              default:
                listType = 'bullet';
            }
            
            // Create the list
            const list = $createListNode(listType);
            
            // Create list items for each line
            lines.forEach((line, index) => {
              const listItem = $createListItemNode();
              
              if (prefix) {
                const prefixNode = $createTextNode(prefix);
                const textNode = $createTextNode(line.trim());
                
                // Apply custom styling for prefix
                if (style === 'bullet-big') {
                  prefixNode.setStyle('color: #6b7280; font-size: 16px;');
                } else if (style === 'note-taking' || style === 'image') {
                  prefixNode.setStyle('color: #059669; font-size: 16px;');
                } else if (style === 'dash') {
                  prefixNode.setStyle('color: #6b7280; font-weight: bold;');
                }
                
                listItem.append(prefixNode);
                listItem.append(textNode);
              } else {
                listItem.append($createTextNode(line.trim()));
              }
              
              list.append(listItem);
            });
            
            // Replace the selected text with the list
            selection.insertNodes([list]);
            
            // Set the current list style
            setCurrentListStyle(style);
            setShowListPopup(false);
            
            console.log(`✅ Converted text to ${style} list with ${lines.length} items`);
          }
        }
      });
    }
  };

  // Function to insert list with specific style
  const insertListWithStyle = (style: string) => {
    const editor = getCurrentEditor();
    if (editor) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          let listType: 'bullet' | 'number' = 'bullet';
          let listStyle = '';
          let prefix = '';
          
          // Determine list type and style based on the selected style
          switch (style) {
            case 'bullet':
              listType = 'bullet';
              listStyle = 'list-disc';
              break;
            case 'bullet-big':
              listType = 'bullet';
              listStyle = 'list-disc';
              prefix = '● ';
              break;
            case 'numbered':
              listType = 'number';
              listStyle = 'list-decimal';
              break;
            case 'lettered':
              listType = 'number';
              listStyle = 'list-decimal';
              prefix = 'A. ';
              break;
            case 'harvard':
              listType = 'number';
              listStyle = 'list-decimal';
              prefix = 'I. ';
              break;
            case 'dash':
              listType = 'bullet';
              listStyle = 'list-none';
              prefix = '- ';
              break;
            case 'note-taking':
              listType = 'bullet';
              listStyle = 'list-none';
              prefix = '☐ ';
              break;
            case 'image':
              listType = 'bullet';
              listStyle = 'list-none';
              prefix = '☐ ';
              break;
            default:
              listType = 'bullet';
              listStyle = 'list-disc';
          }
          
          // Create the list node
          const list = $createListNode(listType);
          
          // List styling will be handled by CSS and the prefix nodes
          
          // Create list item with proper styling
          const listItem = $createListItemNode();
          
          if (prefix) {
            // For custom prefixes, create a text node with the prefix
            const prefixNode = $createTextNode(prefix);
            const textNode = $createTextNode('List item');
            
            // Apply custom styling for prefix
            if (style === 'bullet-big') {
              prefixNode.setStyle('color: #6b7280; font-size: 16px;');
            } else if (style === 'note-taking' || style === 'image') {
              prefixNode.setStyle('color: #059669; font-size: 16px;');
            } else if (style === 'dash') {
              prefixNode.setStyle('color: #6b7280; font-weight: bold;');
            }
            
            listItem.append(prefixNode);
            listItem.append(textNode);
          } else {
            // For standard lists, just add the text
            listItem.append($createTextNode('List item'));
          }
          
          list.append(listItem);
          
          // Insert the list at the current selection
          selection.insertNodes([list]);
          
          // Set the current list style
          setCurrentListStyle(style);
          setShowListPopup(false);
          
          console.log(`✅ Inserted ${style} list successfully`);
        }
      });
    }
  };

  // Media Functions
  const insertImage = () => {
    console.log('🎯 LeftToolbar: insertImage called');
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file) {
        console.log('🎯 LeftToolbar: File selected:', file.name, 'Size:', file.size);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) {
            console.log('🎯 LeftToolbar: File read successfully, result length:', result.length);
            
            const editor = getCurrentEditor();
            if (editor) {
              console.log('🎯 LeftToolbar: Editor found, dispatching INSERT_IMAGE_COMMAND');
              
              // Focus the editor first
              const editorElement = document.querySelector('.lexical-editor') as HTMLElement;
              if (editorElement) {
                editorElement.focus();
                console.log('🎯 LeftToolbar: Editor focused');
              }
              
              // Dispatch the command
              editor.dispatchCommand(INSERT_IMAGE_COMMAND, result);
              console.log('🎯 LeftToolbar: Command dispatched');
              
              // Clean up the input
              input.remove();
            } else {
              console.error('🎯 LeftToolbar: No editor found!');
            }
          } else {
            console.error('🎯 LeftToolbar: File read failed - no result');
          }
        };
        
        reader.onerror = (error) => {
          console.error('🎯 LeftToolbar: File read error:', error);
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
      const text = prompt('Enter link text:') || url || '';
      if (url) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            // Create a link element
            const linkText = $createTextNode(text);
            linkText.setFormat('underline');
            
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

    // Close popups when pressing Escape
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowHeadingPopup(false);
        setShowListPopup(false);
        setShowShapesPopup(false);
        setShowChartsPopup(false);
        setShowTablesPopup(false);
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
    <>
      {/* Toggle Button - Fixed Position */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed left-4 z-[99999] p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
        style={{ 
          top: '204px',
          transform: isVisible ? 'translateX(320px)' : 'translateX(0)',
          transition: 'transform 0.3s ease-in-out'
        }}
      >
        {isVisible ? (
          // Cross icon when toolbar is visible
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Hamburger menu (three lines) when toolbar is hidden
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Main Toolbar Container */}
      <div 
        className={`fixed left-0 transition-all duration-300 ease-in-out left-toolbar ${
        isCollapsed ? 'w-16' : 'w-80'
      } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden rounded-r-2xl`} 
      style={{ 
          left: isVisible ? '0' : '-320px',
          top: '200px',
          height: 'calc(100vh - 240px)',
          marginLeft: '0',
          marginRight: '0',
          paddingLeft: '0',
          paddingRight: '0',
          position: 'fixed'
      }}
    >
      
      {/* Pages-style Header with Notion-like simplicity */}
      <div className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 to-gray-900">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-gray-100 font-semibold text-lg">Document Editor</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Create & design content</p>
          </div>
        </div>
      </div>

      {/* Canva-style Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="relative">
          <input
            type="text"
            placeholder="Search elements, templates, shapes..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Notion-style Tab Navigation */}
      <div className="px-6 py-4 bg-white dark:bg-gray-900">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-lg overflow-x-auto scrollbar-hide">
          {tabs.slice(0, 5).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 py-2.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-gray-200 dark:ring-gray-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {!isCollapsed && tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area - Pages + Notion + Canva Mix */}
      <div className="px-6 py-4 h-[calc(100vh-440px)] overflow-y-auto bg-gray-50 dark:bg-gray-800" style={{ 
        position: 'relative', 
        zIndex: 99999,
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6'
      }}>
        {/* Content Tab - Notion-style blocks */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Basic blocks section */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Basic blocks</div>
              
              {/* Text Block - Notion-style */}
              <button
                onClick={insertTextBlock}
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Text</div>
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
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
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
                  <div className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[999999] w-64 overflow-hidden heading-popup animate-in slide-in-from-left-2 duration-200" style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '320px',
                      top: '200px'
                    }}>

                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Heading Styles</div>
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
                            <div className={`text-lg font-bold ${currentHeadingStyle === 'h1' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>H1</div>
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
                            <div className={`text-base font-semibold ${currentHeadingStyle === 'h2' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>H2</div>
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
                            <div className={`text-sm font-semibold ${currentHeadingStyle === 'h3' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>H3</div>
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
                              
                              // Add to editor using Lexical methods instead of direct DOM manipulation
                              try {
                                const editor = getCurrentEditor();
                                if (editor) {
                                  editor.update(() => {
                                    const root = $getRoot();
                                    const paragraphNode = $createParagraphNode();
                                    const textNode = $createTextNode('Test Heading');
                                    paragraphNode.append(textNode);
                                    root.append(paragraphNode);
                                    textNode.select();
                                  });
                                  console.log('🎯 Test H1 element added using Lexical methods');
                                } else {
                                  console.log('❌ No editor found for Lexical insertion');
                                }
                              } catch (lexicalError) {
                                console.error('Lexical insertion failed:', lexicalError);
                                // Fallback: use DOM manipulation with error handling
                                try {
                                  if (editorElement && testHeading.parentNode !== editorElement) {
                                    editorElement.appendChild(testHeading);
                                    console.log('🎯 Test H1 element added with inline styles (fallback)');
                                  }
                                } catch (domError) {
                                  console.error('DOM insertion failed:', domError);
                                }
                              }
                              
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
                            <div className={`text-sm font-normal ${currentHeadingStyle === 'body' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>Body</div>
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
                onClick={() => setShowListPopup(!showListPopup)}
                className={`w-full p-4 border rounded-lg transition-all duration-200 group mb-3 relative ${
                  showListPopup 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                    : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-200 transition-colors">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {currentListStyle === 'None' ? 'Bullet list' : 
                       currentListStyle === 'bullet' ? 'Bullet List' : 
                       currentListStyle === 'numbered' ? 'Numbered List' : 
                       currentListStyle === 'lettered' ? 'Lettered List' : 
                       currentListStyle === 'harvard' ? 'Harvard List' : 
                       currentListStyle === 'dash' ? 'Dash List' : 
                       currentListStyle === 'note-taking' ? 'Note Taking List' : 
                       currentListStyle}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {currentListStyle === 'None' ? 'Create a simple list' : 
                       currentListStyle === 'bullet' ? 'Simple bullet points' : 
                       currentListStyle === 'numbered' ? '1, 2, 3... format' : 
                       currentListStyle === 'lettered' ? 'A, B, C... format' : 
                       currentListStyle === 'harvard' ? 'I, II, III... format' : 
                       currentListStyle === 'dash' ? 'Dash-separated items' : 
                       currentListStyle === 'note-taking' ? 'Checkbox-style items' : 
                       'List formatting'}
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
                
                {/* List Style Popup */}
                {showListPopup && (
                  <div className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl z-[999999] w-64 overflow-hidden list-popup animate-in slide-in-from-left-2 duration-200" style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '320px',
                      top: '360px'
                    }}>

                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">List Styles</div>
                      <div className="text-xs text-gray-500 mt-1">Current: {currentListStyle}</div>
                    </div>
                    
                    {/* List Options - Compact Grid */}
                    <div className="p-2">
                      {listStyles.map((style) => (
                        <div key={style.id} className="mb-2">
                          <button
                            onClick={() => {
                              insertListWithStyle(style.id);
                            }}
                            className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group ${
                              currentListStyle === style.id 
                                ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400 w-4 text-center">
                                  {style.icon}
                                </span>
                                <div className={`text-sm font-medium ${currentListStyle === style.id ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>
                                  {style.name}
                                </div>
                              </div>
                              {style.id === 'lettered' && (
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </div>
                          </button>
                          
                          {/* Convert existing text button */}
                          <button
                            onClick={() => {
                              convertToList(style.id);
                            }}
                            className="w-full mt-1 p-1 text-xs text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors duration-200 text-gray-600 dark:text-gray-400"
                            title={`Convert selected text to ${style.name}`}
                          >
                            Convert Text
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>

              {/* Math Symbols - Mathematical Notation */}
              <button
                onClick={() => {
                  const newState = !showMathDropdown;
                  if (newState) {
                    // Reset to symbols tab when opening
                    setActiveMathTab('symbols');
                    setSymbolSearchTerm('');
                    setFormulaSearchTerm('');
                  }
                  setShowMathDropdown(newState);
                }}
                className={`w-full p-4 border rounded-lg transition-all duration-200 group mb-3 relative ${
                  showMathDropdown 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Math Symbols</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Symbols, formulas & equations</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {/* Popup indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
                
                {/* Math Symbols Popup */}
                {showMathDropdown && (
                  <div 
                    className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-[600px] h-[500px] overflow-hidden math-symbols-dropdown animate-in slide-in-from-left-2 duration-200" 
                    style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '256px',
                      top: '440px'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >

                    {/* Header with Tabs */}
                    <div 
                      className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Math Symbols & Formulas</div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMathDropdown(false);
                            setSymbolSearchTerm('');
                            setFormulaSearchTerm('');
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors"
                          title="Close popup (or press Escape)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Tabs */}
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveMathTab('symbols');
                            setSymbolSearchTerm('');
                            setFormulaSearchTerm('');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeMathTab === 'symbols'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200'
                          }`}
                        >
                          Symbols ({filteredSymbols.length})
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setActiveMathTab('formulas');
                            setSymbolSearchTerm('');
                            setFormulaSearchTerm('');
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeMathTab === 'formulas'
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200'
                          }`}
                        >
                          Formulas ({filteredFormulas.length})
                        </button>
                      </div>
                      
                      {/* Help text */}
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Click on any symbol or formula to insert it into your text. Use the search to find specific items quickly.
                      </div>
                    </div>
                    
                    {/* Content Area with Scroll */}
                    <div 
                      className="p-4 bg-white dark:bg-gray-800 h-[calc(500px-120px)] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Current tab: {activeMathTab} */}
                      {activeMathTab === 'symbols' && (
                        <>
                          {/* Search for symbols */}
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Search symbols..."
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                              value={symbolSearchTerm}
                              onChange={(e) => setSymbolSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-8 gap-2">
                            {filteredSymbols.map((symbol) => (
                              <button
                                key={symbol}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                className="w-12 h-12 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-purple-600 dark:hover:text-purple-400"
                                title={`Insert ${symbol}`}
                              >
                                {symbol}
                              </button>
                            ))}
                          </div>
                          {filteredSymbols.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                              No symbols found matching "{symbolSearchTerm}"
                            </div>
                          )}
                        </>
                      )}
                      
                      {activeMathTab === 'formulas' && (
                        <>
                          {/* Search for formulas */}
                          <div className="mb-4">
                            <input
                              type="text"
                              placeholder="Search formulas..."
                              className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              onClick={(e) => e.stopPropagation()}
                              value={formulaSearchTerm}
                              onChange={(e) => setFormulaSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {filteredFormulas.map((formula, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
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
                                className="w-full p-3 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 text-left text-sm font-mono hover:scale-[1.02]"
                                title={`Insert ${formula}`}
                              >
                                {formula}
                              </button>
                            ))}
                          </div>
                          {filteredFormulas.length === 0 && (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                              No formulas found matching "{formulaSearchTerm}"
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
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
                  className={`w-full p-3 border transition-all duration-200 text-left flex items-center justify-between group relative ${
                                      showFontDropdown 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                      showFontDropdown 
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                        : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                    }`}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Font</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500" style={{ fontFamily: selectedFont }}>{selectedFont}</div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${showFontDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {/* Popup indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
                
                {/* Font Dropdown */}
                {showFontDropdown && (
                  <div className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-64 overflow-hidden font-dropdown animate-in slide-in-from-left-2 duration-200" style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '256px',
                      top: '200px'
                    }}>
                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 to-gray-900">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Font Selection</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Current: {selectedFont}</div>
                    </div>
                    
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
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
                          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all duration-200"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Font Categories */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="flex gap-1 flex-wrap">
                        {Object.entries(fontCategories).map(([key, categoryFonts]) => (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveFontCategory(key);
                              setFilteredFonts(categoryFonts);
                              setFontSearchTerm('');
                            }}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                              activeFontCategory === key
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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
                          className={`w-full p-2 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-[1.02] transition-all duration-200 rounded-md group mb-1 ${
                            selectedFont === font 
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-300 dark:border-purple-600' 
                              : ''
                          }`}
                          style={{ fontFamily: font }}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`text-sm font-medium ${selectedFont === font ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-gray-100'}`}>{font}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">Aa</div>
                          </div>
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
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Colors</div>
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
                  className={`w-full p-3 border transition-all duration-200 text-left flex items-center justify-between group relative ${
                                      showColorDropdown 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all duration-200 ${
                      showColorDropdown 
                        ? 'border-purple-300 dark:border-purple-600 ring-2 ring-purple-200 dark:ring-purple-800' 
                        : 'border-gray-200 dark:border-gray-300'
                    }`} style={{ backgroundColor: selectedColor }}>
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a4 4 0 014-4h5.5a4 4 0 014 4v12a4 4 0 01-4 4H7z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Color</span>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{selectedColor}</div>
                    </div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${showColorDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {/* Popup indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
                
                {/* Color Picker Dropdown */}
                {showColorDropdown && (
                  <div className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-64 overflow-hidden color-dropdown animate-in slide-in-from-left-2 duration-200" style={{
                      position: 'fixed',
                      isolation: 'isolate',
                      left: '256px',
                      top: '280px'
                    }}>
                    {/* Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Color Selection</div>
                      <div className="text-xs text-gray-500 mt-1">Current: {selectedColor}</div>
                    </div>
                    
                    {/* Quick Colors */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Quick Colors</div>
                      <div className="grid grid-cols-8 gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              handleColorChange(color);
                              setShowColorDropdown(false);
                            }}
                            className={`w-8 h-8 rounded-lg border-2 hover:scale-110 transition-all duration-200 shadow-sm group ${
                              selectedColor === color 
                                ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Apply ${color}`}
                          >
                            {selectedColor === color && (
                              <div className="w-full h-full rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Color Palettes */}
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Color Palettes</div>
                      <div className="space-y-3">
                        {/* Professional Palette */}
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Professional</div>
                          <div className="flex gap-2">
                            {['#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb'].map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  handleColorChange(color);
                                  setShowColorDropdown(false);
                                }}
                                className={`w-6 h-6 rounded border hover:scale-110 transition-colors ${
                                  selectedColor === color 
                                    ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
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
                                  handleColorChange(color);
                                  setShowColorDropdown(false);
                                }}
                                className={`w-6 h-6 rounded border hover:scale-110 transition-all duration-200 ${
                                  selectedColor === color 
                                    ? 'border-purple-500 dark:border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800' 
                                    : 'border-gray-200 dark:border-gray-600'
                                }`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custom Color Input */}
                    <div className="p-3">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Custom Color</div>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          className="w-10 h-10 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                          onChange={(e) => {
                            const color = e.target.value;
                            handleColorChange(color);
                            setShowColorDropdown(false);
                          }}
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="#000000"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all duration-200"
                            onChange={(e) => {
                              const color = e.target.value;
                              if (color.match(/^#[0-9A-F]{6}$/i)) {
                                handleColorChange(color);
                                setShowColorDropdown(false);
                              }
                            }}
                          />
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter hex color code</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media & Elements section */}
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Media & Elements</div>



              {/* Image - Canva-style */}
              <button
                onClick={insertImage}
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-pink-100 dark:bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-200 transition-colors">
                    <svg className="w-5 h-5 text-pink-600 dark:text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Image</div>
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
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Video</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">Upload from file</div>
                  </div>
                  <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Advanced Content Tools */}
              <div className="mt-8">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Advanced Tools</div>
                
                {/* Quote Block */}
                <button
                  onClick={insertQuote}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 dark:group-hover:bg-yellow-200 transition-colors">
                      <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Quote</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add a quote block</div>
                    </div>
                  </div>
                </button>

                {/* Code Block */}
                <button
                  onClick={insertCode}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Code</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add code block</div>
                    </div>
                  </div>
                </button>

                {/* Checklist */}
                <button
                  onClick={insertChecklist}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-200 transition-colors">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Checklist</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add checklist items</div>
                    </div>
                  </div>
                </button>

                {/* Callout */}
                <button
                  onClick={insertCallout}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-200 transition-colors">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Callout</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add highlighted note</div>
                    </div>
                  </div>
                </button>

                {/* Link */}
                <button
                  onClick={insertLink}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Link</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add hyperlink</div>
                    </div>
                  </div>
                </button>

                {/* Divider */}
                <button
                  onClick={insertDivider}
                  className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-600 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Divider</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Add horizontal line</div>
                    </div>
                  </div>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Elements Tab - Shapes, Charts & Tables */}
        {activeTab === 'shapes' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Elements & Visuals</div>
            
            {/* Shapes Button - Opens Popup */}
                <button
              onClick={() => setShowShapesPopup(!showShapesPopup)}
              className={`w-full p-4 border rounded-lg transition-all duration-200 group relative ${
                showShapesPopup 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-100 dark:to-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Shapes Library</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Basic, Geometry, Objects & more</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {/* Popup indicator */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              
              {/* Shapes Popup */}
              {showShapesPopup && (
                <div className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-[600px] h-[500px] overflow-hidden shapes-popup animate-in slide-in-from-left-2 duration-200" style={{
                    position: 'fixed',
                    isolation: 'isolate',
                    left: '256px',
                    top: '200px'
                  }}>

                  {/* Header with Search */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 to-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Shapes Library</div>
                      <button
                        onClick={() => setShowShapesPopup(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search shapes..."
                        value={shapeSearchTerm}
                        onChange={(e) => setShapeSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all duration-200"
                      />
                                              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <button className="absolute right-3 top-2.5 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="flex h-[400px]">
                    {/* Left Panel - Categories */}
                    <div className="w-1/3 border-r border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                      <div className="space-y-2">
                        {Object.entries(shapeCategories).map(([key, category]) => (
                          <button
                            key={key}
                            onClick={() => setActiveShapeCategory(key)}
                            className={`w-full p-3 text-left rounded-lg transition-all duration-200 ${
                              activeShapeCategory === key
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600' 
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200'
                            }`}
                          >
                            <div className="text-sm font-medium">{category.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Right Panel - Shapes Grid */}
                    <div className="w-2/3 p-4 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-4 gap-3">
                        {shapeCategories[activeShapeCategory as keyof typeof shapeCategories]?.shapes.map((shape) => (
                          <button
                            key={shape.id}
                            onClick={() => {
                              insertShape(shape.id);
                              setShowShapesPopup(false);
                            }}
                            className="p-3 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
                            title={shape.description}
                          >
                            <div className="w-12 h-12 bg-white dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-300">
                              <span className="text-2xl text-gray-700 dark:text-gray-300">{shape.icon}</span>
                  </div>
                  <div className="text-center">
                              <div className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{shape.name}</div>
                  </div>
                </button>
              ))}
                      </div>
                    </div>
            </div>
                </div>
              )}
            </button>

            {/* Charts Button - Opens Popup */}
            <button
              onClick={() => setShowChartsPopup(!showChartsPopup)}
              className={`w-full p-4 border rounded-lg transition-all duration-200 group relative ${
                showChartsPopup 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                  : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 dark:group-hover:bg-orange-200 transition-colors">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-7 4 7M3 4h18M4 4h16v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Charts & Graphs</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">2D, 3D & Interactive charts</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {/* Popup indicator */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              
              {/* Charts Popup */}
              {showChartsPopup && (
                <div className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-[600px] h-[500px] overflow-hidden charts-popup animate-in slide-in-from-left-2 duration-200" style={{
                    position: 'fixed',
                    isolation: 'isolate',
                    left: '256px',
                    top: '280px'
                  }}>

                  {/* Header with Tabs */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Insert Charts</div>
                      <button
                        onClick={() => setShowChartsPopup(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex space-x-1">
                      {Object.entries(chartCategories).map(([key, category]) => (
                        <button
                          key={key}
                          onClick={() => setActiveChartCategory(key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeChartCategory === key
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Charts Grid */}
                  <div className="p-4 bg-white dark:bg-white">
                    <div className="grid grid-cols-4 gap-3">
                      {chartCategories[activeChartCategory as keyof typeof chartCategories]?.charts.map((chart) => (
                        <button
                          key={chart.id}
                          onClick={() => {
                            insertChart(chart.id);
                            setShowChartsPopup(false);
                          }}
                          className="p-3 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
                          title={chart.description}
                        >
                          <div className="w-12 h-12 bg-white dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-all duration-200 border border-gray-200 dark:border-gray-300">
                            <span className="text-2xl">{chart.icon}</span>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-900 dark:text-gray-900 truncate">{chart.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>

            {/* Tables Button - Opens Popup */}
            <button
              onClick={() => setShowTablesPopup(!showTablesPopup)}
              className={`w-full p-4 border rounded-lg transition-all duration-200 group relative ${
                showTablesPopup 
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                  : 'bg-white dark:bg-white border-gray-200 dark:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-50 hover:border-gray-300 dark:hover:border-gray-400'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-100 dark:to-purple-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 dark:group-hover:bg-indigo-200 transition-colors">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Tables & Grids</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">Basic, Structured & Data tables</div>
                </div>
                <div className="w-6 h-6 bg-gray-100 dark:bg-gray-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {/* Popup indicator */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </div>
              
              {/* Tables Popup */}
              {showTablesPopup && (
                <div className="fixed bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[999999] w-[600px] h-[500px] overflow-hidden tables-popup animate-in slide-in-from-left-2 duration-200" style={{
                    position: 'fixed',
                    isolation: 'isolate',
                    left: '256px',
                    top: '360px'
                  }}>

                  {/* Header with Tabs */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Insert Tables</div>
                      <button
                        onClick={() => setShowTablesPopup(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex space-x-1">
                      {Object.entries(tableCategories).map(([key, category]) => (
                        <button
                          key={key}
                          onClick={() => setActiveTableCategory(key)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTableCategory === key
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-200'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Tables Grid */}
                  <div className="p-4 bg-white dark:bg-white">
                    <div className="grid grid-cols-2 gap-4">
                      {tableCategories[activeTableCategory as keyof typeof tableCategories]?.tables.map((table) => (
                        <button
                          key={table.id}
                          onClick={() => {
                            insertTableWithType(table.id);
                            setShowTablesPopup(false);
                          }}
                          className="p-4 bg-gray-50 dark:bg-gray-100 border border-gray-200 dark:border-gray-300 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-200 group"
                          title={table.description}
                        >
                          <div className="w-20 h-20 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-all duration-200">
                            <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{table.preview}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">{table.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{table.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Media Tab - Canva-style */}
        {activeTab === 'media' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Media</div>
            
            <button
              onClick={insertImage}
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-200 transition-colors">
                  <svg className="w-5 h-5 text-pink-600 dark:text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Image</div>
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
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-200 transition-colors">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Video</div>
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


        {/* Tools Tab - Notion-style */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-gray-600 dark:text-gray-600 uppercase tracking-wider mb-4 px-2">Tools</div>
            
            {/* Translation Button */}
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
              <TranslationButton variant="left" className="w-full" />
            </div>
            
            <button
              onClick={() => changeTextDirection('ltr')}
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Left to Right</div>
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
              className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">Right to Left</div>
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
                className="w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 group"
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
                    className="w-10 h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 flex items-center justify-center text-lg font-mono hover:scale-110 hover:text-blue-600 dark:hover:text-blue-400"
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
                      className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-all duration-200 text-center font-mono text-sm hover:text-orange-600 dark:hover:text-orange-400"
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
    </>
  );
} 