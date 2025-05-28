import React, { useState } from 'react';

interface DeleteNamespaceModalProps {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onDelete: (namespace: string) => Promise<void>;
}

const DeleteNamespaceModal: React.FC<DeleteNamespaceModalProps> = ({
  isOpen,
  namespace,
  onClose,
  onDelete
}) => {
  const [confirmText, setConfirmText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmText === namespace;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfirmed) {
      setError('Please type the namespace name to confirm deletion');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await onDelete(namespace);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete namespace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-gray-800 dark:text-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Delete Namespace</h2>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">
            You are about to delete the namespace <strong>{namespace}</strong> and all its translations in <strong>all languages</strong>.
            This action cannot be undone.
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Type <strong className="text-gray-900 dark:text-white">{namespace}</strong> to confirm deletion
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="input w-full"
              placeholder={`Type ${namespace} to confirm`}
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
              disabled={isSubmitting || !isConfirmed}
              className="btn btn-danger"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteNamespaceModal;
