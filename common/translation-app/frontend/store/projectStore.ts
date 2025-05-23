import { create } from 'zustand';
import * as api from '@/lib/api';

interface Project {
  name: string;
  path: string;
  languages?: string[];
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (projectName: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  
  fetchProjects: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.getProjects();
      set({ projects: response.data.data, loading: false });
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch projects',
        loading: false
      });
    }
  },
  
  fetchProject: async (projectName: string) => {
    try {
      set({ loading: true, error: null });
      const response = await api.getProject(projectName);
      set({ 
        currentProject: response.data.data,
        loading: false
      });
    } catch (error: any) {
      console.error(`Error fetching project ${projectName}:`, error);
      set({ 
        error: error.response?.data?.error || error.message || `Failed to fetch project ${projectName}`,
        loading: false
      });
    }
  },
  
  setCurrentProject: (project) => {
    set({ currentProject: project });
  },
  
  clearError: () => {
    set({ error: null });
  }
}));
