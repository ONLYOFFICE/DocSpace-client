import React from "react";

interface NamespaceContextMenuProps {
  namespace: string;
  x: number;
  y: number;
  onClose: () => void;
  onRename: (namespace: string) => void;
  onMove: (namespace: string) => void;
  onDelete: (namespace: string) => void;
  onCreateKey: (namespace: string) => void;
  onCheckErrors: (namespace: string) => void;
  onRunLLMAnalysis?: (namespace: string) => void;
  onTranslateUntranslated?: (namespace: string) => void;
  refreshTranslations?: () => void;
}

const NamespaceContextMenu: React.FC<NamespaceContextMenuProps> = ({
  namespace,
  x,
  y,
  onClose,
  onRename,
  onMove,
  onDelete,
  onCreateKey,
  onCheckErrors,
  onRunLLMAnalysis,
  onTranslateUntranslated,
  refreshTranslations,
}) => {
  // Close menu when clicking anywhere else
  React.useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-[180px] text-gray-800 dark:text-gray-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
        {namespace}
      </div>

      <button
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onCreateKey(namespace);
          onClose();
          // Refresh translations table after creating a new key
          if (refreshTranslations) {
            refreshTranslations();
          }
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2 text-green-500 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <span className="text-gray-900 dark:text-gray-200 font-medium">
          Create Key
        </span>
      </button>

      <button
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onRename(namespace);
          onClose();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
        <span className="text-gray-900 dark:text-gray-200 font-medium">
          Rename
        </span>
      </button>

      <button
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onMove(namespace);
          onClose();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
        <span className="text-gray-900 dark:text-gray-200 font-medium">
          Move To
        </span>
      </button>

      <button
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onCheckErrors(namespace);
          onClose();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2 text-blue-500 dark:text-blue-400"
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
        <span className="text-gray-900 dark:text-gray-200 font-medium">
          Check Translations
        </span>
      </button>

      {onRunLLMAnalysis && (
        <button
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          onClick={() => {
            onRunLLMAnalysis(namespace);
            onClose();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span className="text-gray-900 dark:text-gray-200 font-medium">
            LLM Translation Analysis
          </span>
        </button>
      )}

      {onTranslateUntranslated && (
        <button
          className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
          onClick={() => {
            onTranslateUntranslated(namespace);
            onClose();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-yellow-500 dark:text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
            />
          </svg>
          <span className="text-gray-900 dark:text-gray-200 font-medium">
            Translate Untranslated Keys
          </span>
        </button>
      )}

      <button
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onDelete(namespace);
          onClose();
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-2 text-red-500 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="text-red-600 dark:text-red-400 font-medium">
          Delete
        </span>
      </button>
    </div>
  );
};

export default NamespaceContextMenu;
