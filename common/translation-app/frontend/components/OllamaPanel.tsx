import React, { useEffect, useState } from "react";
import { useOllamaStore } from "@/store/ollamaStore";

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

interface OllamaPanelProps {
  projectName: string;
  baseLanguage: string;
  languages: string[];
  namespace: string | null;
  progress: TranslationProgress | null;
}

const OllamaPanel: React.FC<OllamaPanelProps> = ({
  projectName,
  baseLanguage,
  languages,
  namespace,
  progress,
}) => {
  const [targetLanguage, setTargetLanguage] = useState<string>("");

  const {
    models,
    selectedModel,
    isConnected,
    fetchModels,
    setSelectedModel,
    translateNamespace,
    loading,
    error,
    clearError,
  } = useOllamaStore();

  useEffect(() => {
    if (isConnected) {
      fetchModels();
    }
  }, [isConnected]);

  // Set default target language when languages change
  useEffect(() => {
    if (
      languages.length > 0 &&
      languages.some((lang) => lang !== baseLanguage)
    ) {
      const firstNonBase = languages.find((lang) => lang !== baseLanguage);
      if (firstNonBase) {
        setTargetLanguage(firstNonBase);
      }
    }
  }, [languages, baseLanguage]);

  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(event.target.value);
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTargetLanguage(event.target.value);
  };

  const handleTranslateAll = async () => {
    if (!namespace || !targetLanguage || !selectedModel) return;

    await translateNamespace(
      projectName,
      baseLanguage,
      targetLanguage,
      namespace
    );
  };

  // Get non-base languages for selection
  const targetLanguages = languages.filter((lang) => lang !== baseLanguage);

  // Calculate progress percentage
  const progressPercentage = progress
    ? Math.round((progress.progress / progress.total) * 100)
    : 0;

  return (
    <div>
      {!isConnected ? (
        <div className="text-yellow-600 dark:text-yellow-400 mb-4 text-sm">
          Ollama service is not connected. Make sure it's running at
          http://localhost:11434
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-2 rounded text-sm mb-4">
              {error}
              <button
                onClick={clearError}
                className="ml-2 text-xs font-medium hover:text-red-800 dark:hover:text-red-200"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="model-select"
                className="block text-sm font-medium mb-1"
              >
                Ollama Model
              </label>
              <select
                id="model-select"
                value={selectedModel || ""}
                onChange={handleModelChange}
                className="select text-sm"
                disabled={loading}
              >
                <option value="" disabled>
                  Select a model
                </option>
                {models.map((model) => (
                  <option key={model.name} value={model.name}>
                    {model.name}
                  </option>
                ))}
              </select>
              {models.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  No models available. Run 'ollama pull "any-model"' to download
                  models.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="language-select"
                className="block text-sm font-medium mb-1"
              >
                Target Language
              </label>
              <select
                id="language-select"
                value={targetLanguage}
                onChange={handleLanguageChange}
                className="select text-sm"
                disabled={loading || targetLanguages.length === 0}
              >
                <option value="" disabled>
                  Select language
                </option>
                {targetLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              {targetLanguages.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Add at least one non-base language to enable translation.
                </p>
              )}
            </div>

            <button
              onClick={handleTranslateAll}
              disabled={
                !namespace || !targetLanguage || !selectedModel || loading
              }
              className="btn btn-primary w-full"
            >
              {loading ? "Translating..." : "Translate All"}
            </button>

            {progress &&
              progress.projectName === projectName &&
              progress.namespace === namespace &&
              progress.targetLanguage === targetLanguage && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>
                      {progressPercentage}% ({progress.progress}/
                      {progress.total})
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {progress.currentKey && (
                    <div className="text-xs mt-1 text-gray-500 truncate">
                      Current: {progress.currentKey}
                    </div>
                  )}
                  {progress.isCompleted && !progress.error && (
                    <div className="text-xs mt-1 text-green-600 dark:text-green-400">
                      Translation completed successfully!
                    </div>
                  )}
                  {progress.error && (
                    <div className="text-xs mt-1 text-red-600 dark:text-red-400">
                      Error: {progress.error}
                    </div>
                  )}
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
};

export default OllamaPanel;
