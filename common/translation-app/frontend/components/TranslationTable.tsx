import React, { useState, useEffect } from 'react';
import { useTranslationStore } from '@/store/translationStore';
import { useOllamaStore } from '@/store/ollamaStore';
import { getSocket } from '@/lib/socket';

interface TranslationEntry {
  key: string;
  path: string;
  translations: {
    [language: string]: string;
  };
}

interface TranslationTableProps {
  translations: TranslationEntry[];
  languages: string[];
  baseLanguage: string;
  projectName: string;
  namespace: string;
}

const TranslationTable: React.FC<TranslationTableProps> = ({
  translations,
  languages,
  baseLanguage,
  projectName,
  namespace
}) => {
  const [editingCell, setEditingCell] = useState<{ rowPath: string; language: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  
  const { updateTranslation, loading: savingTranslation } = useTranslationStore();
  const { 
    translateKey, 
    isConnected: ollamaConnected, 
    loading: translating,
    translationProgress
  } = useOllamaStore();
  
  // State for tracking locally updated translations by AI
  const [localUpdates, setLocalUpdates] = useState<Record<string, Record<string, string>>>({});

  const handleEditStart = (rowPath: string, language: string, value: string) => {
    setEditingCell({ rowPath, language });
    setEditValue(value);
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditSave = async () => {
    if (!editingCell) return;
    
    const { rowPath, language } = editingCell;
    const success = await updateTranslation(
      projectName,
      language,
      namespace,
      rowPath,
      editValue
    );
    
    if (success) {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const handleTranslate = async (rowPath: string, targetLanguage: string) => {
    if (!ollamaConnected) return;
    
    await translateKey(
      projectName,
      baseLanguage,
      targetLanguage,
      namespace,
      rowPath
    );
  };

  const isTranslating = (rowPath: string, language: string) => {
    if (!translationProgress) return false;
    
    return (
      translationProgress.projectName === projectName &&
      translationProgress.namespace === namespace &&
      translationProgress.targetLanguage === language &&
      translationProgress.currentKey === rowPath &&
      !translationProgress.isCompleted
    );
  };

  // Create translations with any local updates applied
  const translationsWithUpdates = React.useMemo(() => {
    return translations.map(entry => {
      // If we have local updates for this entry's path, apply them
      if (localUpdates[entry.path]) {
        const updatedTranslations = { ...entry.translations };
        
        // Apply each language update
        Object.entries(localUpdates[entry.path]).forEach(([lang, value]) => {
          updatedTranslations[lang] = value;
        });
        
        return {
          ...entry,
          translations: updatedTranslations
        };
      }
      
      // No updates, return the original entry
      return entry;
    });
  }, [translations, localUpdates]);
  
  // Filter translations based on search term
  const filteredTranslations = translationsWithUpdates.filter(entry => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in key path
    if (entry.path.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Search in translation values
    for (const lang of languages) {
      if (entry.translations[lang]?.toLowerCase().includes(searchLower)) {
        return true;
      }
    }
    
    return false;
  });
  
  // Pagination logic
  const totalPages = filteredTranslations.length;
  const currentEntry = filteredTranslations[currentPage];
  
  // Handle page changes
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm]);
  
  // Make sure current page is valid if items are filtered or removed
  useEffect(() => {
    if (filteredTranslations.length === 0) {
      setCurrentPage(0);
    } else if (currentPage >= filteredTranslations.length) {
      setCurrentPage(filteredTranslations.length - 1);
    }
  }, [filteredTranslations.length, currentPage]);
  
  // Listen for socket events to update translations in real-time
  useEffect(() => {
    const socket = getSocket();
    
    // When a translation is completed via socket
    const handleTranslationCompleted = (data: any) => {
      const { projectName: translatedProject, namespace: translatedNamespace, 
             key: translatedKey, targetLanguage, value } = data;
      
      // Only update if it's for the current project and namespace
      if (translatedProject === projectName && translatedNamespace === namespace) {
        // Update our local state to reflect the new translation immediately
        setLocalUpdates(prev => {
          const keyUpdates = prev[translatedKey] || {};
          return {
            ...prev,
            [translatedKey]: {
              ...keyUpdates,
              [targetLanguage]: value
            }
          };
        });
      }
    };
    
    // Listen for translation completed events
    socket.on('translation:completed', handleTranslationCompleted);
    
    // Cleanup listener when component unmounts
    return () => {
      socket.off('translation:completed', handleTranslationCompleted);
    };
  }, [projectName, namespace]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search translations..."
          className="input"
        />
      </div>
      
      <div className="overflow-x-auto">
        {filteredTranslations.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            {searchTerm ? 'No matching translations found' : 'No translations available'}
          </div>
        ) : (
          <div>
            {/* Pagination controls - top */}
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="btn btn-sm btn-outline-primary px-3 py-1"
              >
                ← Previous
              </button>
              <div className="text-sm">
                Key {currentPage + 1} of {totalPages}
              </div>
              <button 
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm btn-outline-primary px-3 py-1"
              >
                Next →
              </button>
            </div>
            
            {/* Current translation key */}
            <div className="mb-8">
              <h3 className="text-sm font-mono mb-3 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                {currentEntry.path}
              </h3>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded overflow-hidden">
                  {/* Fixed-height scrollable container */}
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                        <tr>
                        <th className="w-[100px] px-2 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                          Lang
                        </th>
                        <th className="w-auto px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                          Translation
                        </th>
                        </tr>
                      </thead>
                      <tbody>
                    {languages.map(lang => (
                      <tr key={`${currentEntry.path}-${lang}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-2 py-2 border-b dark:border-gray-800 whitespace-nowrap">
                          <span className={`inline-block px-1.5 py-0.5 rounded ${lang === baseLanguage ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 font-medium' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {lang}{lang === baseLanguage && '*'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-b dark:border-gray-800">
                          {editingCell?.rowPath === currentEntry.path && editingCell?.language === lang ? (
                            <div className="flex">
                              <textarea
                                value={editValue}
                                onChange={e => setEditValue(e.target.value)}
                                className="input min-h-[60px] flex-1 mr-2"
                                autoFocus
                              />
                              <div className="flex flex-col space-y-1">
                                <button 
                                  onClick={handleEditSave}
                                  disabled={savingTranslation}
                                  className="btn btn-primary text-xs py-1"
                                >
                                  {savingTranslation ? '...' : 'Save'}
                                </button>
                                <button 
                                  onClick={handleEditCancel}
                                  className="btn btn-secondary text-xs py-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group flex items-start">
                              <div 
                                className={`flex-1 break-words ${!currentEntry.translations[lang] ? 'text-gray-400 italic' : ''}`}
                                onClick={() => handleEditStart(currentEntry.path, lang, currentEntry.translations[lang] || '')}
                              >
                                {currentEntry.translations[lang] || 'Not translated'}
                              </div>
                              
                              {lang !== baseLanguage && (
                                <button
                                  onClick={() => handleTranslate(currentEntry.path, lang)}
                                  disabled={translating || isTranslating(currentEntry.path, lang) || !ollamaConnected}
                                  className="ml-2 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 btn btn-secondary py-0 px-2"
                                  title="Translate using Ollama"
                                >
                                  {isTranslating(currentEntry.path, lang) ? 'Translating...' : 'AI'}
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            
            {/* Pagination controls - bottom */}
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="btn btn-sm btn-outline-primary px-3 py-1"
              >
                ← Previous
              </button>
              <div>
                <select 
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="input py-1 px-2 text-sm"
                >
                  {filteredTranslations.map((entry, index) => (
                    <option key={entry.path} value={index}>
                      {index + 1}: {entry.path.length > 30 ? entry.path.substring(0, 30) + '...' : entry.path}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="btn btn-sm btn-outline-primary px-3 py-1"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {filteredTranslations.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredTranslations.length} of {translations.length} translations
        </div>
      )}
    </div>
  );
};

export default TranslationTable;
