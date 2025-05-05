import React from "react";

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
}) => {
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
          {lang !== "en" && ollamaConnected && (
            <button
              onClick={() => handleTranslate(currentEntry?.path, lang)}
              disabled={translating || isTranslating(currentEntry?.path, lang)}
              className="ml-2 text-xs btn btn-secondary py-0 px-2"
              title="Translate using Ollama"
            >
              {isTranslating(currentEntry?.path, lang)
                ? "Translating..."
                : "AI"}
            </button>
          )}
        </div>
      )}
    </td>
  );
};

export default TranslationTableCell;
