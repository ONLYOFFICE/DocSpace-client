import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as api from "@/lib/api";

interface TranslationData {
  [key: string]: string | TranslationData;
}

interface TranslationEntry {
  key: string;
  path: string;
  untranslatedLngs: string[];
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
  newlyCreatedKey: string | null; // Track newly created key for highlighting
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Actions
  fetchTranslations: (
    projectName: string,
    languages: string[],
    namespace: string
  ) => Promise<TranslationEntry[]>;
  updateTranslation: (
    projectName: string,
    language: string,
    namespace: string,
    key: string,
    value: string,
    isAiTranslated?: boolean
  ) => Promise<boolean>;

  // Namespace operations
  renameNamespace: (
    projectName: string,
    oldName: string,
    newName: string
  ) => Promise<boolean>;
  moveNamespaceTo: (
    sourceProjectName: string,
    sourceNamespace: string,
    targetProjectName: string,
    targetNamespace: string
  ) => Promise<boolean>;
  deleteNamespace: (projectName: string, namespace: string) => Promise<boolean>;

  // Key operations
  renameKey: (
    projectName: string,
    namespace: string,
    oldKeyPath: string,
    newKeyPath: string
  ) => Promise<boolean>;
  moveKey: (
    sourceProjectName: string,
    sourceNamespace: string,
    targetProjectName: string,
    targetNamespace: string,
    keyPath: string
  ) => Promise<boolean>;
  deleteKey: (
    projectName: string,
    namespace: string,
    keyPath: string
  ) => Promise<boolean>;

  // State management
  setCurrentKey: (key: string | null) => void;
  clearError: () => void;
  resetState: () => void; // Reset all translation-related state
}

