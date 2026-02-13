import React, { useState, useEffect } from 'react';
import { setFigmaApiKey, hasFigmaApiKey } from '@/lib/figmaApi';

interface FigmaApiKeyFormProps {
  onSaved: () => void;
}

const FigmaApiKeyForm: React.FC<FigmaApiKeyFormProps> = ({ onSaved }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isKeySet, setIsKeySet] = useState<boolean>(false);

  useEffect(() => {
    setIsKeySet(hasFigmaApiKey());
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid Figma API key');
      return;
    }

    // Simple validation: Figma API keys typically start with "figd_"
    if (!apiKey.trim().startsWith('figd_')) {
      setError('Figma API keys typically start with "figd_"');
      return;
    }

    setIsSaving(true);
    try {
      setFigmaApiKey(apiKey.trim());
      setIsKeySet(true);
      setError('');
      onSaved();
    } catch (err) {
      setError('Failed to save API key');
      console.error('Error saving Figma API key:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
        Figma API Configuration
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          To search for translations in Figma, you need to provide your Figma API key.
        </p>
        <ol className="text-sm text-gray-600 dark:text-gray-400 list-decimal pl-5 mb-4 space-y-1">
          <li>Go to <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">Figma API Access Tokens</a></li>
          <li>Click on &quot;Create a personal access token&quot;</li>
          <li>Copy the generated token and paste it below</li>
        </ol>
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
          <strong>Note:</strong> Your API key is stored only in your browser&apos;s localStorage and is not sent to our servers.
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="figma-api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Figma API Key
        </label>
        <div className="flex">
          <input
            id="figma-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="figd_..."
            className="flex-1 input border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700"
          />
          <button
            onClick={handleSave}
            disabled={isSaving || !apiKey}
            className="ml-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {isKeySet && !error && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            API key is saved in your browser
          </p>
        )}
      </div>
    </div>
  );
};

export default FigmaApiKeyForm;
