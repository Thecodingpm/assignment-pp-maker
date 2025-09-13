// app/data/designTemplates.js
export const DESIGN_TEMPLATES = {
  'business-pitch': {
    name: 'Business Pitch Deck',
    colors: {
      primary: '#1e40af',    // Blue
      secondary: '#3b82f6',  // Light blue
      accent: '#dbeafe',     // Very light blue
      text: '#1f2937',       // Dark gray
      background: '#ffffff'  // White
    },
    slideTypes: ['title', 'problem', 'solution', 'market', 'business-model', 'team', 'financials']
  },
  
  'startup-pitch': {
    name: 'Startup Pitch Deck', 
    colors: {
      primary: '#059669',    // Green
      secondary: '#10b981',  // Light green
      accent: '#d1fae5',     // Very light green
      text: '#064e3b',       // Dark green
      background: '#ffffff'  // White
    },
    slideTypes: ['title', 'problem', 'solution', 'market', 'traction', 'team', 'ask']
  },

  'educational': {
    name: 'Educational Presentation',
    colors: {
      primary: '#dc2626',    // Red
      secondary: '#ef4444',  // Light red
      accent: '#fecaca',     // Very light red
      text: '#991b1b',       // Dark red
      background: '#ffffff'  // White
    },
    slideTypes: ['title', 'overview', 'concept1', 'concept2', 'concept3', 'examples', 'summary']
  },

  'creative': {
    name: 'Creative Presentation',
    colors: {
      primary: '#7c3aed',    // Purple
      secondary: '#a855f7',  // Light purple
      accent: '#ede9fe',     // Very light purple
      text: '#581c87',       // Dark purple
      background: '#ffffff'  // White
    },
    slideTypes: ['title', 'inspiration', 'process', 'results', 'portfolio', 'vision']
  }
};

// Helper function to get template by topic
export function getTemplateByTopic(topic) {
  const topicMap = {
    'business': 'business-pitch',
    'startup': 'startup-pitch', 
    'education': 'educational',
    'creative': 'creative',
    'pitch': 'startup-pitch',
    'report': 'business-pitch',
    'learning': 'educational',
    'art': 'creative'
  };
  
  return DESIGN_TEMPLATES[topicMap[topic]] || DESIGN_TEMPLATES['business-pitch'];
}



