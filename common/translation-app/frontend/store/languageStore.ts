import { create } from "zustand";
import * as api from "@/lib/api";
import { useProjectStore } from "./projectStore";

// Local storage keys
const SELECTED_LANGUAGES_KEY = "translation-app-selected-languages";
const SHOW_UNTRANSLATED_KEY = "translation-app-show-untranslated";

interface LanguageState {
  languages: string[];
  selectedLanguages: string[];
  baseLanguage: string;
  loading: boolean;
  error: string | null;
  showUntranslated: boolean;

  // Actions
  setSelectedLanguages: (languages: string[]) => void;
  setShowUntranslated: (show: boolean) => void;
  fetchLanguages: (projectName: string) => Promise<void>;
  addLanguage: (projectName: string, language: string) => Promise<boolean>;
  addLanguageToAllProjects: (
    language: string
  ) => Promise<{ success: boolean; failedProjects: string[] }>;
  clearError: () => void;
}

// Helper function to safely parse JSON from localStorage
const getStoredValue = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue;
  
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const useLanguageStore = create<LanguageState>((set, get) => ({
  languages: [],
  selectedLanguages: getStoredValue<string[]>(SELECTED_LANGUAGES_KEY, []),
  baseLanguage: "en",
  loading: false,
  error: null,
  showUntranslated: getStoredValue<boolean>(SHOW_UNTRANSLATED_KEY, false),

  setSelectedLanguages: (languages: string[]) => {
    set({ selectedLanguages: languages });
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(SELECTED_LANGUAGES_KEY, JSON.stringify(languages));
    }
  },

  setShowUntranslated: (show: boolean) => {
    set({ showUntranslated: show });
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(SHOW_UNTRANSLATED_KEY, JSON.stringify(show));
    }
  },

  fetchLanguages: async (projectName: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getLanguages(projectName);
      const { languages, baseLanguage } = response.data.data;

      set({
        languages: languages || [],
        baseLanguage: baseLanguage || "en",
        loading: false,
      });
    } catch (error: any) {
      console.error("Error fetching languages:", error);
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch languages",
        loading: false,
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
      console.error("Error adding language:", error);
      set({
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to add language",
        loading: false,
      });
      return false;
    }
  },

  addLanguageToAllProjects: async (language: string) => {
    try {
      set({ loading: true, error: null });

      // Directly fetch the list of projects from the API
      const projectsResponse = await api.getProjects();
      const projects = projectsResponse.data.data || [];
      const failedProjects: string[] = [];

      // If no projects found, return early
      if (projects.length === 0) {
        set({
          error: "No projects found to add language to",
          loading: false,
        });
        return { success: false, failedProjects: [] };
      }

      // Add the language to each project
      for (const project of projects) {
        try {
          await api.addLanguage(project.name, language);
        } catch (error) {
          console.error(
            `Failed to add language ${language} to project ${project.name}:`,
            error
          );
          failedProjects.push(project.name);
        }
      }

      // Refresh the list of languages for the current project
      try {
        // Get the current project from the project store
        const currentProject = useProjectStore.getState().currentProject;

        if (currentProject) {
          // Refresh languages for current project
          await get().fetchLanguages(currentProject.name);
        }
      } catch (refreshError) {
        console.error(
          "Failed to refresh language list after adding new language:",
          refreshError
        );
        // Continue despite refresh error - the language addition was still successful
      }

      set({ loading: false });

      return {
        success: failedProjects.length < projects.length,
        failedProjects,
      };
    } catch (error: any) {
      console.error("Error adding language to all projects:", error);
      set({
        error: error.message || "Failed to add language to all projects",
        loading: false,
      });
      return { success: false, failedProjects: [] };
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
