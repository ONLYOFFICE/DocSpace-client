import React, { useState } from "react";
import TranslationKeyInfo from "./TranslationKeyInfo";

interface TranslationTableKeyHeaderProps {
  currentEntry: any;
  newlyCreatedKey: string | null;
  baseLanguage: string;
  languages: string[];
  ollamaConnected: boolean;
  handleTranslateToAllLanguages: (keyPath: string) => void;
  translating: boolean;
  handleKeyContextMenu: (e: React.MouseEvent, keyPath: string) => void;
  keyContainerRef: React.RefObject<HTMLDivElement>;
  projectName: string;
  namespace: string;
}

const TranslationTableKeyHeader: React.FC<TranslationTableKeyHeaderProps> = ({
  currentEntry,
  newlyCreatedKey,
  baseLanguage,
  languages,
  ollamaConnected,
  handleTranslateToAllLanguages,
  translating,
  handleKeyContextMenu,
  keyContainerRef,
  projectName,
  namespace,
}) => {
  const [showKeyInfo, setShowKeyInfo] = useState(false);

  return (
    <div className="mb-3">
      <div
        className={`p-2 rounded cursor-pointer group \
        ${
          currentEntry && currentEntry.path === newlyCreatedKey
            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 outline outline-2 outline-green-400 dark:outline-green-600"
            : "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200"
        }`}
        ref={keyContainerRef}
      >
        <div className="flex items-center flex-1">
          <button
            onClick={() => setShowKeyInfo(!showKeyInfo)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mr-1"
            title={showKeyInfo ? "Hide key usage info" : "Show key usage info"}
          >
            {showKeyInfo ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            )}
          </button>
          <span
            className="truncate flex-1 pr-1 text-gray-800 dark:text-gray-200"
            onContextMenu={(e) => handleKeyContextMenu(e, currentEntry.path)}
          >
            Key: <strong>{currentEntry?.path}</strong> (EN:{" "}
            {currentEntry?.translations["en"] || ""})
          </span>
          {ollamaConnected &&
            languages.filter((lang) => lang !== baseLanguage).length > 0 && (
              <button
                onClick={() => handleTranslateToAllLanguages(currentEntry.path)}
                disabled={translating}
                className="mr-2 text-xs py-1 px-2 btn btn-secondary"
                title="Translate this key to all languages"
              >
                {translating ? "Translating..." : "Translate All"}
              </button>
            )}
          <button
            className="opacity-30 dark:opacity-50 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
            onClick={(e) => handleKeyContextMenu(e, currentEntry.path)}
            title="Key options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Key usage information panel */}
      {showKeyInfo && (
        <div className="mt-1 mb-2 pl-7 pr-2 border-l-2 border-gray-200 dark:border-gray-700">
          <TranslationKeyInfo
            translationKey={currentEntry?.path}
            namespace={namespace}
            projectName={projectName}
          />
        </div>
      )}
    </div>
  );
};

export default TranslationTableKeyHeader;
