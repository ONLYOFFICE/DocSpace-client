import React, { useState, useEffect } from "react";
import TranslationTableCell from "./TranslationTableCell";
import * as api from "../lib/api";

interface TranslationTableRowProps {
  currentEntry: any;
  languages: string[];
  baseLanguage: string;
  editingCell: { rowPath: string; language: string } | null;
  editValue: string;
  setEditValue: (v: string) => void;
  handleEditStart: (rowPath: string, lang: string, value: string) => void;
  handleEditSave: () => void;
  handleEditCancel: () => void;
  translating: boolean;
  savingTranslation: boolean;
  handleTranslate: (rowPath: string, lang: string) => void;
  isTranslating: (rowPath: string, lang: string) => boolean;
  ollamaConnected: boolean;
  metadata?: any;
}

const TranslationTableRow: React.FC<TranslationTableRowProps> = ({
  currentEntry,
  languages,
  baseLanguage,
  editingCell,
  editValue,
  setEditValue,
  handleEditStart,
  handleEditSave,
  handleEditCancel,
  translating,
  savingTranslation,
  handleTranslate,
  isTranslating,
  ollamaConnected,
  metadata: propMetadata, // Rename to avoid conflict with local state
}) => {
  // Local state for metadata
  const [metadata, setMetadata] = useState<any>(propMetadata);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [approvingLanguages, setApprovingLanguages] = useState<
    Record<string, boolean>
  >({});

  // Handle metadata changes from child components
  const handleMetadataChange = (newMetadata: any) => {
    setMetadata(newMetadata);
  };

  // Check if a language translation is approved
  const isApproved = (language: string): boolean => {
    return !!metadata?.languages?.[language]?.approved_at;
  };

  // Check if a language is currently being approved/unapproved
  const isApprovingLanguage = (language: string): boolean => {
    return approvingLanguages[language] === true;
  };

  // Handle approval toggle for a language
  const handleApprovalToggle = async (language: string) => {
    if (!currentEntry?.path || isApprovingLanguage(language)) return;

    try {
      // Set the language as being approved
      setApprovingLanguages((prev) => ({ ...prev, [language]: true }));

      // Call the API to toggle approval status
      const response = await api.approveTranslation(
        currentEntry.path,
        language,
        !isApproved(language)
      );

      // Update only the specific language's approval status in the metadata
      if (response.data && response.data.success) {
        const newMeta = response.data.data;
        setMetadata(newMeta);
      }
    } catch (error) {
      console.error("Error toggling approval status:", error);
    } finally {
      // Clear the approving state
      setApprovingLanguages((prev) => ({ ...prev, [language]: false }));
    }
  };

  // Load metadata for the current entry
  useEffect(() => {
    if (currentEntry?.path && !propMetadata) {
      const loadMetadata = async () => {
        setIsLoadingMetadata(true);
        try {
          const response = await api.getKeyUsage(currentEntry.path);
          setMetadata(response);
        } catch (error) {
          console.error("Error loading metadata:", error);
        } finally {
          setIsLoadingMetadata(false);
        }
      };

      loadMetadata();
    } else if (propMetadata) {
      // Use prop metadata if available
      setMetadata(propMetadata);
    }
  }, [currentEntry?.path, propMetadata]);
  return (
    <tbody>
      {languages.map((lang) => (
        <tr
          key={`${currentEntry?.path}-${lang}`}
          className="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td className="px-2 py-2 border-b dark:border-gray-800 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {/* Approval checkbox */}

              <div
                className="flex items-center ml-2"
                title={isApproved(lang) ? "Approved" : "Not approved"}
              >
                {isLoadingMetadata || isApprovingLanguage(lang) ? (
                  <span>
                    <svg
                      className="animate-spin h-4 w-4 text-primary-500"
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
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={
                      currentEntry?.translations[lang] && isApproved(lang)
                    }
                    onChange={() => handleApprovalToggle(lang)}
                    disabled={!currentEntry?.translations[lang]}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  />
                )}
              </div>
              <span
                className={`inline-block px-1.5 py-0.5 rounded ${lang === baseLanguage ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 font-medium" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
              >
                {lang}
                {lang === baseLanguage && "*"}
              </span>
            </div>
          </td>
          <TranslationTableCell
            currentEntry={currentEntry}
            lang={lang}
            editingCell={editingCell}
            editValue={editValue}
            setEditValue={setEditValue}
            handleEditStart={isApproved(lang) ? () => {} : handleEditStart}
            handleEditSave={handleEditSave}
            handleEditCancel={handleEditCancel}
            translating={translating}
            savingTranslation={savingTranslation}
            handleTranslate={handleTranslate}
            isTranslating={isTranslating}
            ollamaConnected={ollamaConnected}
            metadata={metadata}
            isLoadingMetadata={isLoadingMetadata}
            onMetadataChange={handleMetadataChange}
          />
        </tr>
      ))}
    </tbody>
  );
};

export default TranslationTableRow;
