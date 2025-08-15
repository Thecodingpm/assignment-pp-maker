// Global template store that persists across all users and sessions
export interface GlobalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  fileName: string;
  fileSize: number;
  frontImage?: string;
  uploadedAt: string;
  uploadedBy: string;
  status: 'active' | 'inactive';
}

class GlobalTemplateStore {
  private static instance: GlobalTemplateStore;
  private templates: GlobalTemplate[] = [];
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): GlobalTemplateStore {
    if (!GlobalTemplateStore.instance) {
      GlobalTemplateStore.instance = new GlobalTemplateStore();
    }
    return GlobalTemplateStore.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('globalTemplates');
      if (stored) {
        this.templates = JSON.parse(stored);
        console.log('GlobalTemplateStore: Loaded templates from storage:', this.templates.length);
      }
    } catch (error) {
      console.error('GlobalTemplateStore: Error loading from storage:', error);
      this.templates = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('globalTemplates', JSON.stringify(this.templates));
      console.log('GlobalTemplateStore: Saved templates to storage:', this.templates.length);
    } catch (error) {
      console.error('GlobalTemplateStore: Error saving to storage:', error);
    }
  }

  public addTemplate(template: GlobalTemplate): void {
    // Check if template already exists
    const existingIndex = this.templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      this.templates[existingIndex] = template;
    } else {
      this.templates.push(template);
    }
    
    this.saveToStorage();
    this.notifyListeners();
    console.log('GlobalTemplateStore: Template added/updated:', template.title);
  }

  public removeTemplate(id: string): void {
    this.templates = this.templates.filter(t => t.id !== id);
    this.saveToStorage();
    this.notifyListeners();
    console.log('GlobalTemplateStore: Template removed:', id);
  }

  public updateTemplate(id: string, updates: Partial<GlobalTemplate>): void {
    const index = this.templates.findIndex(t => t.id === id);
    if (index >= 0) {
      this.templates[index] = { ...this.templates[index], ...updates };
      this.saveToStorage();
      this.notifyListeners();
      console.log('GlobalTemplateStore: Template updated:', id);
    }
  }

  public getTemplates(): GlobalTemplate[] {
    return [...this.templates];
  }

  public getTemplateById(id: string): GlobalTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  public getTemplatesByCategory(category: string): GlobalTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  public addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  public clearAll(): void {
    this.templates = [];
    this.saveToStorage();
    this.notifyListeners();
    console.log('GlobalTemplateStore: All templates cleared');
  }
}

export const globalTemplateStore = GlobalTemplateStore.getInstance(); 