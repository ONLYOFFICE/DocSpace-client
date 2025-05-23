import React, { useState } from 'react';
import Modal from './Modal';

interface RenameKeyModalProps {
  isOpen: boolean;
  keyPath: string;
  onClose: () => void;
  onRename: (newKeyPath: string) => Promise<boolean>;
}

const RenameKeyModal: React.FC<RenameKeyModalProps> = ({
  isOpen,
  keyPath,
  onClose,
  onRename
}) => {
  const [newKeyPath, setNewKeyPath] = useState<string>(keyPath);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newKeyPath.trim()) {
      setError('Key path cannot be empty');
      return;
    }
    
    if (newKeyPath === keyPath) {
      setError('New key path must be different from the current one');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onRename(newKeyPath);
      if (success) {
        onClose();
      } else {
        setError('Failed to rename key');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Translation Key">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <label htmlFor="currentKeyPath" className="block text-sm font-medium text-gray-800 dark:text-gray-300">
              Current Key Path
            </label>
          </div>
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm mb-4 font-mono border border-gray-300 dark:border-gray-700">
            {keyPath}
          </div>
          
          <label htmlFor="newKeyPath" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            New Key Path
          </label>
          <input
            id="newKeyPath"
            type="text"
            value={newKeyPath}
            onChange={(e) => setNewKeyPath(e.target.value)}
            className="input text-sm font-mono w-full"
            placeholder="Enter new key path"
            autoFocus
          />
        </div>
        
        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </div>
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
            {isSubmitting ? 'Renaming...' : 'Rename Key'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameKeyModal;
