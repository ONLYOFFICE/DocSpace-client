import React, { useState, useMemo, useRef } from "react";
import NamespaceContextMenu from "./NamespaceContextMenu";
import RenameNamespaceModal from "./RenameNamespaceModal";
import MoveNamespaceModal from "./MoveNamespaceModal";
import DeleteNamespaceModal from "./DeleteNamespaceModal";
import CreateKeyModal from "./CreateKeyModal";
import SearchInput from "./SearchInput";
import { useTranslationStore } from "@/store/translationStore";
import { useLanguageStore } from "@/store/languageStore";

interface NamespaceSelectorProps {
  namespaces: string[];
  selectedNamespace: string | null;
  projectName: string;
  onChange: (namespace: string) => void;
  onNamespaceUpdated?: () => void;
  onCheckErrors?: (namespace: string) => void;
  onRunLLMAnalysis?: (namespace: string) => void;
  onTranslateUntranslated?: (namespace: string) => void;
  showUntranslated?: boolean;
  baseLanguage?: string;
}

const NamespaceSelector: React.FC<NamespaceSelectorProps> = ({
  namespaces,
  selectedNamespace,
  projectName,
  onChange,
  onNamespaceUpdated,
  onCheckErrors,
  onRunLLMAnalysis,
  onTranslateUntranslated,
  showUntranslated = false,
  baseLanguage = 'en',
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [contextMenu, setContextMenu] = useState<{
    namespace: string;
    x: number;
    y: number;
  } | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [moveModalOpen, setMoveModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState<boolean>(false);
  const [activeNamespace, setActiveNamespace] = useState<string>("");

  // Get translation store functions
  const {
    renameNamespace,
    moveNamespaceTo,
    deleteNamespace,
    updateTranslation,
    fetchTranslations,
    flattenedTranslations,
  } = useTranslationStore();

  // Get available languages from the store
  const { languages } = useLanguageStore();

  // Close context menu when clicking elsewhere
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if a namespace has any untranslated keys
  const namespaceHasUntranslatedKeys = (namespace: string) => {
    // If we're not showing the current namespace translations yet, we can't filter it
    if (selectedNamespace !== namespace) {
      // For performance reasons, we'll just show all namespaces when showUntranslated is true
      // We'll properly filter them when they're selected
      return true;
    }

    // Look through all translations in the current namespace
    return flattenedTranslations.some(entry => {
      // Get non-base languages
      const nonBaseLanguages = languages.filter(lang => lang !== baseLanguage);
      
      // Check if any language is missing a translation
      return nonBaseLanguages.some(lang => {
        return !entry.translations[lang] || entry.translations[lang].trim() === '';
      });
    });
  };

  // Filter namespaces based on search term and showUntranslated
  const filteredNamespaces = useMemo(() => {
    // Start with full list
    let filtered = [...namespaces];

    // Apply untranslated filter if enabled
    if (showUntranslated) {
      filtered = filtered.filter(namespace => namespaceHasUntranslatedKeys(namespace));
    }

    // Then apply search term filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((namespace) =>
        namespace.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [namespaces, searchTerm, showUntranslated, selectedNamespace, flattenedTranslations]);

  const handleContextMenu = (e: React.MouseEvent, namespace: string) => {
    e.preventDefault();

    // Position near the click or the menu button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || rect.right - 10; // Default to near the end of the element
    const y = e.clientY || rect.top + rect.height / 2; // Default to middle of element

    setContextMenu({
      namespace,
      x,
      y,
    });
    setActiveNamespace(namespace);
  };

  const handleRename = (namespace: string) => {
    setActiveNamespace(namespace);
    setRenameModalOpen(true);
  };

  const handleMove = (namespace: string) => {
    setActiveNamespace(namespace);
    setMoveModalOpen(true);
  };

  const handleDelete = (namespace: string) => {
    setActiveNamespace(namespace);
    setDeleteModalOpen(true);
  };

  const handleCreateKey = (namespace: string) => {
    setActiveNamespace(namespace);
    setCreateKeyModalOpen(true);
  };

  const handleRenameSubmit = async (oldName: string, newName: string) => {
    const success = await renameNamespace(projectName, oldName, newName);
    if (success && onNamespaceUpdated) {
      onNamespaceUpdated();

      // If the current namespace was renamed, update selection
      if (selectedNamespace === oldName) {
        onChange(newName);
      }
    }
  };

  const handleMoveSubmit = async (
    sourceNamespace: string,
    targetProjectName: string,
    targetNamespace: string
  ) => {
    const success = await moveNamespaceTo(
      projectName,
      sourceNamespace,
      targetProjectName,
      targetNamespace
    );
    if (success && onNamespaceUpdated) {
      onNamespaceUpdated();

      // If the current namespace was moved to the same project, update selection
      if (
        selectedNamespace === sourceNamespace &&
        projectName === targetProjectName
      ) {
        onChange(targetNamespace);
      } else if (selectedNamespace === sourceNamespace) {
        // If moved to a different project, clear selection
        onChange("");
      }
    }
  };

  const handleDeleteSubmit = async (namespace: string) => {
    const success = await deleteNamespace(projectName, namespace);
    if (success && onNamespaceUpdated) {
      onNamespaceUpdated();

      // If the current namespace was deleted, clear selection
      if (selectedNamespace === namespace) {
        onChange(""); // Or select the first available namespace
      }
    }
  };

  // Function to refresh translations after creating a new key
  const refreshTranslations = () => {
    if (selectedNamespace && languages.length > 0) {
      // Fetch translations for the current namespace with all available languages
      fetchTranslations(projectName, languages, selectedNamespace);
    }
  };

  const handleCreateKeySubmit = async (keyPath: string, value: string) => {
    // Create key with English value
    const success = await updateTranslation(
      projectName,
      "en", // Create key with English language as specified
      activeNamespace,
      keyPath,
      value
    );

    if (success) {
      // Refresh the namespace list if needed
      if (onNamespaceUpdated) {
        onNamespaceUpdated();
      }

      // Refresh the translations table with the new key
      refreshTranslations();
    }

    return success;
  };

  return (
    <div ref={containerRef}>
      {/* Search input */}
      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search namespaces..."
          inputClassName="input text-sm py-1"
        />
      </div>

      <div className="max-h-[594px] overflow-y-auto mb-4 border border-gray-200 dark:border-gray-700 rounded p-1">
        {filteredNamespaces.map((namespace) => (
          <div
            key={namespace}
            className={`flex items-center justify-between p-2 rounded cursor-pointer mb-1 group ${
              selectedNamespace === namespace
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            onClick={() => onChange(namespace)}
            onContextMenu={(e) => handleContextMenu(e, namespace)}
          >
            <span className="truncate flex-1 pr-1 text-gray-800 dark:text-gray-200">
              {namespace}
            </span>
            <button
              className="opacity-30 dark:opacity-50 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
              onClick={(e) => {
                e.stopPropagation(); // Prevent namespace selection
                handleContextMenu(e, namespace);
              }}
              title="Namespace options"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 text-gray-500 dark:text-gray-400"
              >
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 8.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM10 14a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" />
              </svg>
            </button>
          </div>
        ))}

        {namespaces.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-sm py-2">
            No namespaces found
          </div>
        )}

        {namespaces.length > 0 && filteredNamespaces.length === 0 && (
          <div className="text-gray-500 dark:text-gray-400 text-sm py-2">
            No matching namespaces found
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <NamespaceContextMenu
          namespace={contextMenu.namespace}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={(namespace) => {
            setActiveNamespace(namespace);
            setRenameModalOpen(true);
            setContextMenu(null);
          }}
          onMove={(namespace) => {
            setActiveNamespace(namespace);
            setMoveModalOpen(true);
            setContextMenu(null);
          }}
          onDelete={(namespace) => {
            setActiveNamespace(namespace);
            setDeleteModalOpen(true);
            setContextMenu(null);
          }}
          onCreateKey={(namespace) => {
            setActiveNamespace(namespace);
            setCreateKeyModalOpen(true);
            setContextMenu(null);
          }}
          onCheckErrors={onCheckErrors || ((namespace) => {})}
          onRunLLMAnalysis={onRunLLMAnalysis}
          onTranslateUntranslated={onTranslateUntranslated}
          refreshTranslations={onNamespaceUpdated ? () => onNamespaceUpdated() : undefined}
        />
      )}

      {/* Modals */}
      <RenameNamespaceModal
        isOpen={renameModalOpen}
        namespace={activeNamespace}
        onClose={() => setRenameModalOpen(false)}
        onRename={handleRenameSubmit}
      />

      <MoveNamespaceModal
        isOpen={moveModalOpen}
        sourceProjectName={projectName}
        sourceNamespace={activeNamespace}
        availableNamespaces={namespaces}
        onClose={() => setMoveModalOpen(false)}
        onMove={handleMoveSubmit}
      />

      <DeleteNamespaceModal
        isOpen={deleteModalOpen}
        namespace={activeNamespace}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={handleDeleteSubmit}
      />

      <CreateKeyModal
        isOpen={createKeyModalOpen}
        namespace={activeNamespace}
        onClose={() => setCreateKeyModalOpen(false)}
        onCreateKey={handleCreateKeySubmit}
      />
    </div>
  );
};

export default NamespaceSelector;
