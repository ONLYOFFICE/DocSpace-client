import { create } from 'zustand';
import * as api from '@/lib/api';

interface LanguageState {
  languages: string[];
  baseLanguage: string;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchLanguages: (projectName: string) => Promise<void>;
  addLanguage: (projectName: string, language: string) => Promise<boolean>;
  clearError: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  languages: [],
  baseLanguage: 'en',
  loading: false,
  error: null,
  
  fetchLanguages: async (projectName: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getLanguages(projectName);
      const { languages, baseLanguage } = response.data.data;
      
      set({ 
        languages: languages || [], 
        baseLanguage: baseLanguage || 'en',
        loading: false 
      });
    } catch (error: any) {
      console.error('Error fetching languages:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch languages',
        loading: false
      });
    }
  },
  
  addLanguage: async (projectName: string, language: string) => {
    try {
      set({ loading: true, error: null });
      await api.addLanguage(projectName, language);
      
      // Refresh the list of languages
      await get().fetchLanguages(projectName);
      return true;
    } catch (error: any) {
      console.error('Error adding language:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to add language',
        loading: false
      });
      return false;
    }
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
