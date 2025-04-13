import React, { useState } from "react";
import { useNamespaceStore } from "@/store/namespaceStore";
import Modal from "./Modal";

interface NamespaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onNamespaceAdded?: (namespace: string) => void;
}

const NamespaceModal: React.FC<NamespaceModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onNamespaceAdded,
}) => {
  const [newNamespace, setNewNamespace] = useState<string>("");
  const { addNamespace, loading } = useNamespaceStore();

  const handleAddNamespace = async () => {
    if (!newNamespace.trim()) return;

    const success = await addNamespace(projectName, newNamespace.trim());
    if (success) {
      // Call the callback if provided
      if (onNamespaceAdded) {
        onNamespaceAdded(newNamespace.trim());
      }

      // Reset form and close modal
      setNewNamespace("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Namespace">
      <div className="mt-2">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
          Enter a namespace name to create a new translation file.
        </p>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newNamespace}
            onChange={(e) => setNewNamespace(e.target.value)}
            placeholder="Namespace name (e.g., common, header)"
            className="input flex-1 text-sm"
            autoFocus
          />
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-4">
          Namespaces will create new JSON files (e.g., common, header, footer)
        </p>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="btn btn-outline-secondary text-sm py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleAddNamespace}
            disabled={!newNamespace.trim() || loading}
            className="btn btn-primary text-sm py-1"
          >
            {loading ? "Adding..." : "Add Namespace"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NamespaceModal;
