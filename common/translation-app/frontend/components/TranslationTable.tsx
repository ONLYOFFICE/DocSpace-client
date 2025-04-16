import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslationStore } from "@/store/translationStore";
import { useOllamaStore } from "@/store/ollamaStore";
import { getSocket } from "@/lib/socket";
import KeyContextMenu from "./KeyContextMenu";
import RenameKeyModal from "./RenameKeyModal";
import MoveKeyModal from "./MoveKeyModal";
import DeleteKeyModal from "./DeleteKeyModal";
import FigmaReferenceModal from "./FigmaReferenceModal";
import Modal from "./Modal";
import TranslationTableRow from "./TranslationTableRow";
import TranslationTableCell from "./TranslationTableCell";
import TranslationTablePagination from "./TranslationTablePagination";
import TranslationTableKeyHeader from "./TranslationTableKeyHeader";

interface TranslationEntry {
  key: string;
  path: string;
  translations: {
    [language: string]: string;
  };
}

interface TranslationTableProps {
  translations: TranslationEntry[];
  languages: string[];
  baseLanguage: string;
  projectName: string;
  namespace: string;
}

const TranslationTable: React.FC<TranslationTableProps> = ({
  translations,
  languages,
  baseLanguage,
  projectName,
  namespace,
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowPath: string;
    language: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);

  const {
    updateTranslation,
    loading: savingTranslation,
    newlyCreatedKey,
  } = useTranslationStore();
  const {
    translateKey,
    isConnected: ollamaConnected,
    loading: translating,
    translationProgress,
  } = useOllamaStore();

  // State for tracking locally updated translations by AI
  const [localUpdates, setLocalUpdates] = useState<
    Record<string, Record<string, string>>
  >({});

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    keyPath: string;
    x: number;
    y: number;
  } | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isFigmaModalOpen, setIsFigmaModalOpen] = useState<boolean>(false);
  const [activeKeyPath, setActiveKeyPath] = useState<string>("");
  const [activeTranslationValue, setActiveTranslationValue] = useState<string>("");

  // Ref for the key container
  const keyContainerRef = useRef<HTMLDivElement>(null);

  const handleEditStart = (
    rowPath: string,
    language: string,
    value: string
  ) => {
    setEditingCell({ rowPath, language });
    setEditValue(value);
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleEditSave = async () => {
    if (!editingCell) return;

    const { rowPath, language } = editingCell;
    const success = await updateTranslation(
      projectName,
      language,
      namespace,
      rowPath,
      editValue
    );

    if (success) {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const handleTranslate = async (rowPath: string, targetLanguage: string) => {
    if (!ollamaConnected) return;

    await translateKey(
      projectName,
      baseLanguage,
      targetLanguage,
      namespace,
      rowPath
    );
  };

  // Selected target language for single-language translations
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<string>("");

  // Set default target language when languages change
  useEffect(() => {
    if (
      languages.length > 0 &&
      languages.some((lang) => lang !== baseLanguage)
    ) {
      const nonBaseLanguages = languages.filter(
        (lang) => lang !== baseLanguage
      );
      if (nonBaseLanguages.length > 0) {
        setSelectedTargetLanguage(nonBaseLanguages[0]);
      }
    }
  }, [languages, baseLanguage]);

  // Handler to translate the current key to all available languages
  const handleTranslateToAllLanguages = async (rowPath: string) => {
    if (!ollamaConnected) return;

    // Get all target languages (exclude base language)
    const targetLanguages = languages.filter((lang) => lang !== baseLanguage);

    if (targetLanguages.length === 0) return;

    // Translate sequentially to all target languages
    for (const lang of targetLanguages) {
      await translateKey(projectName, baseLanguage, lang, namespace, rowPath);
    }
  };

  // Handle translate to selected target language
  const handleTranslateToSelectedLanguage = async (rowPath: string) => {
    if (!ollamaConnected || !selectedTargetLanguage) return;

    await translateKey(
      projectName,
      baseLanguage,
      selectedTargetLanguage,
      namespace,
      rowPath
    );
  };

  const isTranslating = (rowPath: string, language: string) => {
    if (!translationProgress) return false;

    return (
      translationProgress.projectName === projectName &&
      translationProgress.namespace === namespace &&
      translationProgress.targetLanguage === language &&
      translationProgress.currentKey === rowPath &&
      !translationProgress.isCompleted
    );
  };

  // Create translations with any local updates applied
  const translationsWithUpdates = React.useMemo(() => {
    return translations.map((entry) => {
      // If we have local updates for this entry's path, apply them
      if (localUpdates[entry.path]) {
        const updatedTranslations = { ...entry.translations };

        // Apply each language update
        Object.entries(localUpdates[entry.path]).forEach(([lang, value]) => {
          updatedTranslations[lang] = value;
        });

        return {
          ...entry,
          translations: updatedTranslations,
        };
      }

      // No updates, return the original entry
      return entry;
    });
  }, [translations, localUpdates]);

  // Filter translations based on search term
  const filteredTranslations = translationsWithUpdates.filter((entry) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Search in key path
    if (entry.path.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Search in translation values
    for (const lang of languages) {
      if (entry.translations[lang]?.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    return false;
  });

  // Pagination logic
  const totalPages = filteredTranslations.length;
  const currentEntry = filteredTranslations[currentPage];

  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);

  // Find and highlight newly created key when it appears in translations
  React.useEffect(() => {
    if (newlyCreatedKey && filteredTranslations.length > 0) {
      // Find the index of the newly created key in the filtered translations
      const newKeyIndex = filteredTranslations.findIndex(
        (entry) => entry.path === newlyCreatedKey
      );

      // If found, set the current page to that index to show the new key
      if (newKeyIndex !== -1) {
        setCurrentPage(newKeyIndex);

        // Optionally, reset the newlyCreatedKey in the store after finding it
        // This prevents repeatedly jumping to this key if user navigates away
        setTimeout(() => {
          useTranslationStore.setState({ newlyCreatedKey: null });
        }, 100);
      }
    }
  }, [newlyCreatedKey, filteredTranslations]);

  // Make sure current page is valid if items are filtered or removed
  useEffect(() => {
    if (filteredTranslations.length === 0) {
      setCurrentPage(0);
    } else if (currentPage >= filteredTranslations.length) {
      setCurrentPage(filteredTranslations.length - 1);
    }
  }, [filteredTranslations.length, currentPage]);

  // Handle click outside to close context menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenu &&
        !keyContainerRef.current?.contains(event.target as Node)
      ) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [contextMenu]);

  // Handle context menu for translation keys
  const handleKeyContextMenu = (e: React.MouseEvent, keyPath: string) => {
    e.preventDefault();
    setActiveKeyPath(keyPath);
    setContextMenu({
      keyPath,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Handle rename key action
  const handleRenameKey = useCallback(() => {
    // First close the context menu and then open the modal
    setContextMenu(null);
    // Use function form of setState to ensure we're working with the latest state
    setIsRenameModalOpen(() => true);
  }, [activeKeyPath]);

  // Handle move key action
  const handleMoveKey = useCallback(() => {
    // First close the context menu and then open the modal
    setContextMenu(null);
    // Use function form of setState to ensure we're working with the latest state
    setIsMoveModalOpen(() => true);
  }, [activeKeyPath]);

  // Handle delete key action
  const handleDeleteKey = useCallback(() => {
    // First close the context menu and then open the modal
    setContextMenu(null);
    // Use function form of setState to ensure we're working with the latest state
    setIsDeleteModalOpen(() => true);
  }, [activeKeyPath]);

  // Handle find in Figma action
  const handleFindInFigma = useCallback(() => {
    // Close the context menu and open the Figma modal
    setContextMenu(null);
    
    // Find the current English translation value for the active key
    const currentEntry = filteredTranslations.find(entry => entry.path === activeKeyPath);
    if (currentEntry && currentEntry.translations && currentEntry.translations["en"]) {
      setActiveTranslationValue(currentEntry.translations["en"]);
      setIsFigmaModalOpen(true);
    }
  }, [activeKeyPath, filteredTranslations]);

  // Submit handlers for key operations
  const handleSubmitRename = async (newKeyPath: string) => {
    console.log("Renaming key:", activeKeyPath, "to", newKeyPath);
    return await useTranslationStore
      .getState()
      .renameKey(projectName || "", namespace || "", activeKeyPath, newKeyPath);
  };

  const handleSubmitMove = async (
    targetProjectName: string,
    targetNamespace: string
  ) => {
    console.log(
      "Moving key:",
      activeKeyPath,
      "to",
      targetProjectName,
      targetNamespace
    );
    return await useTranslationStore
      .getState()
      .moveKey(
        projectName || "",
        namespace || "",
        targetProjectName,
        targetNamespace,
        activeKeyPath
      );
  };

  const handleSubmitDelete = async () => {
    console.log("Deleting key:", activeKeyPath);
    return await useTranslationStore
      .getState()
      .deleteKey(projectName || "", namespace || "", activeKeyPath);
  };

  // Listen for socket events to update translations in real-time
  useEffect(() => {
    const socket = getSocket();

    // When a translation is completed via socket
    const handleTranslationCompleted = (data: any) => {
      const {
        projectName: translatedProject,
        namespace: translatedNamespace,
        key: translatedKey,
        targetLanguage,
        value,
      } = data;

      // Only update if it's for the current project and namespace
      if (
        translatedProject === projectName &&
        translatedNamespace === namespace
      ) {
        // Update our local state to reflect the new translation immediately
        setLocalUpdates((prev) => {
          const keyUpdates = prev[translatedKey] || {};
          return {
            ...prev,
            [translatedKey]: {
              ...keyUpdates,
              [targetLanguage]: value,
            },
          };
        });
      }
    };

    // Listen for translation completed events
    socket.on("translation:completed", handleTranslationCompleted);

    // Cleanup listener when component unmounts
    return () => {
      socket.off("translation:completed", handleTranslationCompleted);
    };
  }, [projectName, namespace]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex-grow min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search translations..."
            className="input w-full text-sm py-1 text-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Target language selector for translations
        {ollamaConnected && (
          <div className="flex gap-2 items-center">
            <select
              value={selectedTargetLanguage}
              onChange={(e) => setSelectedTargetLanguage(e.target.value)}
              className="input py-1 px-2 text-sm text-gray-800 dark:text-gray-200"
              disabled={languages.filter(lang => lang !== baseLanguage).length === 0}
            >
              <option value="" disabled>Target language</option>
              {languages
                .filter(lang => lang !== baseLanguage)
                .map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))
              }
            </select>
            
            {currentEntry && (
              <button 
                onClick={() => handleTranslateToSelectedLanguage(currentEntry.path)}
                disabled={!selectedTargetLanguage || translating}
                className="btn btn-sm btn-secondary py-1 px-2 text-xs"
                title="Translate current key to selected language"
              >
                {translating ? "..." : "Translate"}
              </button>
            )}
          </div>
        )} */}

        {filteredTranslations.length > 0 && (
          <div className="w-[250px]">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="input py-1 px-2 text-sm w-full text-gray-800 dark:text-gray-200"
            >
              {filteredTranslations.map((entry, index) => (
                <option key={entry.path} value={index}>
                  {index + 1}:{" "}
                  {entry.path.length > 30
                    ? entry.path.substring(0, 30) + "..."
                    : entry.path}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        {filteredTranslations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {searchTerm
              ? "No matching translations found"
              : "No translations available"}
          </div>
        ) : (
          <div>
            {/* Pagination controls - top */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
              >
                ← Previous
              </button>
              <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Key {currentPage + 1} of {totalPages}
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
              >
                Next →
              </button>
            </div>

            {/* Current translation key */}
            <div className="mb-8">
              <div
                className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 group 
                  ${
                    currentEntry.path === newlyCreatedKey
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 outline outline-2 outline-green-400 dark:outline-green-600"
                      : "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200"
                  }`}
                ref={keyContainerRef}
              >
                <span
                  className="truncate flex-1 pr-1 text-gray-800 dark:text-gray-200"
                  onContextMenu={(e) =>
                    handleKeyContextMenu(e, currentEntry.path)
                  }
                >
                  Key: <strong>{currentEntry.path}</strong> (EN:{" "}
                  {currentEntry.translations["en"] || ""})
                </span>
                {ollamaConnected &&
                  languages.filter((lang) => lang !== baseLanguage).length >
                    0 && (
                    <button
                      onClick={() =>
                        handleTranslateToAllLanguages(currentEntry.path)
                      }
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

              <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                {/* Fixed-height scrollable container */}
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="w-[100px] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                          Language
                        </th>
                        <th className="w-auto px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                          Translation
                        </th>
                      </tr>
                    </thead>
                    <TranslationTableRow
                      currentEntry={currentEntry}
                      languages={languages}
                      baseLanguage={baseLanguage}
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
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination controls - bottom */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
              >
                ← Previous
              </button>
              <div>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="input py-1 px-2 text-sm text-gray-800 dark:text-gray-200"
                >
                  {filteredTranslations.map((entry, index) => (
                    <option key={entry.path} value={index}>
                      {index + 1}:{" "}
                      {entry.path.length > 30
                        ? entry.path.substring(0, 30) + "..."
                        : entry.path}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm border border-primary-600 text-primary-600 hover:bg-primary-50 hover:text-primary-700 px-3 py-1 dark:text-primary-400 dark:hover:text-primary-300 dark:border-primary-700 dark:hover:bg-gray-800"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredTranslations.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Total {translations.length} keys
        </div>
      )}

      {/* Context menu and modals */}
      {contextMenu && (
        <KeyContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          keyPath={contextMenu.keyPath}
          onClose={() => setContextMenu(null)}
          onRename={handleRenameKey}
          onMove={handleMoveKey}
          onDelete={handleDeleteKey}
          onFindInFigma={handleFindInFigma}
        />
      )}

      {/* Modals */}
      <RenameKeyModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        keyPath={activeKeyPath}
        onRename={handleSubmitRename}
      />
      <MoveKeyModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        keyPath={activeKeyPath}
        sourceProjectName={projectName || ""}
        sourceNamespace={namespace || ""}
        onMove={handleSubmitMove}
      />
      <DeleteKeyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        keyPath={activeKeyPath}
        projectName={projectName || ""}
        namespace={namespace || ""}
        onDelete={handleSubmitDelete}
      />
      <FigmaReferenceModal
        isOpen={isFigmaModalOpen}
        onClose={() => setIsFigmaModalOpen(false)}
        translationKey={activeKeyPath}
        translationValue={activeTranslationValue}
      />
    </div>
  );
};

export default TranslationTable;
