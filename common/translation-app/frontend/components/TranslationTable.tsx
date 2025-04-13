import React, { useState } from 'react';
import { useTranslationStore } from '@/store/translationStore';
import { useOllamaStore } from '@/store/ollamaStore';

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
  
  const { updateTranslation, loading: savingTranslation } = useTranslationStore();
  const { 
    translateKey, 
    isConnected: ollamaConnected, 
    loading: translating,
    translationProgress
  } = useOllamaStore();

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

  // Filter translations based on search term
  const filteredTranslations = translations.filter(entry => {
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
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                Key Path
              </th>
              {languages.map(lang => (
                <th 
                  key={lang} 
                  className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700"
                >
                  {lang} {lang === baseLanguage && <span className="text-xs">(base)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTranslations.length === 0 ? (
              <tr>
                <td 
                  colSpan={languages.length + 1} 
                  className="px-4 py-4 text-center text-gray-500 border-b dark:border-gray-800"
                >
                  {searchTerm ? 'No matching translations found' : 'No translations available'}
                </td>
              </tr>
            ) : (
              filteredTranslations.map(entry => (
                <tr key={entry.path} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-2 border-b dark:border-gray-800 font-mono text-sm">
                    {entry.path}
                  </td>
                  {languages.map(lang => (
                    <td key={`${entry.path}-${lang}`} className="px-4 py-2 border-b dark:border-gray-800">
                      {editingCell?.rowPath === entry.path && editingCell?.language === lang ? (
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
                            className={`flex-1 break-words ${!entry.translations[lang] ? 'text-gray-400 italic' : ''}`}
                            onClick={() => handleEditStart(entry.path, lang, entry.translations[lang] || '')}
                          >
                            {entry.translations[lang] || 'Not translated'}
                          </div>
                          
                          {lang !== baseLanguage && (
                            <button
                              onClick={() => handleTranslate(entry.path, lang)}
                              disabled={translating || isTranslating(entry.path, lang) || !ollamaConnected}
                              className="ml-2 text-xs opacity-0 group-hover:opacity-100 focus:opacity-100 btn btn-secondary py-0 px-2"
                              title="Translate using Ollama"
                            >
                              {isTranslating(entry.path, lang) ? 'Translating...' : 'AI'}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
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
