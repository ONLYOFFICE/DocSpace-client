import React, { useState } from 'react';
import Modal from './Modal';

interface CreateKeyModalProps {
  isOpen: boolean;
  namespace: string;
  onClose: () => void;
  onCreateKey: (keyPath: string, value: string) => Promise<boolean>;
}

const CreateKeyModal: React.FC<CreateKeyModalProps> = ({
  isOpen,
  namespace,
  onClose,
  onCreateKey
}) => {
  const [keyPath, setKeyPath] = useState<string>('');
  const [keyValue, setKeyValue] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyPath.trim()) {
      setError('Key path cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onCreateKey(keyPath, keyValue);
      if (success) {
        // Reset form and close modal on success
        setKeyPath('');
        setKeyValue('');
        onClose();
      } else {
        setError('Failed to create key');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Translation Key">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-300">
              Namespace
            </label>
          </div>
          <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-800 dark:text-gray-200 text-sm mb-4 font-mono border border-gray-300 dark:border-gray-700">
            {namespace}
          </div>
          
          <label htmlFor="keyPath" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            Key Path
          </label>
          <input
            id="keyPath"
            type="text"
            value={keyPath}
            onChange={(e) => setKeyPath(e.target.value)}
            className="input text-sm font-mono w-full mb-4"
            placeholder="Enter key path"
            autoFocus
          />
          
          <label htmlFor="keyValue" className="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-1">
            English Value
          </label>
          <textarea
            id="keyValue"
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            className="input text-sm w-full h-24"
            placeholder="Enter translation value for English"
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
            {isSubmitting ? 'Creating...' : 'Create Key'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateKeyModal;
