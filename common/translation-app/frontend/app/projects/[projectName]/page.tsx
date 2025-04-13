"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";
import { useLanguageStore } from "@/store/languageStore";
import { useNamespaceStore } from "@/store/namespaceStore";
import { useTranslationStore } from "@/store/translationStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { initSocket, getSocket } from "@/lib/socket";

import LanguageSelector from "@/components/LanguageSelector";
import NamespaceSelector from "@/components/NamespaceSelector";
import TranslationTable from "@/components/TranslationTable";
import OllamaPanel from "@/components/OllamaPanel";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorDisplay from "@/components/ErrorDisplay";
import NamespaceModal from "@/components/NamespaceModal";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectName = params.projectName as string;

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [isNamespaceModalOpen, setIsNamespaceModalOpen] =
    useState<boolean>(false);

  // Stores
  const {
    currentProject,
    fetchProject,
    loading: projectLoading,
    error: projectError,
  } = useProjectStore();

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
    loading: translationsLoading,
    error: translationsError,
  } = useTranslationStore();

  const {
    setupSocketListeners,
    checkConnection: checkOllamaConnection,
    isConnected: ollamaConnected,
    translationProgress,
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
    }

    // Cleanup function
    return () => {
      setCurrentNamespace(null);
    };
  }, [projectName]);

  // Select base language when languages are loaded
  useEffect(() => {
    if (languages.length > 0 && baseLanguage) {
      setSelectedLanguages([baseLanguage]);

      // Fetch namespaces for the base language
      fetchNamespaces(projectName, baseLanguage);
    }
  }, [languages, baseLanguage]);

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

  // Back to projects list
  const handleBackClick = () => {
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
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={handleBackClick}
              className="mb-2 text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              <span className="mr-1">←</span> Back to Projects
            </button>
            <h1 className="text-2xl font-bold">
              {currentProject?.name || projectName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {currentProject?.path}
            </p>
          </div>

          {/* Ollama connection status */}
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                ollamaConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              Ollama: {ollamaConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Languages Selector (moved from sidebar) */}
        <div className="card p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm">
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Namespaces</h2>
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
              onChange={handleNamespaceChange}
            />
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Translation</h2>
            <OllamaPanel
              projectName={projectName}
              baseLanguage={baseLanguage}
              languages={languages}
              namespace={currentNamespace}
              progress={translationProgress}
            />
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">
              {currentNamespace
                ? `Translations: ${currentNamespace}`
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
    </div>
  );
}
