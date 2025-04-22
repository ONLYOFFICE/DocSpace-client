"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { useLanguageStore } from "@/store/languageStore";
import { useNamespaceStore } from "@/store/namespaceStore";
import { useTranslationStore } from "@/store/translationStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { useValidationStore } from "@/store/validationStore";
import { useOllamaValidationStore } from "@/store/ollamaValidationStore";
import { initSocket, getSocket } from "@/lib/socket";
import { useEffect as useReactEffect } from "react";

import LanguageSelector from "@/components/LanguageSelector";
import NamespaceSelector from "@/components/NamespaceSelector";
import TranslationTable from "@/components/TranslationTable";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import NamespaceModal from "@/components/NamespaceModal";
import TranslationErrorModal from "@/components/TranslationErrorModal";
import LLMValidationProgressModal from "@/components/LLMValidationProgressModal";
import ThemeToggle from "@/components/ThemeToggle";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = params.projectName as string;

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isNamespaceModalOpen, setIsNamespaceModalOpen] =
    useState<boolean>(false);
  const [namespaceForContextMenu, setNamespaceForContextMenu] = useState<
    string | null
  >(null);
  const [isProgressModalOpen, setIsProgressModalOpen] =
    useState<boolean>(false);
  const [llmValidationParams, setLlmValidationParams] = useState<{
    sourceLang: string;
    targetLang: string;
    namespace: string;
  } | null>(null);

  // Stores
  const {
    currentProject,
    fetchProject,
    loading: projectLoading,
    error: projectError,
  } = useProjectStore();

  const {
    validateNamespace,
    errors: validationErrors,
    loading: validationLoading,
    isValidationModalOpen,
    setIsValidationModalOpen,
    resetState: resetValidationState,
  } = useValidationStore();

  const {
    validateNamespaceLLM,
    errors: llmValidationErrors,
    loading: llmValidationLoading,
    isValidationModalOpen: isLLMValidationModalOpen,
    setIsValidationModalOpen: setLLMValidationModalOpen,
    progress: llmValidationProgress,
    resetState: resetLLMValidationState,
  } = useOllamaValidationStore();

  const {
    languages,
    baseLanguage,
    fetchLanguages,
    loading: languagesLoading,
    error: languagesError,
  } = useLanguageStore();

  const {
    namespaces,
    currentNamespace,
    fetchNamespaces,
    setCurrentNamespace,
    loading: namespacesLoading,
    error: namespacesError,
  } = useNamespaceStore();

  const {
    flattenedTranslations,
    fetchTranslations,
    resetState: resetTranslations,
    loading: translationsLoading,
    error: translationsError,
  } = useTranslationStore();

  const {
    setupSocketListeners,
    checkConnection: checkOllamaConnection,
    isConnected: ollamaConnected,
    models,
    selectedModel,
    setSelectedModel,
    fetchModels,
  } = useOllamaStore();

  // Initialize data
  useEffect(() => {
    if (projectName) {
      fetchProject(projectName);
      fetchLanguages(projectName);

      // Initialize socket
      initSocket();
      setupSocketListeners();
      checkOllamaConnection();

      // Initialize LLM validation socket listeners
      const setupValidationSockets = async () => {
        // Wait briefly to ensure socket is connected
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Call the setupSocketListeners from the store, not from the function
        useOllamaValidationStore.getState().setupSocketListeners();
      };

      setupValidationSockets();
    }

    // Cleanup function
    return () => {
      setCurrentNamespace(null);
      // Clean up socket listeners
      useOllamaValidationStore.getState().cleanupSocketListeners();
    };
  }, [projectName]);

  // Select all languages by default when languages are loaded
  useEffect(() => {
    if (languages.length > 0 && baseLanguage) {
      // Select all languages by default instead of just the base language
      setSelectedLanguages([...languages]);

      // Fetch namespaces for the base language
      fetchNamespaces(projectName, baseLanguage);
    }
  }, [languages, baseLanguage]);

  // Select the first namespace when namespaces are loaded
  useEffect(() => {
    if (namespaces.length > 0 && !currentNamespace) {
      // Select the first namespace in the list
      setCurrentNamespace(namespaces[0]);
    }
  }, [namespaces]);

  // Fetch Ollama models when connected
  useEffect(() => {
    if (ollamaConnected) {
      fetchModels();
    }
  }, [ollamaConnected]);

  // Load translations when namespace is selected
  useEffect(() => {
    if (currentNamespace && selectedLanguages.length > 0) {
      fetchTranslations(projectName, selectedLanguages, currentNamespace);
    }
  }, [currentNamespace, selectedLanguages]);

  // Toggle a language selection
  const handleLanguageToggle = (language: string) => {
    setSelectedLanguages((prev) => {
      // Handle special 'selectAll' and 'deselectAll' actions
      if (language === "selectAll") {
        return [...languages]; // Select all languages
      }

      if (language === "deselectAll") {
        return baseLanguage ? [baseLanguage] : []; // Keep only base language
      }

      // Always keep at least the base language
      if (language === baseLanguage) {
        return prev;
      }

      // Toggle the language
      if (prev.includes(language)) {
        return prev.filter((lang) => lang !== language);
      } else {
        return [...prev, language];
      }
    });
  };

  // Handle namespace selection
  const handleNamespaceChange = (namespace: string) => {
    setCurrentNamespace(namespace);
  };

  // Handle translation error checking
  const handleCheckTranslationErrors = (namespace: string) => {
    validateNamespace(projectName, namespace, selectedLanguages);
  };

  // Handle LLM translation analysis
  const handleRunLLMAnalysis = (namespace: string) => {
    if (!selectedModel) {
      alert("Please select an Ollama model first");
      return;
    }

    // Default to base language (usually 'en') if available
    const sourceLang = baseLanguage || "en";
    // Pick the first non-base language as target
    const targetLang =
      selectedLanguages.find((lang) => lang !== sourceLang) ||
      (selectedLanguages.length > 0 ? selectedLanguages[0] : "");

    if (!targetLang) {
      alert("Please select at least one language for validation");
      return;
    }

    // Store the params and show progress modal
    setLlmValidationParams({
      sourceLang,
      targetLang,
      namespace,
    });
    setIsProgressModalOpen(true);

    // Run LLM validation
    validateNamespaceLLM(
      projectName,
      namespace,
      sourceLang,
      targetLang,
      selectedModel
    );
  };

  // Handle modal closes - reset appropriate state
  const handleValidationModalClose = () => {
    setIsValidationModalOpen(false);
    // Don't reset state immediately to avoid flickering if we're going to show LLM validation
    setTimeout(() => {
      if (!isLLMValidationModalOpen) {
        resetValidationState();
      }
    }, 500);
  };

  const handleLLMValidationModalClose = () => {
    setLLMValidationModalOpen(false);
    resetLLMValidationState();
  };

  const handleProgressModalClose = () => {
    setIsProgressModalOpen(false);
  };

  // Monitor progress for automatic modal transitions
  useEffect(() => {
    // When LLM validation completes and results are available, close progress modal
    if (
      isProgressModalOpen &&
      !llmValidationLoading &&
      llmValidationErrors.length > 0
    ) {
      setIsProgressModalOpen(false);
    }
  }, [isProgressModalOpen, llmValidationLoading, llmValidationErrors]);

  // Back to projects list
  const handleBackClick = () => {
    // Clear all state before navigating back
    setCurrentNamespace(null); // Clear namespace selection
    setSelectedLanguages([]); // Clear selected languages
    resetTranslations(); // Reset translation data including the current key

    // Navigate back to the projects list
    router.push("/");
  };

  // Determine loading state
  const isLoading =
    projectLoading ||
    languagesLoading ||
    namespacesLoading ||
    translationsLoading;

  // Determine if there's an error
  const error =
    projectError || languagesError || namespacesError || translationsError;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={handleBackClick}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center mr-4"
            >
              <span className="mr-1">←</span> Back
            </button>
            <div className="flex items-center">
              <h1 className="text-lg font-bold mr-2 text-gray-900 dark:text-white">
                {currentProject?.name || projectName}
              </h1>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {currentProject?.path}
              </span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center ml-4 space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Ollama connection status and model selection */}
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-1 ${
                  ollamaConnected ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className="text-xs text-gray-600 dark:text-gray-300 mr-2">
                {ollamaConnected ? "Ollama Connected" : "Ollama Disconnected"}
              </span>

              {ollamaConnected && (
                <select
                  id="model-select"
                  value={selectedModel || ""}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="select text-xs py-0.5 px-1 border border-gray-300 dark:border-gray-700 rounded"
                  title="Select Ollama model for translations"
                >
                  <option value="" disabled>
                    Select model
                  </option>
                  {models.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Languages Selector (moved from sidebar) */}
        <div className="card p-4 rounded-md bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center flex-wrap">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mr-2 mb-2">
              Languages:
            </span>
            <LanguageSelector
              languages={languages}
              baseLanguage={baseLanguage}
              selectedLanguages={selectedLanguages}
              onToggle={handleLanguageToggle}
              projectName={projectName}
              horizontal={true}
            />
          </div>
        </div>
      </div>

      {/* Error display */}
      {error && <ErrorDisplay error={error} />}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card h-full">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Namespaces
              </h2>
              <button
                onClick={() => setIsNamespaceModalOpen(true)}
                className="
                  p-1 rounded-md text-primary-700 hover:bg-gray-100 
                  dark:text-primary-400 dark:hover:bg-gray-800 transition-colors
                  flex items-center justify-center
                "
                title="Add new namespace"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </div>
            <NamespaceSelector
              namespaces={namespaces}
              selectedNamespace={currentNamespace}
              projectName={projectName}
              onChange={handleNamespaceChange}
              onNamespaceUpdated={() =>
                fetchNamespaces(projectName, baseLanguage)
              }
              onCheckErrors={handleCheckTranslationErrors}
              onRunLLMAnalysis={
                ollamaConnected ? handleRunLLMAnalysis : undefined
              }
            />
            {namespaces.length > 0 && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Total {namespaces.length} namespaces
              </div>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="card h-full">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {currentNamespace
                ? `Namespace: ${currentNamespace}`
                : "Select a namespace"}
            </h2>

            {isLoading && <LoadingSpinner message="Loading translations..." />}

            {!isLoading && currentNamespace && (
              <TranslationTable
                translations={flattenedTranslations}
                languages={selectedLanguages}
                baseLanguage={baseLanguage}
                projectName={projectName}
                namespace={currentNamespace}
              />
            )}

            {!isLoading && !currentNamespace && (
              <div className="text-center py-6 text-gray-500">
                Please select a namespace from the sidebar
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Namespace Modal */}
      <NamespaceModal
        isOpen={isNamespaceModalOpen}
        onClose={() => setIsNamespaceModalOpen(false)}
        projectName={projectName}
        onNamespaceAdded={handleNamespaceChange}
      />

      {/* Basic Translation Error Modal */}
      <TranslationErrorModal
        isOpen={isValidationModalOpen}
        onClose={handleValidationModalClose}
        namespace={namespaceForContextMenu || currentNamespace || ""}
        projectName={projectName}
        errors={validationErrors}
        loading={validationLoading}
      />

      {/* LLM-powered Translation Error Modal */}
      <TranslationErrorModal
        isOpen={isLLMValidationModalOpen}
        onClose={handleLLMValidationModalClose}
        namespace={namespaceForContextMenu || currentNamespace || ""}
        projectName={projectName}
        errors={llmValidationErrors}
        loading={llmValidationLoading}
        isLLMValidation={true}
        progress={llmValidationProgress}
      />

      {/* LLM Validation Progress Modal */}
      {llmValidationParams && (
        <LLMValidationProgressModal
          isOpen={isProgressModalOpen && llmValidationLoading}
          onClose={handleProgressModalClose}
          namespace={llmValidationParams.namespace}
          projectName={projectName}
          sourceLanguage={llmValidationParams.sourceLang}
          targetLanguage={llmValidationParams.targetLang}
          progress={llmValidationProgress}
        />
      )}
    </div>
  );
}
