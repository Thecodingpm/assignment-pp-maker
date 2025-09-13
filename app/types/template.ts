// Template Element Types (like Canva's system)
export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'background' | 'container';
  position: { x: number; y: number };
  size?: { width: number; height: number };
  style?: any;
  content?: string;
  src?: string;
  children?: TemplateElement[];
}

// Template Definition (like Canva's JSON templates)
export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  dimensions: { width: number; height: number };
  elements: TemplateElement[];
  metadata: {
    author: string;
    createdAt: Date;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
}

// Template Instance (user's copy of a template)
export interface TemplateInstance {
  id: string;
  templateId: string; // Reference to original template
  userId: string;
  elements: TemplateElement[]; // User's modified version
  createdAt: Date;
  updatedAt: Date;
}

// Template Categories (like Canva's categories)
export const TEMPLATE_CATEGORIES = {
  PRESENTATION: 'presentation',
  SOCIAL_MEDIA: 'social-media',
  BUSINESS: 'business',
  EDUCATION: 'education',
  CREATIVE: 'creative',
  TECHNICAL: 'technical',
  MARKETING: 'marketing',
  PERSONAL: 'personal'
} as const;

// Template Difficulty Levels
export const TEMPLATE_DIFFICULTY = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate', 
  ADVANCED: 'advanced'
} as const;
