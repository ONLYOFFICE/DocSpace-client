import React, { useState } from 'react';
import { useLanguageStore } from '@/store/languageStore';

interface LanguageSelectorProps {
  languages: string[];
  baseLanguage: string;
  selectedLanguages: string[];
  onToggle: (language: string) => void;
  projectName: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  languages,
  baseLanguage,
  selectedLanguages,
  onToggle,
  projectName
}) => {
  const [newLanguage, setNewLanguage] = useState<string>('');
  const { addLanguage, loading } = useLanguageStore();

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;
    
    const success = await addLanguage(projectName, newLanguage.trim());
    if (success) {
      setNewLanguage('');
    }
  };

  return (
    <div>
      <div className="space-y-2 mb-4">
        {languages.map(lang => (
          <div key={lang} className="flex items-center">
            <input
              type="checkbox"
              id={`lang-${lang}`}
              checked={selectedLanguages.includes(lang)}
              onChange={() => onToggle(lang)}
              disabled={lang === baseLanguage} // Base language is always selected
              className="mr-2"
            />
            <label 
              htmlFor={`lang-${lang}`}
              className={`flex-1 ${lang === baseLanguage ? 'font-semibold' : ''}`}
            >
              {lang} {lang === baseLanguage && <span className="text-xs text-gray-500">(base)</span>}
            </label>
          </div>
        ))}

        {languages.length === 0 && (
          <div className="text-gray-500 text-sm py-2">No languages found</div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newLanguage}
            onChange={e => setNewLanguage(e.target.value)}
            placeholder="Add language (e.g., fr)"
            className="input flex-1 text-sm"
          />
          <button
            onClick={handleAddLanguage}
            disabled={!newLanguage.trim() || loading}
            className="btn btn-primary text-sm py-1"
          >
            {loading ? '...' : 'Add'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Language codes should follow ISO 639-1 format (e.g., en, fr, de, ru)
        </p>
      </div>
    </div>
  );
};

export default LanguageSelector;
