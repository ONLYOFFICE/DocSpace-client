import React from "react";

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
}) => (
  <div
    className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 group \
      ${
        currentEntry.path === newlyCreatedKey
          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 outline outline-2 outline-green-400 dark:outline-green-600"
          : "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200"
      }`}
    ref={keyContainerRef}
  >
    <span
      className="truncate flex-1 pr-1 text-gray-800 dark:text-gray-200"
      onContextMenu={(e) => handleKeyContextMenu(e, currentEntry.path)}
    >
      Key: <strong>{currentEntry.path}</strong> (EN: {currentEntry.translations["en"] || ""})
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
);

export default TranslationTableKeyHeader;
