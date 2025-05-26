import React, { useEffect, useState, useRef } from 'react';
import Modal from './Modal';
import { searchProjectForText, getFigmaNodeUrl, SearchProgressInfo, hasFigmaApiKey } from '@/lib/figmaApi';
import FigmaApiKeyForm from './FigmaApiKeyForm';

interface FigmaReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  translationKey: string;
  translationValue: string;
}

interface SearchResult {
  nodeId: string;
  fileName: string;
  fileKey: string;
  pageName: string;
  previewUrl?: string;
  nodeType: string;
  nodeContent: string;
  projectName?: string;
}

const FigmaReferenceModal: React.FC<FigmaReferenceModalProps> = ({
  isOpen,
  onClose,
  translationKey,
  translationValue,
}) => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [searchProgress, setSearchProgress] = useState<SearchProgressInfo | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if API key is set
    setHasApiKey(hasFigmaApiKey());
    
    if (isOpen && translationValue) {
      if (hasFigmaApiKey()) {
        handleSearch();
      }
    } else {
      // Reset state when modal closes
      setSearchResults([]);
      setSelectedResult(null);
      setError('');
      setSearchProgress(null);
    }
  }, [isOpen, translationValue]);
  
  // Force re-render when search progress changes
  useEffect(() => {
    if (searchProgress) {
      // This empty effect forces React to re-render when searchProgress changes
      // We could also add a counter state if needed for more reliable updates
    }
  }, [searchProgress?.currentFileIndex, searchProgress?.matchesFound]);

  const handleSearch = async () => {
    if (!hasFigmaApiKey()) {
      setError('Figma API key is not set. Please configure it below.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSearchResults([]);
      setSearchProgress(null);
      
      // Progress callback function
      const handleSearchProgress = (progress: SearchProgressInfo) => {
        setSearchProgress(progress);
      };
      
      const results = await searchProjectForText(translationValue, handleSearchProgress);
      setSearchResults(results);
      
      if (results.length > 0) {
        setSelectedResult(results[0]);
      } else {
        setError('No matches found in Figma designs.');
      }
    } catch (err) {
      setError('Error searching Figma: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
      setSearchProgress(null);
    }
  };
  
  const handleApiKeySaved = () => {
    setHasApiKey(true);
    handleSearch();
  };

  const openInFigma = (result: SearchResult) => {
    const url = getFigmaNodeUrl(result.fileKey, result.nodeId);
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Figma Reference Search"
    >
      <div className="flex flex-col gap-4" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Translation Key</h3>
          <p className="text-gray-800 dark:text-gray-200 font-mono text-sm break-all">{translationKey}</p>
          
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-3 mb-1">English Value</h3>
          <p className="text-gray-800 dark:text-gray-200 font-medium">{translationValue}</p>
        </div>

        <div className="py-2">
          {!hasApiKey ? (
            <FigmaApiKeyForm onSaved={handleApiKeySaved} />
          ) : loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="flex items-center mb-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Searching Figma designs...
                </span>
              </div>
              
              {searchProgress && (
                <div className="w-full max-w-md">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <div className="flex justify-between mb-1">
                      <span>
                        {searchProgress.currentFile && (
                          <span className="font-medium">
                            File: {searchProgress.currentFile.length > 30 
                              ? searchProgress.currentFile.substring(0, 30) + '...' 
                              : searchProgress.currentFile}
                          </span>
                        )}
                      </span>
                      <span>
                        {searchProgress.currentProject && (
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {searchProgress.currentProject}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-xs italic text-right">
                      Searched files: {searchProgress.currentFileIndex + 1} of {searchProgress.totalFiles}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                      style={{ 
                        width: `${Math.min(100, ((searchProgress.currentFileIndex + 0.5) / Math.max(1, searchProgress.totalFiles)) * 100)}%`
                      }}
                      key={`progress-${searchProgress.currentFileIndex}-${searchProgress.matchesFound}`} // Force re-render when these change
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                    <span>Progress: {Math.round(((searchProgress.currentFileIndex + 0.5) / searchProgress.totalFiles) * 100)}%</span>
                    {searchProgress.matchesFound > 0 && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Found {searchProgress.matchesFound} match{searchProgress.matchesFound !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
              {error}
              {error.includes('API key') && !hasApiKey && (
                <div className="mt-4">
                  <FigmaApiKeyForm onSaved={handleApiKeySaved} />
                </div>
              )}
            </div>
          ) : (
            <>
              {searchResults.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Found {searchResults.length} match{searchResults.length !== 1 ? 'es' : ''} in Figma
                    {searchResults.some(r => r.projectName === 'UI Kit') && (
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded">
                        Including UI Kit matches
                      </span>
                    )}
                  </h3>
                  
                  <div 
                    ref={resultsContainerRef}
                    className="flex flex-wrap gap-2 mb-4 p-1" 
                    style={{ maxHeight: searchResults.length > 6 ? '150px' : 'auto', overflowY: 'auto' }}
                  >
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.fileKey}-${result.nodeId}`}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${
                          selectedResult?.nodeId === result.nodeId
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 border border-primary-300 dark:border-primary-800'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedResult(result)}
                        title={`${result.fileName}${result.projectName ? ` (${result.projectName})` : ''}`}
                      >
                        {index + 1}. {result.fileName.length > 15 
                          ? result.fileName.substring(0, 15) + '...' 
                          : result.fileName}
                        {result.projectName && (
                          <span className={`ml-1 text-xs px-1.5 py-0.5 rounded ${result.projectName === 'UI Kit' ? 
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium' : 
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                            {result.projectName}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedResult && (
                <div 
                  className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden flex flex-col"
                  style={{ maxHeight: '500px' }}
                >
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {selectedResult.fileName}
                        {selectedResult.projectName && (
                          <span className={`ml-2 text-sm px-2 py-0.5 rounded ${selectedResult.projectName === 'UI Kit' ? 
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium' : 
                            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'}`}>
                            {selectedResult.projectName}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Page: {selectedResult.pageName}
                      </p>
                    </div>
                    <button
                      onClick={() => openInFigma(selectedResult)}
                      className="btn btn-primary text-sm px-3 py-1"
                    >
                      Open in Figma
                    </button>
                  </div>
                  
                  {selectedResult.previewUrl ? (
                    <div className="bg-white dark:bg-gray-900 p-4 flex justify-center overflow-auto">
                      <img 
                        src={selectedResult.previewUrl} 
                        alt="Figma preview" 
                        className="max-w-full max-h-[300px] object-contain border border-gray-200 dark:border-gray-700 rounded"
                      />
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-900 p-4 text-center text-gray-500 dark:text-gray-400">
                      No preview available
                    </div>
                  )}
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Content</h4>
                    <p className="text-gray-800 dark:text-gray-200 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                      {selectedResult.nodeContent}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="btn btn-secondary px-4 py-2 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FigmaReferenceModal;
