import React, { useState } from 'react';
import { useLanguageStore } from '@/store/languageStore';
import Modal from './Modal';

interface LanguageSelectorProps {
  languages: string[];
  baseLanguage: string;
  selectedLanguages: string[];
  onToggle: (language: string) => void;
  projectName: string;
  horizontal?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  baseLanguage,
  selectedLanguages,
  onToggle,
  projectName,
  horizontal = false
}) => {
  const [newLanguage, setNewLanguage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { addLanguage, loading } = useLanguageStore();
  
  // Handler for 'Select All' option
  const handleSelectAll = () => {
    // Toggle between all selected or just the base language
    const allSelected = languages.every(lang => selectedLanguages.includes(lang));
    
    if (allSelected) {
      // If all are selected, keep only the base language
      onToggle('deselectAll');
    } else {
      // Otherwise select all languages
      onToggle('selectAll');
    }
  };

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    
    const success = await addLanguage(projectName, newLanguage.trim());
    if (success) {
      setNewLanguage('');
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <div className={`${horizontal ? 'flex flex-wrap gap-2' : 'space-y-2'} mb-4`}>
        {/* Select All option */}
        <button
          onClick={handleSelectAll}
          className={`
            px-3 py-1 rounded-full text-sm mr-2 mb-1 transition-colors
            bg-gray-100 text-primary-700 hover:bg-gray-200 border border-primary-300
            dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-gray-700 dark:border-primary-600
          `}
          disabled={languages.length <= 1}
        >
          {languages.every(lang => selectedLanguages.includes(lang)) 
            ? 'Deselect All' 
            : 'Select All'}
        </button>
        {languages.map(lang => (
          <button 
            key={lang}
            onClick={() => lang !== baseLanguage && onToggle(lang)}
            disabled={lang === baseLanguage} // Base language is always selected
            className={`
              px-3 py-1 rounded-full text-sm mr-2 mb-1 transition-colors
              ${selectedLanguages.includes(lang) 
                ? 'bg-primary-500 text-white hover:bg-primary-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}
              ${lang === baseLanguage ? 'border-2 border-primary-300' : ''}
            `}
          >
            {lang}
            {lang === baseLanguage && 
              <span className="ml-1 text-xs bg-primary-200 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-1 rounded">base</span>
            }
          </button>
        ))}
        
        {/* Add language button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="
            px-3 py-1 rounded-full text-sm mr-2 mb-1 transition-colors
            bg-primary-100 text-primary-700 hover:bg-primary-200 border border-primary-300
            dark:bg-gray-800 dark:text-primary-400 dark:hover:bg-gray-700 dark:border-primary-600
            flex items-center justify-center
          "
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>

        {languages.length === 0 && (
          <div className="text-gray-500 text-sm py-2">No languages found</div>
        )}
      </div>

      {/* Add Language Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Language"
      >
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Enter a language code to add it to the project.
          </p>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newLanguage}
              onChange={e => setNewLanguage(e.target.value)}
              placeholder="Language code (e.g., fr)"
              className="input flex-1 text-sm"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 mb-4">
            Language codes should follow ISO 639-1 format (e.g., en, fr, de, ru)
          </p>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn btn-outline-secondary text-sm py-1"
            >
              Cancel
            </button>
            <button
              onClick={handleAddLanguage}
              disabled={!newLanguage.trim() || loading}
              className="btn btn-primary text-sm py-1"
            >
              {loading ? 'Adding...' : 'Add Language'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LanguageSelector;
