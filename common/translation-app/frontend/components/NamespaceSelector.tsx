import React, { useState, useMemo } from 'react';

interface NamespaceSelectorProps {
  namespaces: string[];
  selectedNamespace: string | null;
  onChange: (namespace: string) => void;
}

const NamespaceSelector: React.FC<NamespaceSelectorProps> = ({
  namespaces,
  selectedNamespace,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filter namespaces based on search term
  const filteredNamespaces = useMemo(() => {
    if (!searchTerm.trim()) return namespaces;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return namespaces.filter(namespace => 
      namespace.toLowerCase().includes(searchLower)
    );
  }, [namespaces, searchTerm]);

  return (
    <div>
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


    </div>
  );
};

export default NamespaceSelector;
