import React from 'react';

interface NamespaceContextMenuProps {
  namespace: string;
  x: number;
  y: number;
  onClose: () => void;
  onRename: (namespace: string) => void;
  onMove: (namespace: string) => void;
  onDelete: (namespace: string) => void;
}

const NamespaceContextMenu: React.FC<NamespaceContextMenuProps> = ({
  namespace,
  x,
  y,
  onClose,
  onRename,
  onMove,
  onDelete
}) => {
  // Close menu when clicking anywhere else
  React.useEffect(() => {
    const handleClickOutside = () => {
      onClose();
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg py-1 min-w-[180px]"
      style={{ 
        left: `${x}px`, 
        top: `${y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 mb-1">
        {namespace}
      </div>
      
      <button 
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onRename(namespace);
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Rename
      </button>
      
      <button 
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onMove(namespace);
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Move To
      </button>
      
      <button 
        className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
        onClick={() => {
          onDelete(namespace);
          onClose();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );
};

export default NamespaceContextMenu;
