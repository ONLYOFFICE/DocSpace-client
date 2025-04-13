import React, { useState } from 'react';
import { useNamespaceStore } from '@/store/namespaceStore';

interface NamespaceSelectorProps {
  namespaces: string[];
  selectedNamespace: string | null;
  onChange: (namespace: string) => void;
  projectName: string;
}

const NamespaceSelector: React.FC<NamespaceSelectorProps> = ({
  namespaces,
  selectedNamespace,
  onChange,
  projectName
}) => {
  const [newNamespace, setNewNamespace] = useState<string>('');
  const { addNamespace, loading } = useNamespaceStore();

  const handleAddNamespace = async () => {
    if (!newNamespace.trim()) return;
    
    const success = await addNamespace(projectName, newNamespace.trim());
    if (success) {
      setNewNamespace('');
      // Select the newly created namespace
      onChange(newNamespace.trim());
    }
  };

  return (
    <div>
      <div className="max-h-60 overflow-y-auto mb-4">
        {namespaces.map(namespace => (
          <div 
            key={namespace}
            className={`p-2 rounded cursor-pointer mb-1 ${
              selectedNamespace === namespace 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onChange(namespace)}
          >
            {namespace}
          </div>
        ))}

        {namespaces.length === 0 && (
          <div className="text-gray-500 text-sm py-2">No namespaces found</div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newNamespace}
            onChange={e => setNewNamespace(e.target.value)}
            placeholder="New namespace"
            className="input flex-1 text-sm"
          />
          <button
            onClick={handleAddNamespace}
            disabled={!newNamespace.trim() || loading}
            className="btn btn-primary text-sm py-1"
          >
            {loading ? '...' : 'Add'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Namespaces will create new JSON files (e.g., common, header, footer)
        </p>
      </div>
    </div>
  );
};

export default NamespaceSelector;
