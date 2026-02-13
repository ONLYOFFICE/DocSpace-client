import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import * as api from '../lib/api';

interface KeyUsage {
  key: string;
  usages: {
    file_path: string;
    line_number: number;
    context: string;
    module: string;
  }[];
  comment: {
    comment: string;
    is_auto: boolean;
    updated_at: string;
  } | null;
}

interface KeyUsageStats {
  totalKeys: number;
  totalModules: number;
  totalFiles: number;
  totalUsages: number;
  moduleStats: {
    module: string;
    keyCount: number;
    fileCount: number;
  }[];
}

interface KeyUsageState {
  // Current key data
  currentKey: string | null;
  keyUsage: KeyUsage | null;
  isLoadingKeyUsage: boolean;
  keyUsageError: string | null;
  
  // Modules data
  modules: string[];
  isLoadingModules: boolean;
  moduleKeys: Record<string, string[]>;
  
  // Stats
  stats: KeyUsageStats | null;
  isLoadingStats: boolean;
  
  // Analysis status
  isAnalyzing: boolean;
  lastAnalysisTime: string | null;
  
  // Actions
  loadKeyUsage: (key: string) => Promise<void>;
  loadModules: () => Promise<void>;
  loadModuleKeys: (module: string) => Promise<void>;
  loadStats: () => Promise<void>;
  triggerAnalysis: () => Promise<void>;
  setKeyComment: (key: string, comment: string) => Promise<void>;
  searchKeys: (query: string) => Promise<string[]>;
}

export const useKeyUsageStore = create<KeyUsageState>()(
  devtools(
    (set, get) => ({
      // State
      currentKey: null,
      keyUsage: null,
      isLoadingKeyUsage: false,
      keyUsageError: null,
      
      modules: [],
      isLoadingModules: false,
      moduleKeys: {},
      
      stats: null,
      isLoadingStats: false,
      
      isAnalyzing: false,
      lastAnalysisTime: null,
      
      // Actions
      loadKeyUsage: async (key: string) => {
        try {
          // Check if we already have this key loaded
          const currentState = get();
          if (currentState.currentKey === key && currentState.keyUsage) {
            return; // Avoid reloading the same key
          }

          set({ isLoadingKeyUsage: true, keyUsageError: null, currentKey: key });
          
          // Add a timeout to prevent long-running requests
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 10000);
          });
          
          const dataPromise = api.getKeyUsage(key);
          const data = await Promise.race([dataPromise, timeoutPromise]) as any;
          
          // Limit the amount of usages to prevent UI freezes
          if (data && data.usages && data.usages.length > 200) {
            // Show a warning in the console but don't break the UI
            console.warn(`Key ${key} has ${data.usages.length} usages. Limiting to 200 for performance.`);
            data.usages = data.usages.slice(0, 200);
          }
          
          set({ keyUsage: data, isLoadingKeyUsage: false });
        } catch (error) {
          console.error('Error loading key usage:', error);
          set({ 
            keyUsageError: error instanceof Error ? error.message : 'Failed to load key usage', 
            isLoadingKeyUsage: false,
            keyUsage: null
          });
        }
      },
      
      loadModules: async () => {
        try {
          set({ isLoadingModules: true });
          const modules = await api.getAllModules();
          set({ modules, isLoadingModules: false });
        } catch (error) {
          console.error('Error loading modules:', error);
          set({ isLoadingModules: false });
        }
      },
      
      loadModuleKeys: async (module: string) => {
        try {
          // Check if we already have the keys for this module
          if (get().moduleKeys[module]) return;
          
          const keys = await api.getModuleKeys(module);
          set(state => ({
            moduleKeys: {
              ...state.moduleKeys,
              [module]: keys
            }
          }));
        } catch (error) {
          console.error(`Error loading keys for module ${module}:`, error);
        }
      },
      
      loadStats: async () => {
        try {
          set({ isLoadingStats: true });
          const response = await api.getKeyUsageStats();
          set({ stats: response.data, isLoadingStats: false });
        } catch (error) {
          console.error('Error loading key usage stats:', error);
          set({ isLoadingStats: false });
        }
      },
      
      triggerAnalysis: async () => {
        try {
          set({ isAnalyzing: true });
          await api.triggerKeyUsageAnalysis();
          set({ 
            isAnalyzing: false,
            lastAnalysisTime: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error triggering analysis:', error);
          set({ isAnalyzing: false });
        }
      },
      
      setKeyComment: async (key: string, comment: string) => {
        try {
          await api.setKeyComment(key, comment);
          
          // If this is the current key, update the comment
          if (get().currentKey === key && get().keyUsage) {
            set(state => ({
              keyUsage: state.keyUsage ? {
                ...state.keyUsage,
                comment: {
                  comment,
                  is_auto: false,
                  updated_at: new Date().toISOString()
                }
              } : null
            }));
          }
        } catch (error) {
          console.error(`Error setting comment for key ${key}:`, error);
        }
      },
      
      searchKeys: async (query: string): Promise<string[]> => {
        if (!query) return [];
        
        try {
          return await api.searchKeys(query);
        } catch (error) {
          console.error('Error searching keys:', error);
          return [];
        }
      }
    }),
    { name: 'key-usage-store' }
  )
);
