import React from "react";
import TranslationTableCell from "./TranslationTableCell";

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
}) => {
  return (
    <tbody>
      {languages.map((lang) => (
        <tr
          key={`${currentEntry?.path}-${lang}`}
          className="hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <td className="px-2 py-2 border-b dark:border-gray-800 whitespace-nowrap">
            <span
              className={`inline-block px-1.5 py-0.5 rounded ${lang === baseLanguage ? "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 font-medium" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}
            >
              {lang}
              {lang === baseLanguage && "*"}
            </span>
          </td>
          <TranslationTableCell
            currentEntry={currentEntry}
            lang={lang}
            editingCell={editingCell}
            editValue={editValue}
            setEditValue={setEditValue}
            handleEditStart={handleEditStart}
            handleEditSave={handleEditSave}
            handleEditCancel={handleEditCancel}
            translating={translating}
            savingTranslation={savingTranslation}
            handleTranslate={handleTranslate}
            isTranslating={isTranslating}
            ollamaConnected={ollamaConnected}
          />
        </tr>
      ))}
    </tbody>
  );
};

export default TranslationTableRow;
