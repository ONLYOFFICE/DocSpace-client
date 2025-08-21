import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { getLanguageName } from "@/utils/languageUtils";
import { useOllamaStore } from "@/store/ollamaStore";
import { useOllamaValidationStore, LLMValidationError } from "@/store/ollamaValidationStore";

interface ValidationError {
  key: string;
  language: string;
  message: string;
  severity: "error" | "warning";
  suggestions?: string[];
  rating?: number;
}

interface TranslationErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  projectName: string;
  errors: ValidationError[];
  loading: boolean;
  isLLMValidation?: boolean;
  progress?: {
    current: number;
    total: number;
    currentKey?: string;
  };
}

const TranslationErrorModal: React.FC<TranslationErrorModalProps> = ({
  isOpen,
  onClose,
  namespace,
  projectName,
  errors,
  loading,
  isLLMValidation = false,
  progress = { current: 0, total: 0 },
}) => {
  const { isConnected: ollamaConnected, selectedModel } = useOllamaStore();
  const { validateNamespaceLLM, loading: llmLoading } = useOllamaValidationStore();
  const [useLLM, setUseLLM] = useState<boolean>(isLLMValidation);
  const [baseLanguage, setBaseLanguage] = useState<string>("en");
  const [targetLanguage, setTargetLanguage] = useState<string>("");
  const [errorsByLanguage, setErrorsByLanguage] = useState<{
    [language: string]: ValidationError[];
  }>({});

  // Group errors by language
  useEffect(() => {
    const grouped = errors.reduce(
      (acc, error) => {
        if (!acc[error.language]) {
          acc[error.language] = [];
        }
        acc[error.language].push(error);
        return acc;
      },
      {} as { [language: string]: ValidationError[] }
    );
    setErrorsByLanguage(grouped);
    
    // Set most common target language for LLM validation
    if (errors.length > 0) {
      const languages = errors.map(e => e.language).filter(l => l !== "all" && l !== baseLanguage);
      if (languages.length > 0) {
        const counts = languages.reduce((acc, lang) => {
          acc[lang] = (acc[lang] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommon = Object.entries(counts).reduce(
          (max, [lang, count]) => (count > max[1] ? [lang, count] : max),
          ["", 0]
        )[0];
        
        if (mostCommon) setTargetLanguage(mostCommon);
      }
    }
  }, [errors, baseLanguage]);



  // Save errors to file
  const handleSaveToFile = () => {
    // Prepare errors in a readable format
    const errorsText = Object.entries(errorsByLanguage)
      .map(([language, languageErrors]) => {
        const languageName = getLanguageName(language);
        const errorsFormatted = languageErrors
          .map((err) => `  - ${err.key}: ${err.message} [${err.severity}]`)
          .join("\n");

        return `Language: ${languageName} (${language})\n${errorsFormatted}`;
      })
      .join("\n\n");

    const fullReport = `Translation Validation Report
Project: ${projectName}
Namespace: ${namespace}
Date: ${new Date().toLocaleString()}
Total Issues: ${errors.length}

${errorsText}`;

    // Create a Blob and download it
    const blob = new Blob([fullReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName}-${namespace}-validation-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // Calculate error and warning counts
  const errorCount = errors.filter((e) => e.severity === "error").length;
  const warningCount = errors.filter((e) => e.severity === "warning").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Translation Validation Results">
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">
              {namespace}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {projectName}
            </p>
          </div>

          {/* Summary */}
          <div className="flex items-center space-x-3">
            {errorCount > 0 && (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded dark:bg-red-900 dark:text-red-200">
                {errorCount} {errorCount === 1 ? "Error" : "Errors"}
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded dark:bg-yellow-900 dark:text-yellow-200">
                {warningCount} {warningCount === 1 ? "Warning" : "Warnings"}
              </span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            {isLLMValidation && progress && progress.total > 0 && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs mb-1">
                  <span>Analyzing translations with LLM...</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                  ></div>
                </div>
                {progress.currentKey && (
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    Current key: {progress.currentKey}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : errors.length === 0 ? (
          <div className="text-center py-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-green-500 dark:text-green-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              No issues found
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All translations in this namespace look good!
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(errorsByLanguage).map(([language, errors]) => (
              <div key={language} className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <span className="mr-2">
                    {getLanguageName(language)} ({language})
                  </span>
                  <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-800 rounded dark:bg-gray-700 dark:text-gray-200">
                    {errors.length} {errors.length === 1 ? "issue" : "issues"}
                  </span>
                </div>

                {errors.map((error, idx) => (
                  <div
                    key={`${language}-${error.key}-${idx}`}
                    className={`p-3 rounded-md mb-2 text-sm ${
                      error.severity === "error"
                        ? "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                        : "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`mt-0.5 mr-2 flex-shrink-0 w-4 h-4 ${
                          error.severity === "error"
                            ? "text-red-500 dark:text-red-400"
                            : "text-yellow-500 dark:text-yellow-400"
                        }`}
                      >
                        {error.severity === "error" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="w-full">
                        <div className="font-medium">{error.key}</div>
                        <div className="opacity-80">{error.message}</div>
                        
                        {error.suggestions && error.suggestions.length > 0 && (
                          <div className="mt-2 text-sm">
                            <p className="text-xs opacity-80 mb-1">Suggestions:</p>
                            <ul className="list-disc list-inside pl-2 space-y-1">
                              {error.suggestions.map((suggestion, i) => (
                                <li key={i} className="opacity-90">{suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {error.rating !== undefined && (
                          <div className="mt-2 flex items-center">
                            <span className="text-xs opacity-80 mr-2">Quality rating:</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`text-sm ${star <= error.rating! ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">          
          <div className="flex justify-between">
            <button
              onClick={handleSaveToFile}
              disabled={errors.length === 0 || loading}
              className={`btn btn-outline-primary text-sm py-1 ${
                errors.length === 0 || loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Save Report to File
            </button>
            <button
              onClick={onClose}
              className="btn btn-primary text-sm py-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TranslationErrorModal;
