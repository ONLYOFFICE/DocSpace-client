import { create } from 'zustand';
import * as api from '@/lib/api';

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface TranslationEntry {
  key: string;
  path: string;
  translations: {
    [language: string]: string;
  };
}

interface TranslationState {
  translationData: {
    [language: string]: TranslationData;
  };
  flattenedTranslations: TranslationEntry[];
  currentKey: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Actions
  fetchTranslations: (projectName: string, languages: string[], namespace: string) => Promise<void>;
  updateTranslation: (
    projectName: string, 
    language: string, 
    namespace: string, 
    key: string, 
    value: string, 
    isAiTranslated?: boolean
  ) => Promise<boolean>;
  setCurrentKey: (key: string | null) => void;
  clearError: () => void;
}

// Helper function to flatten nested translations
const flattenTranslations = (
  translations: { [lang: string]: TranslationData },
  languages: string[]
): TranslationEntry[] => {
  const result: TranslationEntry[] = [];
  
  const processObject = (obj: TranslationData, path: string = '', currentPath: string = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        processObject(value, path, newPath);
      } else {
        // This is a leaf node - a translatable string
        const entry = result.find(e => e.path === newPath);
        
        if (entry) {
          // Update existing entry for this key
          entry.translations[path] = value as string;
        } else {
          // Create new entry
          const newEntry: TranslationEntry = {
            key,
            path: newPath,
            translations: { [path]: value as string }
          };
          
          // Initialize empty translations for all languages
          languages.forEach(lang => {
            if (!newEntry.translations[lang]) {
              newEntry.translations[lang] = '';
            }
          });
          
          result.push(newEntry);
        }
      }
    }
  };
  
  // Process each language's translations
  for (const [lang, data] of Object.entries(translations)) {
    processObject(data, lang);
  }
  
  return result;
};

export const useTranslationStore = create<TranslationState>((set, get) => ({
  translationData: {},
  flattenedTranslations: [],
  currentKey: null,
  loading: false,
  saving: false,
  error: null,
  
  fetchTranslations: async (projectName: string, languages: string[], namespace: string) => {
    try {
      set({ loading: true, error: null });
      
      const translationData: { [language: string]: TranslationData } = {};
      
      // Fetch translations for each language
      for (const language of languages) {
        const response = await api.getTranslations(projectName, language, namespace);
        
        if (response.data.success) {
          translationData[language] = response.data.data || {};
        }
      }
      
      // Create flattened representation for the UI
      const flattenedTranslations = flattenTranslations(translationData, languages);
      
      set({ 
        translationData,
        flattenedTranslations,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error fetching translations:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch translations',
        loading: false
      });
    }
  },
  
  updateTranslation: async (
    projectName: string, 
    language: string, 
    namespace: string, 
    key: string, 
    value: string,
    isAiTranslated = false
  ) => {
    try {
      set({ saving: true, error: null });
      
      await api.updateTranslationKey(
        projectName,
        language,
        namespace,
        key,
        value,
        isAiTranslated
      );
      
      // Update local state
      const { translationData, flattenedTranslations } = get();
      
      // Update the flattened view
      const updatedFlattened = [...flattenedTranslations];
      const entryIndex = updatedFlattened.findIndex(entry => entry.path === key);
      
      if (entryIndex !== -1) {
        updatedFlattened[entryIndex].translations[language] = value;
      }
      
      // Update the nested data structure
      const updatedData = { ...translationData };
      if (!updatedData[language]) {
        updatedData[language] = {};
      }
      
      // Navigate and update the nested path
      const keyParts = key.split('.');
      let current = updatedData[language];
      
      for (let i = 0; i < keyParts.length - 1; i++) {
        const part = keyParts[i];
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part] as TranslationData;
      }
      
      const finalKey = keyParts[keyParts.length - 1];
      current[finalKey] = value;
      
      set({ 
        translationData: updatedData,
        flattenedTranslations: updatedFlattened,
        saving: false 
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating translation:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to update translation',
        saving: false
      });
      return false;
    }
  },
  
  setCurrentKey: (key) => {
    set({ currentKey: key });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
