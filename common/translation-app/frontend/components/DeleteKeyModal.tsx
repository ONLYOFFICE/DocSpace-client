import React, { useState } from 'react';
import Modal from './Modal';

interface DeleteKeyModalProps {
  isOpen: boolean;
  keyPath: string;
  projectName: string;
  namespace: string;
  onClose: () => void;
  onDelete: (keyPath: string) => Promise<boolean>;
}

const DeleteKeyModal: React.FC<DeleteKeyModalProps> = ({
  isOpen,
  keyPath,
  projectName,
  namespace,
  onClose,
  onDelete
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onDelete(keyPath);
      if (success) {
        onClose();
      } else {
        setError('Failed to delete key');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Translation Key">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-600 dark:text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Warning</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>
                This will permanently delete the key <span className="font-mono font-medium text-red-800 dark:text-red-200">{keyPath}</span> from all language files in namespace <span className="font-medium text-red-800 dark:text-red-200">{namespace}</span>. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="btn bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
        >
          {isSubmitting ? 'Deleting...' : 'Delete Key'}
        </button>
      </div>
    </Modal>
  );
};

export default DeleteKeyModal;
