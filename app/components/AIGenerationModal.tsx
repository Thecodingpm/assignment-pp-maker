'use client';

import { useState } from 'react';
import { X, Sparkles, FileText, Palette, Wand2 } from 'lucide-react';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (type: 'presentation' | 'logo', prompt: string, options: any) => void;
}

export default function AIGenerationModal({ isOpen, onClose, onGenerate }: AIGenerationModalProps) {
  const [selectedType, setSelectedType] = useState<'presentation' | 'logo'>('presentation');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'single' | 'variations'>('single');
  const [options, setOptions] = useState({
    style: 'professional',
    color: 'modern',
    industry: 'general'
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(selectedType, prompt, options);
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const presentationPrompts = [
    "Create a business presentation about our new product launch",
    "Design a sales pitch presentation for our services",
    "Make a training presentation for new employees",
    "Create a quarterly business review presentation"
  ];

  const logoPrompts = [
    "A modern tech startup logo with geometric shapes",
    "A minimalist coffee shop logo with warm colors",
    "A creative design agency logo with bold typography",
    "A healthcare company logo with trust and care elements",
    "A fintech company logo with security and innovation",
    "An eco-friendly brand logo with nature elements"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Generation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Type Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What would you like to create?</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedType('presentation')}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedType === 'presentation'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-6 h-6 ${selectedType === 'presentation' ? 'text-blue-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Presentation</div>
                  <div className="text-sm text-gray-500">Generate slides and content</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setSelectedType('logo')}
              className={`p-4 border-2 rounded-lg transition-all ${
                selectedType === 'logo'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Palette className={`w-6 h-6 ${selectedType === 'logo' ? 'text-purple-500' : 'text-gray-400'}`} />
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Logo</div>
                  <div className="text-sm text-gray-500">Generate brand logos</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe what you want to create
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={selectedType === 'presentation' 
              ? "Describe your presentation topic, audience, and key points..."
              : "Describe your logo concept, company name, and style preferences..."
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Quick Prompts */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Quick prompts</h4>
          <div className="grid grid-cols-2 gap-2">
            {(selectedType === 'presentation' ? presentationPrompts : logoPrompts).map((quickPrompt, index) => (
              <button
                key={index}
                onClick={() => setPrompt(quickPrompt)}
                className="p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {quickPrompt}
              </button>
            ))}
          </div>
        </div>

        {/* Generation Mode (for logos only) */}
        {selectedType === 'logo' && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Generation Mode</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGenerationMode('single')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  generationMode === 'single'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Single Logo</div>
                  <div className="text-xs text-gray-500">Generate one high-quality logo</div>
                </div>
              </button>
              <button
                onClick={() => setGenerationMode('variations')}
                className={`p-3 border-2 rounded-lg transition-all ${
                  generationMode === 'variations'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium text-sm">Multiple Variations</div>
                  <div className="text-xs text-gray-500">Generate 4 different styles</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Customize your generation</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
              <select
                value={options.style}
                onChange={(e) => setOptions({...options, style: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="professional">Professional</option>
                <option value="minimalist">Minimalist</option>
                <option value="creative">Creative</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Color Theme</label>
              <select
                value={options.color}
                onChange={(e) => setOptions({...options, color: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="modern">Modern</option>
                <option value="vibrant">Vibrant</option>
                <option value="monochrome">Monochrome</option>
                <option value="pastel">Pastel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Industry</label>
              <select
                value={options.industry}
                onChange={(e) => setOptions({...options, industry: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="general">General</option>
                <option value="tech">Technology</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate {selectedType === 'presentation' ? 'Presentation' : 'Logo'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
