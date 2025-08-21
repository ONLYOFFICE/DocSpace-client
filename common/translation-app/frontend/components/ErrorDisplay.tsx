import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  return (
    <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6 flex justify-between items-center">
      <div>{error}</div>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
