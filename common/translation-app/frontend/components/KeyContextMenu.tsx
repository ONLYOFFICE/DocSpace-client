import React from 'react';

interface KeyContextMenuProps {
  x: number;
  y: number;
  keyPath: string;
  onClose: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}

const KeyContextMenu: React.FC<KeyContextMenuProps> = ({
  x,
  y,
  keyPath,
  onClose,
  onRename,
  onMove,
  onDelete
}) => {
  // This function is no longer used
  
  // Direct handler functions for debugging
  const handleRenameClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Call onRename directly
      onRename();
    } catch (error) {
      console.error('Error calling onRename:', error);
    }
    
    // Close the menu
    onClose();
  };
  
  const handleMoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Call onMove directly
      onMove();
    } catch (error) {
      console.error('Error calling onMove:', error);
    }
    
    // Close the menu
    onClose();
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    try {
      // Call onDelete directly
      onDelete();
    } catch (error) {
      console.error('Error calling onDelete:', error);
    }
    
    // Close the menu
    onClose();
  };

  return (
    <div
      className="fixed z-[9999] bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 w-56"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        maxWidth: 'calc(100% - 20px)',
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to outside elements
    >
      <div className="py-1">
        <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 truncate">
          {keyPath}
        </div>
        <button
          onMouseDown={handleRenameClick}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200"
        >
          <svg className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Rename
        </button>
        <button
          onMouseDown={handleMoveClick}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-700 dark:text-gray-200"
        >
          <svg className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Move to
        </button>
        <button
          onMouseDown={handleDeleteClick}
          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400"
        >
          <svg className="h-4 w-4 mr-2 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default KeyContextMenu;
