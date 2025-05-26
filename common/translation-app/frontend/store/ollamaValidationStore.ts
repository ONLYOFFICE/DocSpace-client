import { create } from "zustand";
import { validateNamespaceTranslations } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { getLanguageName } from "@/utils/languageUtils";
import { ValidationError } from "@/services/validationService";

interface LLMValidationResult {
  isValid: boolean;
  errors: {
    type: string;
    message: string;
  }[];
  suggestions: string[];
  rating: number;
}

export interface LLMValidationError extends ValidationError {
  suggestions?: string[];
  rating?: number;
}

interface LLMValidationState {
  // State
  errors: LLMValidationError[];
  loading: boolean;
  namespace: string | null;
  projectName: string | null;
  baseLanguage: string | null;
  targetLanguage: string | null;
  progress: {
    current: number;
    total: number;
    currentKey?: string;
    error?: string;
  };
  isValidationModalOpen: boolean;
  socketConnected: boolean;

  // Actions
  validateNamespaceLLM: (
    projectName: string,
    namespace: string,
    baseLanguage: string,
    targetLanguage: string,
    model: string,
    maxKeys?: number
  ) => Promise<LLMValidationError[]>;
  setupSocketListeners: () => void;
  cleanupSocketListeners: () => void;
  updateProgressFromSocket: (data: any) => void;
  setIsValidationModalOpen: (isOpen: boolean) => void;
  resetState: () => void;
}

