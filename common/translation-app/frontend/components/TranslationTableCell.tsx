import React, { useState } from "react";
import Modal from "./Modal";
import * as api from "../lib/api";

interface SpellCheckIssue {
  type: string;
  description: string;
  suggestion: string;
}

interface TranslationTableCellProps {
  currentEntry: any;
  lang: string;
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
  isLoadingMetadata?: boolean;
  onMetadataChange?: (metadata: any) => void;
}

const TranslationTableCell: React.FC<TranslationTableCellProps> = ({
  currentEntry,
  lang,
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
  metadata,
}) => {
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  // Check if there are spell check issues for this language
  const hasSpellCheckIssues =
    metadata?.languages?.[lang]?.ai_spell_check_issues?.length > 0;
  const spellCheckIssues =
    metadata?.languages?.[lang]?.ai_spell_check_issues || [];

  // Check if a language translation is approved
  const isApproved = (language: string): boolean => {
    return !!metadata?.languages?.[language]?.approved_at;
  };

  return (
    <td className="px-3 py-2 border-b dark:border-gray-800">
      {editingCell?.rowPath === currentEntry?.path &&
      editingCell?.language === lang ? (
        <div className="flex">
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="input min-h-[60px] flex-1 mr-2"
            autoFocus
          />
          <div className="flex flex-col space-y-1">
            <button
              onClick={handleEditSave}
              disabled={savingTranslation}
              className="btn btn-primary text-xs py-1"
            >
              {savingTranslation ? "..." : "Save"}
            </button>
            <button
              onClick={handleEditCancel}
              className="btn btn-secondary text-xs py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="group flex items-start">
          <div className="flex items-start flex-1">
            <div
              className={`flex-1 break-words ${!currentEntry?.translations[lang] ? "text-gray-400 dark:text-gray-500 italic" : "text-gray-800 dark:text-gray-200"}`}
              onClick={() =>
                handleEditStart(
                  currentEntry?.path,
                  lang,
                  currentEntry?.translations[lang] || ""
                )
              }
            >
              {currentEntry?.translations[lang] || "Not translated"}
            </div>
            {hasSpellCheckIssues && !isApproved(lang) && (
              <button
                onClick={() => setIsIssueDialogOpen(true)}
                className="ml-1 text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
                title="Translation has potential issues"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
          {lang !== "en" && (
            <div className="flex space-x-1 items-center">
              {ollamaConnected &&
                (!currentEntry?.translations[lang] || !isApproved(lang)) && (
                  <button
                    onClick={() => handleTranslate(currentEntry?.path, lang)}
                    disabled={
                      translating || isTranslating(currentEntry?.path, lang)
                    }
                    className="ml-2 text-xs btn btn-secondary py-0 px-2"
                    title="Translate using Ollama"
                  >
                    {isTranslating(currentEntry?.path, lang)
                      ? "Translating..."
                      : "AI"}
                  </button>
                )}
              {currentEntry?.translations[lang] && (
                <button
                  onClick={() => {
                    const sourceText = currentEntry?.translations[lang] || "";
                    const url = `https://translate.google.com/?sl=auto&tl=en&text=${encodeURIComponent(sourceText)}`;
                    window.open(url, "_blank");
                  }}
                  className="text-xs btn btn-secondary py-0 px-2"
                  title="Open in Google Translate"
                >
                  <img
                    src="/GT_logo.svg"
                    alt="Google Translate"
                    width="16"
                    height="16"
                    style={{ verticalAlign: "middle" }}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal for displaying spell check issues */}
      <Modal
        isOpen={isIssueDialogOpen}
        onClose={() => setIsIssueDialogOpen(false)}
        title="Translation Issues"
      >
        <div className="max-h-96 overflow-y-auto">
          {spellCheckIssues.map((issue: SpellCheckIssue, index: number) => (
            <div
              key={index}
              className="mb-4 p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 rounded"
            >
              <div className="font-medium text-amber-800 dark:text-amber-300 mb-1">
                {issue.type
                  .replace(/_/g, " ")
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </div>
              <div className="text-gray-700 dark:text-gray-300 mb-2">
                {issue.description}
              </div>
              {issue.suggestion && (
                <div className="text-gray-600 dark:text-gray-400 text-sm">
                  <span className="font-medium">Suggestion:</span>{" "}
                  {issue.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsIssueDialogOpen(false)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>
      </Modal>
    </td>
  );
};

export default TranslationTableCell;
