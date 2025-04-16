import React, { useState, useEffect } from 'react';
import { fetchTranslationStats } from '@/lib/api';

interface LanguageStats {
  language: string;
  translatedCount: number;
  untranslatedCount: number;
  totalCount: number;
  completionPercentage: number;
}

interface TranslationStatsProps {
  projectName?: string; // Optional - if provided, will show stats for just one project
}

const TranslationStats: React.FC<TranslationStatsProps> = ({ projectName }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalKeys: number;
    languageStats: LanguageStats[];
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsData = await fetchTranslationStats(projectName);
        setStats(statsData);
      } catch (err: any) {
        console.error('Error loading translation stats:', err);
        setError(err.message || 'Failed to load translation statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [projectName]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Translation Statistics</h2>
        <div className="text-center py-6">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-700 dark:text-gray-300">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Translation Statistics</h2>
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const { totalKeys, languageStats } = stats;

  // Sort languages by completion percentage (highest first)
  const sortedLanguageStats = [...languageStats].sort((a, b) => b.completionPercentage - a.completionPercentage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Translation Statistics
        {projectName && <span className="text-lg ml-2 text-gray-600 dark:text-gray-400">({projectName})</span>}
      </h2>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Overview</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {languageStats.length} languages available
          </span>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Total Keys</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{totalKeys}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Highest Completion</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {languageStats.length > 0 ? (
                  `${Math.round(sortedLanguageStats[0].completionPercentage)}% (${sortedLanguageStats[0].language})`
                ) : 'N/A'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Lowest Completion</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {languageStats.length > 0 ? (
                  `${Math.round(sortedLanguageStats[sortedLanguageStats.length - 1].completionPercentage)}% (${sortedLanguageStats[sortedLanguageStats.length - 1].language})`
                ) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">Language Completion</h3>
        
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {sortedLanguageStats.map((langStat) => (
            <div key={langStat.language} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <div className="font-medium">
                  {langStat.language.toUpperCase()}
                  {langStat.language === 'en' && (
                    <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">
                      Base
                    </span>
                  )}
                </div>
                <div className="text-sm font-medium">
                  {Math.round(langStat.completionPercentage)}%
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                <div
                  className={`h-2.5 rounded-full ${getCompletionColorClass(langStat.completionPercentage)}`}
                  style={{ width: `${langStat.completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                <span>{langStat.translatedCount} translated</span>
                {langStat.untranslatedCount > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {langStat.untranslatedCount} missing
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to get color class based on completion percentage
function getCompletionColorClass(percentage: number): string {
  if (percentage < 50) return 'bg-red-600';
  if (percentage < 80) return 'bg-amber-500';
  if (percentage < 95) return 'bg-yellow-400';
  return 'bg-green-500';
}

export default TranslationStats;
