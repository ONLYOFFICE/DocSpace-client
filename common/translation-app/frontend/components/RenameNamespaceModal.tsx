import React, { useState } from 'react';

interface RenameNamespaceModalProps {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onRename: (oldName: string, newName: string) => Promise<void>;
}

const RenameNamespaceModal: React.FC<RenameNamespaceModalProps> = ({
  isOpen,
  namespace,
  onClose,
  onRename
}) => {
  const [newNamespace, setNewNamespace] = useState<string>(namespace);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNamespace.trim()) {
      setError('Namespace cannot be empty');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await onRename(namespace, newNamespace.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to rename namespace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-gray-800 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Rename Namespace</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Current name</label>
            <input
              type="text"
              value={namespace}
              disabled
              className="input w-full opacity-70"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">New name</label>
            <input
              type="text"
              value={newNamespace}
              onChange={(e) => setNewNamespace(e.target.value)}
              className="input w-full"
              placeholder="Enter new namespace name"
              autoFocus
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameNamespaceModal;
