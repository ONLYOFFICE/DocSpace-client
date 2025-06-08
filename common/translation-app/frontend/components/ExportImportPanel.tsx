"use client";

import { useState, useRef } from "react";
import {
  exportUntranslatedKeys,
  importTranslatedKeys,
  getLanguages,
} from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface ExportImportPanelProps {
  projects: any[];
}

export default function ExportImportPanel({
  projects,
}: ExportImportPanelProps) {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When project changes, fetch available languages
  const handleProjectChange = async (projectName: string) => {
    setSelectedProject(projectName);
    setSelectedLanguage("");
    setLanguages([]);

    if (!projectName) return;

    try {
      setIsLoading(true);

      // Fetch languages directly from the API
      const response = await getLanguages(projectName);

      if (response.data.success) {
        // Extract languages from the nested structure
        const availableLanguages = response.data.data?.languages || [];
        console.log("Available languages:", availableLanguages);

        if (availableLanguages.length === 0) {
          setImportResult({
            success: false,
            message: "No languages found for the selected project",
          });
          return;
        }

        setLanguages(availableLanguages);
      } else {
        setImportResult({
          success: false,
          message: response.data.error || "Failed to fetch languages",
        });
      }
    } catch (error) {
      console.error("Error fetching languages:", error);
      setImportResult({
        success: false,
        message: "Failed to fetch languages for the selected project",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export button click
  const handleExport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedProject || !selectedLanguage) return;

    const baseLanguage = "en";

    // Make sure target and base languages are different
    if (selectedLanguage === baseLanguage) {
      setImportResult({
        success: false,
        message: "Target language and base language must be different",
      });
      return;
    }

    exportUntranslatedKeys(
      selectedProject,
      selectedLanguage,
      baseLanguage,
      e.currentTarget.id === "export-all-keys-button"
    );
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setImportResult(null);

      // Read the file content
      const fileContent = await readFileAsJson(file);

      // Validate file structure
      if (!fileContent || !fileContent.untranslatedKeys) {
        throw new Error(
          "Invalid file format. The file must contain untranslatedKeys object."
        );
      }

      // Send to API
      const response = await importTranslatedKeys(fileContent);

      // Show result
      if (response.data.success) {
        setImportResult({
          success: true,
          message: response.data.message,
          details: response.data.details,
        });
      } else {
        throw new Error(response.data.error || "Failed to import translations");
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error importing translations:", error);
      setImportResult({
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to import translations",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to read file as JSON
  const readFileAsJson = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          resolve(json);
        } catch (error) {
          reject(new Error("Invalid JSON file"));
        }
      };

      reader.onerror = () => reject(new Error("Error reading file"));

      reader.readAsText(file);
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left flex items-center justify-between text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
          <h2 className="text-xl font-semibold">Export/Import Translations</h2>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {/* Project Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Select Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.name} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Target Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  disabled={!selectedProject || isLoading}
                >
                  <option value="">Select a language</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <div className="flex gap-2 pt-2">
                <button
                  id="export-untranslated-keys-button"
                  onClick={handleExport}
                  disabled={!selectedProject || !selectedLanguage || isLoading}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                    !selectedProject || !selectedLanguage || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-primary-600 hover:bg-primary-700"
                  } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin inline-block h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline-block mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download Untranslated Keys
                    </>
                  )}
                </button>
                <button
                  id="export-all-keys-button"
                  onClick={handleExport}
                  disabled={!selectedProject || !selectedLanguage || isLoading}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                    !selectedProject || !selectedLanguage || isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  } transition-colors`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin inline-block h-4 w-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 inline-block mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Download All Keys
                    </>
                  )}
                </button>
              </div>

              {/* Import Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-3 text-gray-800 dark:text-gray-200">
                  Import Translated Keys
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Translated File
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".json"
                      disabled={isLoading}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-600 dark:file:text-gray-200"
                    />
                  </div>

                  {/* Import Result */}
                  {importResult && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        importResult.success
                          ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      <div className="font-medium">{importResult.message}</div>
                      {importResult.success && importResult.details && (
                        <div className="mt-2 text-sm">
                          <p>
                            Updated {importResult.details.updated} translations
                          </p>
                          {importResult.details.namespaces.length > 0 && (
                            <p>
                              Updated namespaces:{" "}
                              {importResult.details.namespaces.join(", ")}
                            </p>
                          )}
                          {importResult.details.errors.length > 0 && (
                            <div className="mt-1">
                              <p>Errors:</p>
                              <ul className="list-disc list-inside">
                                {importResult.details.errors.map(
                                  (error: string, index: number) => (
                                    <li key={index}>{error}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
