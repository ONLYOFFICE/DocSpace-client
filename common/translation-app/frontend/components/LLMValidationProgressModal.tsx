import React from "react";
import Modal from "./Modal";

interface LLMValidationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  namespace: string;
  projectName: string;
  sourceLanguage: string;
  targetLanguage: string;
  progress: {
    current: number;
    total: number;
    currentKey?: string;
    error?: string;
  };
}

const LLMValidationProgressModal: React.FC<LLMValidationProgressModalProps> = ({
  isOpen,
  onClose,
  namespace,
  projectName,
  sourceLanguage,
  targetLanguage,
  progress,
}) => {
  // Calculate completion percentage
  const percentage = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="LLM Translation Analysis in Progress"
    >
      <div className="mt-2">
        <div className="mb-4">
          <h3 className="text-base font-medium text-gray-800 dark:text-white mb-1">
            {namespace}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {projectName}
          </p>
        </div>
        
        <div className="mb-6">
          {/* Error state */}
          {progress.error ? (
            <div className="mb-4 p-3 bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200 rounded border border-red-200 dark:border-red-800/30">
              <div className="flex items-start">
                <svg className="w-5 h-5 mt-0.5 mr-2 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium">Error during validation</p>
                  <p className="mt-1 text-sm">{progress.error}</p>
                </div>
              </div>
              <p className="mt-3 text-xs">
                You can try running the validation again or check the console for more details.
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-1 text-sm">
                <div>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {sourceLanguage}
                  </span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-primary-600 dark:text-primary-400">
                    {targetLanguage}
                  </span>
                </div>
                <span>{percentage}% Complete</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              
              {/* Current key being processed */}
              {progress.currentKey && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <p className="mb-1">Current translation key:</p>
                  <div className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 font-mono truncate">
                    {progress.currentKey}
                  </div>
                </div>
              )}
              
              {/* Progress numbers */}
              <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Processing {progress.current} of {progress.total} translations</span>
                <span>{progress.total - progress.current} remaining</span>
              </div>
            </>
          )}
        </div>
        
        {!progress.error && (
          <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="flex items-center mb-2">
              <svg className="w-4 h-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              AI-powered analysis is running
            </p>
            <p className="ml-6 text-xs">
              The LLM model is analyzing translation quality, grammar, and cultural accuracy.
              Results will be displayed when complete.
            </p>
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="btn btn-primary text-sm py-1"
          >
            {progress.error ? 'Close' : 'Continue in background'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LLMValidationProgressModal;
