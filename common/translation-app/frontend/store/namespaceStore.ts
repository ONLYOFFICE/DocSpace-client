import { create } from "zustand";
import * as api from "@/lib/api";

interface NamespaceState {
  namespaces: string[];
  currentNamespace: string | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchNamespaces: (
    projectName: string,
    language: string,
    options?: { untranslatedOnly?: boolean; baseLanguage?: string }
  ) => Promise<void>;
  addNamespace: (projectName: string, namespace: string) => Promise<boolean>;
  setCurrentNamespace: (namespace: string | null) => void;
  clearError: () => void;
  setNamespaces: (namespaces: string[]) => void;
}

export const useNamespaceStore = create<NamespaceState>((set, get) => ({
  namespaces: [],
  currentNamespace: null,
  loading: false,
  error: null,

  fetchNamespaces: async (
    projectName: string,
    language: string,
    options?: { untranslatedOnly?: boolean; baseLanguage?: string }
  ) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getNamespaces(projectName, language, options);
      set({
        namespaces: response.data.data || [],
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching namespaces:", error);
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch namespaces",
        loading: false,
      });
    }
  },

  addNamespace: async (projectName: string, namespace: string) => {
    try {
      set({ loading: true, error: null });
      await api.addNamespace(projectName, namespace);

      // Refresh the list of namespaces using the base language
      // This assumes baseLanguage is 'en' or handled elsewhere
      await get().fetchNamespaces(projectName, "en");
      return true;
    } catch (error: any) {
      console.error("Error adding namespace:", error);
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to add namespace",
        loading: false,
      });
      return false;
    }
  },

  setCurrentNamespace: (namespace) => {
    set({ currentNamespace: namespace });
  },

  setNamespaces: (namespaces: string[]) => {
    set({ namespaces });
  },

  clearError: () => {
    set({ error: null });
  },
}));
