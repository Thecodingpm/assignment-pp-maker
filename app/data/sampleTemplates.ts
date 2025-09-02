import { TemplateDefinition } from '../types/template';

// Sample templates - these are just JSON data, not code!
export const sampleTemplates: TemplateDefinition[] = [
  {
    id: 'business-presentation-001',
    name: 'Modern Business Presentation',
    category: 'business',
    thumbnail: '/templates/business-001-thumb.jpg',
    dimensions: { width: 1920, height: 1080 },
    elements: [
      {
        id: 'bg-1',
        type: 'background',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 1080 },
        style: { backgroundColor: '#f8fafc' }
      },
      {
        id: 'header-1',
        type: 'text',
        position: { x: 100, y: 80 },
        content: 'Welcome to Our Company',
        style: {
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        }
      },
      {
        id: 'subtitle-1',
        type: 'text',
        position: { x: 100, y: 160 },
        content: 'Professional Presentation Template',
        style: {
          fontSize: 24,
          fontFamily: 'Inter',
          color: '#6b7280',
          textAlign: 'center'
        }
      },
      {
        id: 'shape-1',
        type: 'shape',
        position: { x: 200, y: 300 },
        size: { width: 400, height: 200 },
        style: {
          backgroundColor: '#3b82f6',
          borderRadius: '12px'
        }
      }
    ],
    metadata: {
      author: 'Template Designer',
      createdAt: new Date('2024-01-15'),
      tags: ['business', 'professional', 'modern'],
      difficulty: 'beginner'
    }
  },
  {
    id: 'education-slide-001',
    name: 'Educational Slide Deck',
    category: 'education',
    thumbnail: '/templates/education-001-thumb.jpg',
    dimensions: { width: 1920, height: 1080 },
    elements: [
      {
        id: 'bg-2',
        type: 'background',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 1080 },
        style: { backgroundColor: '#ffffff' }
      },
      {
        id: 'title-2',
        type: 'text',
        position: { x: 150, y: 100 },
        content: 'Learning Objectives',
        style: {
          fontSize: 56,
          fontFamily: 'Georgia',
          fontWeight: 'bold',
          color: '#059669',
          textAlign: 'left'
        }
      },
      {
        id: 'list-1',
        type: 'text',
        position: { x: 150, y: 250 },
        content: '• Understand key concepts\n• Apply knowledge practically\n• Evaluate outcomes',
        style: {
          fontSize: 32,
          fontFamily: 'Georgia',
          color: '#374151',
          lineHeight: 1.6
        }
      }
    ],
    metadata: {
      author: 'Education Team',
      createdAt: new Date('2024-01-20'),
      tags: ['education', 'learning', 'objectives'],
      difficulty: 'beginner'
    }
  },
  {
    id: 'creative-design-001',
    name: 'Creative Portfolio',
    category: 'creative',
    thumbnail: '/templates/creative-001-thumb.jpg',
    dimensions: { width: 1920, height: 1080 },
    elements: [
      {
        id: 'bg-3',
        type: 'background',
        position: { x: 0, y: 0 },
        size: { width: 1920, height: 1080 },
        style: { 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      },
      {
        id: 'title-3',
        type: 'text',
        position: { x: 200, y: 200 },
        content: 'Creative Portfolio',
        style: {
          fontSize: 72,
          fontFamily: 'Playfair Display',
          fontWeight: 'bold',
          color: '#ffffff',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }
      },
      {
        id: 'accent-1',
        type: 'shape',
        position: { x: 200, y: 350 },
        size: { width: 100, height: 4 },
        style: {
          backgroundColor: '#fbbf24',
          borderRadius: '2px'
        }
      }
    ],
    metadata: {
      author: 'Creative Studio',
      createdAt: new Date('2024-01-25'),
      tags: ['creative', 'portfolio', 'gradient'],
      difficulty: 'intermediate'
    }
  }
];

// This is how Canva stores thousands of templates - just JSON data!
// Each template is a simple object with elements array
// No individual code needed for each template