export const useOllamaValidationStore = create<LLMValidationState>(
  (set, get) => ({
    // Get socket reference

    // Initial state
    errors: [],
    loading: false,
    namespace: null,
    projectName: null,
    baseLanguage: null,
    targetLanguage: null,
    progress: {
      current: 0,
      total: 0,
    },
    isValidationModalOpen: false,
    socketConnected: false,

    // Set up socket listeners for LLM validation events
    setupSocketListeners: () => {
      const socket = getSocket();
      const store = get();

      if (!socket) {
        console.warn("Socket not available for LLM validation progress");
        return;
      }

      // Clean up any existing listeners first
      store.cleanupSocketListeners();

      // Set socket as connected
      set({ socketConnected: true });

      // Listen for batch validation start
      socket.on("validation:batch:started", (data: any) => {
        const {
          projectName,
          namespace,
          sourceLanguage,
          targetLanguage,
          total,
        } = data;
        const store = get();

        // Only update if this matches our current validation
        if (
          store.projectName === projectName &&
          store.namespace === namespace &&
          store.baseLanguage === sourceLanguage &&
          store.targetLanguage === targetLanguage
        ) {
          set({
            progress: {
              current: 0,
              total: total || 100,
              currentKey: undefined,
              error: undefined,
            },
          });
        }
      });

      // Listen for progress updates
      socket.on("validation:batch:progress", (data: any) => {
        get().updateProgressFromSocket(data);
      });

      // Listen for validation completion
      socket.on("validation:batch:completed", (data: any) => {
        const {
          projectName,
          namespace,
          sourceLanguage,
          targetLanguage,
          total,
          completed,
        } = data;
        const store = get();

        if (
          store.projectName === projectName &&
          store.namespace === namespace &&
          store.baseLanguage === sourceLanguage &&
          store.targetLanguage === targetLanguage
        ) {
          // Final progress update
          set({
            progress: {
              current: completed || total,
              total: total,
              currentKey: undefined,
              error: undefined,
            },
            loading: false,
          });
        }
      });

      // Listen for validation errors
      socket.on("validation:batch:error", (data: any) => {
        const {
          projectName,
          namespace,
          sourceLanguage,
          targetLanguage,
          error,
        } = data;
        const store = get();

        if (
          store.projectName === projectName &&
          store.namespace === namespace &&
          store.baseLanguage === sourceLanguage &&
          store.targetLanguage === targetLanguage
        ) {
          set({
            progress: {
              ...store.progress,
              error: error,
            },
            loading: false,
            errors: [
              {
                key: "(system)",
                language: "all",
                message: `Validation error: ${error}`,
                severity: "error",
              },
            ],
          });
        }
      });
    },

    // Clean up socket listeners
    cleanupSocketListeners: () => {
      const socket = (window as any).socket;
      if (!socket) return;

      socket.off("validation:batch:started");
      socket.off("validation:batch:progress");
      socket.off("validation:batch:completed");
      socket.off("validation:batch:error");
    },

    // Update progress from socket event
    updateProgressFromSocket: (data: any) => {
      const {
        projectName,
        namespace,
        sourceLanguage,
        targetLanguage,
        progress,
        total,
        currentKey,
        error,
      } = data;
      const store = get();

      if (
        store.projectName === projectName &&
        store.namespace === namespace &&
        store.baseLanguage === sourceLanguage &&
        store.targetLanguage === targetLanguage
      ) {
        set({
          progress: {
            current: progress || 0,
            total: total || store.progress.total,
            currentKey: currentKey,
            error: error,
          },
        });
      }
    },

    // Validate a namespace's translations using Ollama LLM
    validateNamespaceLLM: async (
      projectName,
      namespace,
      baseLanguage,
      targetLanguage,
      model,
      maxKeys = 20
    ) => {
      try {
        // Reset state and set initial values
        set({
          loading: true,
          namespace,
          projectName,
          baseLanguage,
          targetLanguage,
          errors: [],
          progress: {
            current: 0,
            total: 100, // Will be updated when response comes back
            currentKey: undefined,
            error: undefined,
          },
        });

        // Make sure socket listeners are set up
        get().setupSocketListeners();

        // Call the API
        const response = await validateNamespaceTranslations(
          projectName,
          baseLanguage,
          targetLanguage,
          namespace,
          model,
          maxKeys
        );

        if (!response.data.success) {
          throw new Error("Failed to validate translations");
        }

        const validationData = response.data.data;
        const results = validationData.results;

        // Convert the results to our error format
        const errors: LLMValidationError[] = [];

        Object.entries(results).forEach(([key, result]: [string, any]) => {
          const validationResult = result as LLMValidationResult;

          if (!validationResult.isValid) {
            validationResult.errors.forEach((error) => {
              errors.push({
                key,
                language: targetLanguage,
                message: `${error.type}: ${error.message}`,
                severity: "error",
                suggestions: validationResult.suggestions,
                rating: validationResult.rating,
              });
            });
          } else if (validationResult.rating && validationResult.rating < 4) {
            // Add warnings for translations with low ratings
            errors.push({
              key,
              language: targetLanguage,
              message: `Low quality translation (rating: ${validationResult.rating}/5)`,
              severity: "warning",
              suggestions: validationResult.suggestions,
              rating: validationResult.rating,
            });
          }
        });

        set({
          errors,
          loading: false,
          isValidationModalOpen: true,
          progress: {
            current: validationData.stats.completed,
            total: validationData.stats.total,
          },
        });

        return errors;
      } catch (error) {
        console.error("Error in validateNamespaceLLM:", error);
        set({
          loading: false,
          errors: [
            {
              key: "(system)",
              language: "all",
              message: `LLM Validation failed: ${error instanceof Error ? error.message : String(error)}`,
              severity: "error",
            },
          ],
          progress: {
            current: 0,
            total: 0,
          },
        });
        return get().errors;
      }
    },

    // Modal control
    setIsValidationModalOpen: (isOpen) =>
      set({ isValidationModalOpen: isOpen }),

    // Reset validation state
    resetState: () => {
      // Clean up socket listeners
      get().cleanupSocketListeners();

      set({
        errors: [],
        loading: false,
        namespace: null,
        projectName: null,
        baseLanguage: null,
        targetLanguage: null,
        isValidationModalOpen: false,
        progress: {
          current: 0,
          total: 0,
          currentKey: undefined,
          error: undefined,
        },
        socketConnected: false,
      });
    },
  })
);
