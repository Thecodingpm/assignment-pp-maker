// Global editor registry for managing multiple Lexical editors
let globalEditorRegistry: Map<string, any> = new Map();
let currentFocusedEditorId: string | null = null;

// Function to register an editor
export const registerEditor = (id: string, editor: any) => {
  globalEditorRegistry.set(id, editor);
};

// Function to unregister an editor
export const unregisterEditor = (id: string) => {
  globalEditorRegistry.delete(id);
};

// Function to set the currently focused editor
export const setFocusedEditor = (id: string) => {
  currentFocusedEditorId = id;
};

// Function to get the currently focused editor
export const getCurrentEditor = () => {
  console.log('getCurrentEditor called');
  console.log('currentFocusedEditorId:', currentFocusedEditorId);
  console.log('globalEditorRegistry size:', globalEditorRegistry.size);
  console.log('globalEditorRegistry keys:', Array.from(globalEditorRegistry.keys()));
  
  if (currentFocusedEditorId && globalEditorRegistry.has(currentFocusedEditorId)) {
    console.log('Returning focused editor:', currentFocusedEditorId);
    return globalEditorRegistry.get(currentFocusedEditorId);
  }
  // If no editor is focused, return the first available editor
  if (globalEditorRegistry.size > 0) {
    const firstEditorId = globalEditorRegistry.keys().next().value;
    console.log('Returning first available editor:', firstEditorId);
    return globalEditorRegistry.get(firstEditorId);
  }
  console.log('No editor available');
  return null;
}; 