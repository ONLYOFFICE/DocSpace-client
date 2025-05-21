import { create } from 'zustand';
import * as api from '@/lib/api';
import { getSocket } from '@/lib/socket';

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

interface TranslationProgress {
  projectName: string;
  namespace: string;
  targetLanguage: string;
  currentKey?: string;
  progress: number;
  total: number;
  isCompleted: boolean;
  error?: string;
}

interface OllamaState {
  models: OllamaModel[];
  selectedModel: string | null;
  isConnected: boolean;
  translationProgress: TranslationProgress | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchModels: () => Promise<void>;
  setSelectedModel: (model: string) => void;
  translateKey: (
    projectName: string,
    sourceLanguage: string,
    targetLanguage: string,
    namespace: string,
    key: string
  ) => Promise<boolean>;
  translateNamespace: (
    projectName: string,
    sourceLanguage: string,
    targetLanguage: string,
    namespace: string
  ) => Promise<boolean>;
  checkConnection: () => Promise<boolean>;
  setupSocketListeners: () => void;
  clearTranslationProgress: () => void;
  clearError: () => void;
}

// Local storage keys
const STORAGE_KEY_SELECTED_MODEL = 'translation-app-selected-model';

// Helper function to get stored model
const getStoredModel = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEY_SELECTED_MODEL);
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

// Helper function to store selected model
const storeSelectedModel = (model: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (model) {
      localStorage.setItem(STORAGE_KEY_SELECTED_MODEL, model);
    } else {
      localStorage.removeItem(STORAGE_KEY_SELECTED_MODEL);
    }
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export const useOllamaStore = create<OllamaState>((set, get) => ({
  models: [],
  selectedModel: getStoredModel(),
  isConnected: false,
  translationProgress: null,
  loading: false,
  error: null,
  
  fetchModels: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.getOllamaModels();
      
      const models = response.data.data;
      const storedModel = getStoredModel();
      
      // Use stored model if it exists and is available in the models list
      // Otherwise use the first model from the list
      const modelExists = storedModel && models.some((m: any) => m.name === storedModel);
      const selectedModel = modelExists ? storedModel : (models.length > 0 ? models[0].name : null);
      
      // Store the selected model
      if (selectedModel) {
        storeSelectedModel(selectedModel);
      }
      
      set({ 
        models,
        selectedModel,
        isConnected: true,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error fetching Ollama models:', error);
      set({ 
        isConnected: false,
        error: 'Failed to connect to Ollama API. Make sure Ollama is running locally.',
        loading: false
      });
    }
  },
  
  setSelectedModel: (modelName: string) => {
    set({ selectedModel: modelName });
    storeSelectedModel(modelName);
  },
  
  translateKey: async (
    projectName: string,
    sourceLanguage: string,
    targetLanguage: string,
    namespace: string,
    key: string
  ) => {
    const { selectedModel } = get();
    
    if (!selectedModel) {
      set({ error: 'No translation model selected' });
      return false;
    }
    
    try {
      set({ 
        loading: true, 
        error: null,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          currentKey: key,
          progress: 0,
          total: 1,
          isCompleted: false
        }
      });
      
      await api.translateKey(
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        key,
        selectedModel
      );
      
      set({ 
        loading: false,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          currentKey: key,
          progress: 1,
          total: 1,
          isCompleted: true
        }
      });
      
      return true;
    } catch (error: any) {
      console.error('Error translating key:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to translate key',
        loading: false,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          currentKey: key,
          progress: 0,
          total: 1,
          isCompleted: true,
          error: 'Translation failed'
        }
      });
      return false;
    }
  },
  
  translateNamespace: async (
    projectName: string,
    sourceLanguage: string,
    targetLanguage: string,
    namespace: string
  ) => {
    const { selectedModel } = get();
    
    if (!selectedModel) {
      set({ error: 'No translation model selected' });
      return false;
    }
    
    try {
      set({ 
        loading: true, 
        error: null,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          progress: 0,
          total: 100, // Will be updated when server returns actual count
          isCompleted: false
        }
      });
      
      // This is an async operation that will be tracked via socket events
      await api.translateNamespace(
        projectName,
        sourceLanguage,
        targetLanguage,
        namespace,
        selectedModel
      );
      
      // The actual progress and completion will be tracked via Socket.IO events
      
      return true;
    } catch (error: any) {
      console.error('Error starting batch translation:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to start batch translation',
        loading: false,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          progress: 0,
          total: 100,
          isCompleted: true,
          error: 'Failed to start batch translation'
        }
      });
      return false;
    }
  },
  
  checkConnection: async () => {
    try {
      await api.getOllamaModels();
      set({ isConnected: true });
      return true;
    } catch (error) {
      set({ isConnected: false });
      return false;
    }
  },
  
  setupSocketListeners: () => {
    const socket = getSocket();
    
    // Translation started event
    socket.on('translation:started', (data: any) => {
      const { projectName, targetLanguage, namespace, key } = data;
      console.log('Translation started:', data);
      
      set({
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          currentKey: key,
          progress: 0,
          total: 1,
          isCompleted: false
        }
      });
    });
    
    // Translation completed event
    socket.on('translation:completed', (data: any) => {
      const { projectName, targetLanguage, namespace, key, value } = data;
      console.log('Translation completed:', data);
      
      set({
        loading: false,
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          currentKey: key,
          progress: 1,
          total: 1,
          isCompleted: true
        }
      });
    });
    
    // Batch translation started
    socket.on('batch-translation:started', (data: any) => {
      const { projectName, targetLanguage, namespace, totalKeys } = data;
      console.log('Batch translation started:', data);
      
      set({
        translationProgress: {
          projectName,
          namespace,
          targetLanguage,
          progress: 0,
          total: totalKeys,
          isCompleted: false
        }
      });
    });
    
    // Batch translation progress
    socket.on('batch-translation:progress', (data: any) => {
      const { projectName, targetLanguage, namespace, currentKey, counter } = data;
      console.log('Batch translation progress:', data);
      
      set(state => ({
        translationProgress: {
          ...state.translationProgress!,
          currentKey,
          progress: counter,
          isCompleted: false
        }
      }));
    });
    
    // Batch translation completed
    socket.on('batch-translation:completed', (data: any) => {
      const { projectName, targetLanguage, namespace } = data;
      console.log('Batch translation completed:', data);
      
      set(state => ({
        loading: false,
        translationProgress: {
          ...state.translationProgress!,
          progress: state.translationProgress?.total || 0,
          isCompleted: true
        }
      }));
    });
    
    // Batch translation error
    socket.on('batch-translation:error', (data: any) => {
      const { error, details } = data;
      console.error('Batch translation error:', data);
      
      set(state => ({
        loading: false,
        error: error || 'Translation failed',
        translationProgress: {
          ...state.translationProgress!,
          isCompleted: true,
          error: details || 'Translation failed'
        }
      }));
    });
  },
  
  clearTranslationProgress: () => {
    set({ translationProgress: null });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
