"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast, Id } from "react-toastify";
import { useProjectStore } from "@/store/projectStore";
import { useLanguageStore } from "@/store/languageStore";
import { useNamespaceStore } from "@/store/namespaceStore";
import { useTranslationStore } from "@/store/translationStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { translateKey, translateNamespace } from "@/lib/api";
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

  // we need to keep a reference of the toastId to be able to update it
  const toastId = useRef<Id | null>(null);

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
    selectedLanguages,
    setSelectedLanguages,
    showUntranslated,
    setShowUntranslated,
  } = useLanguageStore();

  const {
    namespaces,
    setNamespaces,
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
      setNamespaces([]);
      // Clean up socket listeners
      useOllamaValidationStore.getState().cleanupSocketListeners();
    };
  }, [projectName]);

  // Select all languages by default when languages are loaded
  useEffect(() => {
    if (languages.length > 0 && baseLanguage) {
      // Select all languages by default instead of just the base language
      if (selectedLanguages.length === 0) {
        setSelectedLanguages([...languages]);
      }

      // Fetch namespaces for the base language
      fetchNamespaces(projectName, baseLanguage);
    }
  }, [languages, selectedLanguages, baseLanguage]);

  // Get URL parameters and manage state
  const [keyFromUrl, setKeyFromUrl] = useState<string | null>(null);
  const [namespaceFromUrl, setNamespaceFromUrl] = useState<string | null>(null);
  const previousKeyRef = useRef<string | null>(null);
  const ignoreUrlUpdatesRef = useRef<boolean>(false);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUrlUpdateTimeRef = useRef<number>(0);
  const lockUpdateRef = useRef<boolean>(false); // Complete lock on updates

  // Read URL parameters on component mount ONLY
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Lock updates during initialization
        lockUpdateRef.current = true;

        const url = new URL(window.location.href);
        const key = url.searchParams.get("key");
        const namespace = url.searchParams.get("namespace");

        console.log(
          `Initial URL parameters - namespace: ${namespace}, key: ${key}`
        );

        // Set initial URL values
        if (key) {
          previousKeyRef.current = key; // Remember this immediately
          setKeyFromUrl(key);
        }

        if (namespace) {
          setNamespaceFromUrl(namespace);
        }

        // Unlock updates after a delay to ensure initialization is complete
        setTimeout(() => {
          lockUpdateRef.current = false;
          console.log("URL parameter initialization complete");
        }, 500);
      } catch (error) {
        console.error("Error parsing URL:", error);
        lockUpdateRef.current = false; // Ensure lock is released even on error
      }
    }
  }, []);

  // Read URL parameters on component mount AND when URL changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Function to read params from URL
      const readUrlParams = () => {
        const url = new URL(window.location.href);
        const namespaceParam = url.searchParams.get("namespace");
        const keyParam = url.searchParams.get("key");

        // Only update state if not currently ignoring URL updates
        if (!ignoreUrlUpdatesRef.current && !lockUpdateRef.current) {
          setNamespaceFromUrl(namespaceParam);
          setKeyFromUrl(keyParam);
          console.log(
            `Read from URL - namespace: ${namespaceParam}, key: ${keyParam}`
          );
        }
      };

      // Read params initially
      readUrlParams();

      // Set up listener for popstate events (back/forward buttons)
      const handlePopState = () => {
        readUrlParams();
      };

      // Listen for URL changes via back/forward buttons
      window.addEventListener("popstate", handlePopState);

      // Clean up listener
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  // Select namespace from URL or first namespace when namespaces are loaded
  useEffect(() => {
    if (namespaces.length > 0 && !currentNamespace) {
      // If namespace from URL exists and is valid, select it
      if (namespaceFromUrl && namespaces.includes(namespaceFromUrl)) {
        setCurrentNamespace(namespaceFromUrl);
      } else {
        // Otherwise select the first namespace in the list
        setCurrentNamespace(namespaces[0]);
      }
    }
  }, [namespaces, namespaceFromUrl]);

  // Re-fetch namespaces when showUntranslated changes
  useEffect(() => {
    if (projectName && baseLanguage) {
      fetchNamespaces(projectName, baseLanguage, {
        untranslatedOnly: showUntranslated,
      });
    }
  }, [showUntranslated, projectName, baseLanguage]);

  // Fetch Ollama models when connected
  useEffect(() => {
    if (ollamaConnected) {
      fetchModels();
    }
  }, [ollamaConnected]);

  // Load translations when namespace is selected
  useEffect(() => {
    if (currentNamespace && selectedLanguages.length > 0 && !projectLoading) {
      // Use an async function to handle the loading and waiting
      const loadTranslations = async () => {
        return await fetchTranslations(
          projectName,
          selectedLanguages,
          currentNamespace
        );
      };

      loadTranslations().then((newTranslations) => {
        // Update URL with the selected namespace
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("namespace", currentNamespace);

        if (newTranslations.length > 0) {
          newUrl.searchParams.set("key", newTranslations[0].path);
        }

        window.history.pushState({}, "", newUrl.toString());
      });
    }
  }, [currentNamespace, selectedLanguages, projectName, projectLoading]);

  // Toggle a language selection
  const handleLanguageToggle = (language: string) => {
    if (!language) return;

    if (language === baseLanguage) {
      return;
    }

    let newSelection = [];

    if (language === "selectAll") {
      newSelection = [...languages];
    } else if (language === "deselectAll") {
      newSelection = [baseLanguage];
    } else {
      newSelection = selectedLanguages.includes(language)
        ? selectedLanguages.filter((lang) => lang !== language)
        : [...selectedLanguages, language];
    }

    setSelectedLanguages(newSelection);
  };

  // Handle namespace selection
  const handleNamespaceChange = (namespace: string) => {
    setCurrentNamespace(namespace);

    // Update URL with the selected namespace
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("namespace", namespace);

    window.history.pushState({}, "", newUrl.toString());
  };

  // Handle translation error checking
  const handleCheckTranslationErrors = (namespace: string) => {
    validateNamespace(projectName, namespace, selectedLanguages);
  };

  // Function to translate all untranslated keys in a namespace
  const handleTranslateUntranslated = async (namespace: string) => {
    if (!selectedModel) {
      toast.error("Please select an Ollama model first");
      return;
    }

    if (!ollamaConnected) {
      toast.error("Ollama is not connected");
      return;
    }

    try {
      // First, fetch all translations for this namespace
      const allTranslations = await fetchTranslations(
        projectName,
        [...selectedLanguages, baseLanguage],
        namespace
      );

      // Only keep non-base languages
      const targetLanguages = selectedLanguages.filter(
        (lang) => lang !== baseLanguage
      );
      if (targetLanguages.length === 0) {
        toast.info("No target languages selected for translation");
        return;
      }

      // Get keys that need translation (have content in base language but missing in at least one target language)
      const keysToTranslate = allTranslations.filter((entry) => {
        // Must have content in base language
        const hasBaseContent =
          entry.translations[baseLanguage] &&
          entry.translations[baseLanguage].trim() !== "";

        // Must be missing in at least one target language
        const hasUntranslatedTargets = targetLanguages.some(
          (lang) =>
            !entry.translations[lang] || entry.translations[lang].trim() === ""
        );

        return hasBaseContent && hasUntranslatedTargets;
      });

      if (keysToTranslate.length === 0) {
        toast.info("No untranslated keys found in this namespace");
        return;
      }

      // Start progress tracking
      const totalItems = keysToTranslate.length * targetLanguages.length;
      let completedItems = 0;

      // Start with initial toast
      toastId.current = toast.info(
        `Starting translation of ${keysToTranslate.length} keys in namespace ${namespace}...`,
        {
          autoClose: false,
          progress: 0,
        }
      );

      // Process each key that needs translation
      for (const entry of keysToTranslate) {
        const keyPath = entry.path;

        // For each target language
        for (const targetLang of targetLanguages) {
          // Skip if already translated
          if (
            entry.translations[targetLang] &&
            entry.translations[targetLang].trim() !== ""
          ) {
            completedItems++;
            continue;
          }

          try {
            // Update progress toast
            const progress = completedItems / totalItems;
            toast.update(toastId.current!, {
              render: `Translating key "${keyPath}" to ${targetLang}... (${Math.round(progress * 100)}%)`,
              progress: progress,
            });

            // Translate this specific key
            await translateKey(
              projectName,
              baseLanguage,
              targetLang,
              namespace,
              keyPath,
              selectedModel
            );

            completedItems++;
          } catch (error) {
            console.error(
              `Error translating key ${keyPath} to ${targetLang}:`,
              error
            );
            // Continue with other translations even if one fails
            toast.error(
              `Failed to translate key "${keyPath}" to ${targetLang}: ${(error as Error).message}`
            );
          }
        }
      }

      // Refresh translations to show the changes
      if (currentNamespace === namespace) {
        fetchTranslations(projectName, selectedLanguages, namespace);
      }

      // Complete the toast
      if (toastId.current) {
        toast.update(toastId.current, {
          render: `Completed translating ${keysToTranslate.length} keys in namespace ${namespace}`,
          type: "success",
          progress: 1,
          autoClose: 5000,
        });

        // Reset toast ID
        setTimeout(() => {
          toastId.current = null;
        }, 5000);
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error(
        `Failed to translate namespace ${namespace}: ${(error as Error).message}`
      );

      // Reset toast ID on error too
      if (toastId.current) {
        toast.update(toastId.current, {
          render: `Translation failed: ${(error as Error).message}`,
          type: "error",
          autoClose: 5000,
        });

        setTimeout(() => {
          toastId.current = null;
        }, 5000);
      }
    }
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
    // setSelectedLanguages([]); // Clear selected languages
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
              onToggle={handleLanguageToggle}
              projectName={projectName}
              horizontal={true}
              onShowUntranslatedChange={setShowUntranslated}
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
              baseLanguage={baseLanguage}
              onChange={handleNamespaceChange}
              onNamespaceUpdated={() =>
                fetchNamespaces(projectName, baseLanguage, {
                  untranslatedOnly: showUntranslated,
                })
              }
              onCheckErrors={handleCheckTranslationErrors}
              onRunLLMAnalysis={
                ollamaConnected ? handleRunLLMAnalysis : undefined
              }
              onTranslateUntranslated={
                ollamaConnected ? handleTranslateUntranslated : undefined
              }
              showUntranslated={showUntranslated}
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
          <div className="card h-full" style={{ minHeight: "748px" }}>
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
                showUntranslated={showUntranslated}
                initialSelectedKey={keyFromUrl}
                // SIMPLIFIED URL-ONLY KEY SELECTION HANDLER
                initialKeySelection={(keyPath) => {
                  // Just return the URL key parameter for initial load
                  return keyFromUrl;
                }}
                onKeySelect={(keyPath) => {
                  // Skip empty keys or during initialization
                  if (!keyPath /*|| lockUpdateRef.current*/) {
                    console.log(
                      `URL update skipped for: ${keyPath || "empty key"}`
                    );
                    return;
                  }

                  // Skip duplicates
                  if (keyPath === previousKeyRef.current) return;

                  // Create immutable copy and verify
                  const targetKey = String(keyPath);

                  previousKeyRef.current = targetKey;

                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    const prevKey = url.searchParams.get("key");
                    url.searchParams.set("key", targetKey);

                    if (currentNamespace) {
                      url.searchParams.set("namespace", currentNamespace);
                    }

                    window.history.replaceState(
                      { key: targetKey, namespace: currentNamespace },
                      "",
                      url.toString()
                    );

                    console.log(`URL updated: ${prevKey} → ${targetKey}`);
                  }

                  // Create atomic update with locking
                  // clearTimeout(urlUpdateTimeoutRef.current);
                  // urlUpdateTimeoutRef.current = setTimeout(() => {
                  //   if (lockUpdateRef.current) return;

                  //   try {
                  //     lockUpdateRef.current = true;
                  //     previousKeyRef.current = targetKey;

                  //     if (typeof window !== "undefined") {
                  //       const url = new URL(window.location.href);
                  //       const prevKey = url.searchParams.get("key");
                  //       url.searchParams.set("key", targetKey);

                  //       if (currentNamespace) {
                  //         url.searchParams.set("namespace", currentNamespace);
                  //       }

                  //       window.history.replaceState(
                  //         { key: targetKey, namespace: currentNamespace },
                  //         "",
                  //         url.toString()
                  //       );

                  //       console.log(`URL updated: ${prevKey} → ${targetKey}`);
                  //     }

                  //     setTimeout(() => (lockUpdateRef.current = false), 300);
                  //   } catch (e) {
                  //     console.error(`URL update error: ${e}`);
                  //     lockUpdateRef.current = false;
                  //   }
                  // }, 100);
                }}
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