// Helper function to flatten nested translations
const flattenTranslations = (
  translations: { [lang: string]: TranslationData },
  languages: string[]
): TranslationEntry[] => {
  const result: TranslationEntry[] = [];

  const processObject = (
    obj: TranslationData,
    path: string = "",
    currentPath: string = ""
  ) => {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;

      if (typeof value === "object" && value !== null) {
        processObject(value, path, newPath);
      } else {
        // This is a leaf node - a translatable string
        const entry = result.find((e) => e.path === newPath);

        if (entry) {
          // Update existing entry for this key
          entry.translations[path] = value as string;
        } else {
          // Create new entry
          const newEntry: TranslationEntry = {
            key,
            path: newPath,
            untranslatedLngs: [],
            translations: { [path]: value as string },
          };

          // Initialize empty translations for all languages
          languages.forEach((lang) => {
            if (!newEntry.translations[lang]) {
              newEntry.translations[lang] = "";
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

  for (const entry of result) {
    entry.untranslatedLngs = languages.filter(
      (lang) => !entry.translations[lang]
    );
  }

  return result;
};

const useTranslationStore = create<TranslationState>()(
  devtools(
    (set, get) => ({
      translationData: {},
      flattenedTranslations: [],
      currentKey: null,
      newlyCreatedKey: null,
      loading: false,
      saving: false,
      error: null,

      fetchTranslations: async (
        projectName: string,
        languages: string[],
        namespace: string
      ) => {
        try {
          set({ loading: true, error: null });

          const translationData: { [language: string]: TranslationData } = {};

          // Fetch translations for each language
          for (const language of languages) {
            const response = await api.getTranslations(
              projectName,
              language,
              namespace
            );

            if (response.data.success) {
              translationData[language] = response.data.data || {};
            }
          }

          // Create flattened representation for the UI
          const flattenedTranslations = flattenTranslations(
            translationData,
            languages
          );

          // Preserve current key when reloading translations for the same namespace
          // This helps maintain pagination state after reload
          const prevState = get();
          const currentKey = prevState.currentKey;

          set({
            translationData,
            flattenedTranslations,
            // Only maintain currentKey if translations aren't empty
            loading: false,
          });

          // For debugging URL state persistence
          console.log(
            `Loaded ${flattenedTranslations.length} translations for namespace ${namespace}`
          );
          if (currentKey) {
            console.log(`Current key: ${currentKey}`);
          }

          return flattenedTranslations; // Return the translations for easier handling
        } catch (error: any) {
          console.error("Error fetching translations:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to fetch translations",
            loading: false,
          });
          return [];
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

          // If this is a new key being created in the base language, mark it for highlighting
          if (language === "en") {
            set({ newlyCreatedKey: key });
          }

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
          const entryIndex = updatedFlattened.findIndex(
            (entry) => entry.path === key
          );

          if (entryIndex !== -1) {
            updatedFlattened[entryIndex].translations[language] = value;
          }

          // Update the nested data structure
          const updatedData = { ...translationData };
          if (!updatedData[language]) {
            updatedData[language] = {};
          }

          // Navigate and update the nested path
          const keyParts = key.split(".");
          let current = updatedData[language];

          for (let i = 0; i < keyParts.length - 1; i++) {
            const part = keyParts[i];
            if (!current[part] || typeof current[part] !== "object") {
              current[part] = {};
            }
            current = current[part] as TranslationData;
          }

          const finalKey = keyParts[keyParts.length - 1];
          current[finalKey] = value;

          set({
            translationData: updatedData,
            flattenedTranslations: updatedFlattened,
            saving: false,
          });

          return true;
        } catch (error: any) {
          console.error("Error updating translation:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to update translation",
            saving: false,
          });
          return false;
        }
      },

      setCurrentKey: (key) => {
        set({ currentKey: key });
      },

      renameNamespace: async (
        projectName: string,
        oldName: string,
        newName: string
      ) => {
        try {
          set({ loading: true, error: null });

          const response = await api.renameNamespace(
            projectName,
            oldName,
            newName
          );

          if (response.data.success) {
            set({ loading: false });
            return true;
          } else {
            throw new Error(
              response.data.error || "Failed to rename namespace"
            );
          }
        } catch (error: any) {
          console.error("Error renaming namespace:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to rename namespace",
            loading: false,
          });
          return false;
        }
      },

      moveNamespaceTo: async (
        sourceProjectName: string,
        sourceNamespace: string,
        targetProjectName: string,
        targetNamespace: string
      ) => {
        try {
          set({ loading: true, error: null });

          const response = await api.moveNamespaceTo(
            sourceProjectName,
            sourceNamespace,
            targetProjectName,
            targetNamespace
          );

          if (response.data.success) {
            set({ loading: false });
            return true;
          } else {
            throw new Error(response.data.error || "Failed to move namespace");
          }
        } catch (error: any) {
          console.error("Error moving namespace:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to move namespace",
            loading: false,
          });
          return false;
        }
      },

      deleteNamespace: async (projectName: string, namespace: string) => {
        try {
          set({ loading: true, error: null });

          const response = await api.deleteNamespace(projectName, namespace);

          if (response.data.success) {
            set({ loading: false });
            return true;
          } else {
            throw new Error(
              response.data.error || "Failed to delete namespace"
            );
          }
        } catch (error: any) {
          console.error("Error deleting namespace:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to delete namespace",
            loading: false,
          });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      resetState: () => {
        set({
          translationData: {},
          flattenedTranslations: [],
          currentKey: null,
          newlyCreatedKey: null,
          loading: false,
          saving: false,
          error: null,
        });
      },

      // Key operations
      renameKey: async (projectName, namespace, oldKeyPath, newKeyPath) => {
        try {
          set({ saving: true, error: null });

          await api.renameTranslationKey(
            projectName,
            namespace,
            oldKeyPath,
            newKeyPath
          );

          // Re-fetch translations to update the UI
          const { translationData } = get();
          const languages = Object.keys(translationData);

          await get().fetchTranslations(projectName, languages, namespace);

          set({ saving: false });
          return true;
        } catch (error: any) {
          console.error("Error renaming key:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to rename key",
            saving: false,
          });
          return false;
        }
      },

      moveKey: async (
        sourceProjectName,
        sourceNamespace,
        targetProjectName,
        targetNamespace,
        keyPath
      ) => {
        try {
          set({ saving: true, error: null });

          await api.moveTranslationKey(
            sourceProjectName,
            sourceNamespace,
            targetProjectName,
            targetNamespace,
            keyPath
          );

          // Re-fetch translations for the source namespace
          const { translationData } = get();
          const languages = Object.keys(translationData);

          await get().fetchTranslations(
            sourceProjectName,
            languages,
            sourceNamespace
          );

          set({ saving: false });
          return true;
        } catch (error: any) {
          console.error("Error moving key:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to move key",
            saving: false,
          });
          return false;
        }
      },

      deleteKey: async (projectName, namespace, keyPath) => {
        try {
          set({ saving: true, error: null });

          await api.deleteTranslationKey(projectName, namespace, keyPath);

          // Re-fetch translations to update the UI
          const { translationData } = get();
          const languages = Object.keys(translationData);

          await get().fetchTranslations(projectName, languages, namespace);

          set({ saving: false });
          return true;
        } catch (error: any) {
          console.error("Error deleting key:", error);
          set({
            error:
              error.response?.data?.error ||
              error.message ||
              "Failed to delete key",
            saving: false,
          });
          return false;
        }
      },
    }),
    { name: "translation-store" }
  )
);

export { useTranslationStore };
