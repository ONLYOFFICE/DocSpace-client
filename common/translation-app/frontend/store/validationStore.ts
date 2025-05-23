import { create } from "zustand";
import { ValidationError, validateNamespaceTranslations } from "@/services/validationService";

interface ValidationState {
  // State
  errors: ValidationError[];
  loading: boolean;
  namespace: string | null;
  projectName: string | null;
  isValidationModalOpen: boolean;
  
  // Actions
  validateNamespace: (projectName: string, namespace: string, languages?: string[]) => Promise<ValidationError[]>;
  setIsValidationModalOpen: (isOpen: boolean) => void;
  resetState: () => void;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  // Initial state
  errors: [],
  loading: false,
  namespace: null,
  projectName: null,
  isValidationModalOpen: false,
  
  // Validate a namespace's translations
  validateNamespace: async (projectName, namespace, languages = []) => {
    try {
      set({ loading: true, namespace, projectName, errors: [] });
      
      const errors = await validateNamespaceTranslations(projectName, namespace, languages);
      
      set({ errors, loading: false, isValidationModalOpen: true });
      return errors;
    } catch (error) {
      console.error("Error in validateNamespace:", error);
      set({ 
        loading: false, 
        errors: [{ 
          key: "(system)",
          language: "all",
          message: `Validation failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: "error" 
        }] 
      });
      return get().errors;
    }
  },
  
  // Modal control
  setIsValidationModalOpen: (isOpen) => set({ isValidationModalOpen: isOpen }),
  
  // Reset validation state
  resetState: () => set({ 
    errors: [], 
    loading: false, 
    namespace: null, 
    projectName: null,
    isValidationModalOpen: false 
  }),
}));
