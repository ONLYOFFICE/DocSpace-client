import React, { useState, useMemo, useRef } from 'react';
import NamespaceContextMenu from './NamespaceContextMenu';
import RenameNamespaceModal from './RenameNamespaceModal';
import MoveNamespaceModal from './MoveNamespaceModal';
import DeleteNamespaceModal from './DeleteNamespaceModal';
import { useTranslationStore } from '@/store/translationStore';

interface NamespaceSelectorProps {
  namespaces: string[];
  selectedNamespace: string | null;
  projectName: string;
  onChange: (namespace: string) => void;
  onNamespaceUpdated?: () => void;
}

const NamespaceSelector: React.FC<NamespaceSelectorProps> = ({
  namespaces,
  selectedNamespace,
  projectName,
  onChange,
  onNamespaceUpdated
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<{ namespace: string; x: number; y: number } | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [moveModalOpen, setMoveModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [activeNamespace, setActiveNamespace] = useState<string>('');

  // Get translation store functions
  const { renameNamespace, moveNamespaceTo, deleteNamespace } = useTranslationStore();

  // Close context menu when clicking elsewhere
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter namespaces based on search term
  const filteredNamespaces = useMemo(() => {
    if (!searchTerm.trim()) return namespaces;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return namespaces.filter(namespace => 
      namespace.toLowerCase().includes(searchLower)
    );
  }, [namespaces, searchTerm]);

  const handleContextMenu = (e: React.MouseEvent, namespace: string) => {
    e.preventDefault();
    setContextMenu({
      namespace,
      x: e.clientX,
      y: e.clientY
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

  const handleMoveSubmit = async (sourceNamespace: string, targetProjectName: string, targetNamespace: string) => {
    const success = await moveNamespaceTo(projectName, sourceNamespace, targetProjectName, targetNamespace);
    if (success && onNamespaceUpdated) {
      onNamespaceUpdated();
      
      // If the current namespace was moved to the same project, update selection
      if (selectedNamespace === sourceNamespace && projectName === targetProjectName) {
        onChange(targetNamespace);
      } else if (selectedNamespace === sourceNamespace) {
        // If moved to a different project, clear selection
        onChange('');
      }
    }
  };

  const handleDeleteSubmit = async (namespace: string) => {
    const success = await deleteNamespace(projectName, namespace);
    if (success && onNamespaceUpdated) {
      onNamespaceUpdated();
      
      // If the current namespace was deleted, clear selection
      if (selectedNamespace === namespace) {
        onChange(''); // Or select the first available namespace
      }
    }
  };

  return (
    <div ref={containerRef}>
      {/* Search input */}
      <div className="mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search namespaces..."
          className="input w-full text-sm py-1"
        />
      </div>
      
      <div className="max-h-60 overflow-y-auto mb-4">
        {filteredNamespaces.map(namespace => (
          <div 
            key={namespace}
            className={`p-2 rounded cursor-pointer mb-1 ${
              selectedNamespace === namespace 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onChange(namespace)}
            onContextMenu={(e) => handleContextMenu(e, namespace)}
          >
            {namespace}
          </div>
        ))}

        {namespaces.length === 0 && (
          <div className="text-gray-500 text-sm py-2">No namespaces found</div>
        )}
        
        {namespaces.length > 0 && filteredNamespaces.length === 0 && (
          <div className="text-gray-500 text-sm py-2">No matching namespaces found</div>
        )}
      </div>


      {/* Context Menu */}
      {contextMenu && (
        <NamespaceContextMenu
          namespace={contextMenu.namespace}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={handleRename}
          onMove={handleMove}
          onDelete={handleDelete}
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
    </div>
  );
};

export default NamespaceSelector;
