import React, { useState, useEffect } from "react";
import { fetchTranslationStats } from "@/lib/api";
import { getLanguageName } from "@/utils/languageUtils";

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
        console.error("Error loading translation stats:", err);
        setError(err.message || "Failed to load translation statistics");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [projectName]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Translation Statistics
        </h2>
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">
              Loading statistics...
            </span>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Translation Statistics
        </h2>
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

  // Sort by base language first (typically 'en'), then by completion percentage
  const sortedLanguageStats = [...languageStats].sort((a, b) => {
    // Base language (en) always comes first
    if (a.language === "en") return -1;
    if (b.language === "en") return 1;

    // Then sort by completion percentage
    return b.completionPercentage - a.completionPercentage;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>
          Translation Statistics
          {projectName && (
            <span className="text-lg ml-2 text-gray-600 dark:text-gray-400">
              ({projectName})
            </span>
          )}
        </span>
      </h2>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
            Overview
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {languageStats.length} languages available
          </span>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Total Keys
              </p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalKeys}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Highest Completion
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {languageStats.length > 0
                  ? `${Math.round(sortedLanguageStats[0].completionPercentage)}% (${sortedLanguageStats[0].language})`
                  : "N/A"}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Lowest Completion
              </p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {languageStats.length > 0
                  ? `${Math.round(sortedLanguageStats[sortedLanguageStats.length - 1].completionPercentage)}% (${sortedLanguageStats[sortedLanguageStats.length - 1].language})`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
          Language Completion
        </h3>

        {/* Left-Skewed Histogram Chart */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex">
            {/* Percentage labels on the left */}
            <div className="pr-2 flex flex-col justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>100%</span>
              <span>90%</span>
              <span>75%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
            
            <div className="relative flex-grow">
              {/* Horizontal grid lines with non-linear spacing */}
              <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-0 w-full border-b border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-1/6 w-full border-b border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-1/3 w-full border-b border-gray-200 dark:border-gray-700"></div>
                <div className="absolute top-2/3 w-full border-b border-gray-200 dark:border-gray-700"></div>
              </div>
              
              {/* Language bars with skewed scale (horizontal) */}
              <div className="relative h-full pl-2 pr-4 pt-6 pb-2 flex flex-col justify-between gap-4">
                {sortedLanguageStats.map((langStat, index) => {
                  // Apply skew function to emphasize higher percentages
                  const skewedWidth = calculateSkewedWidth(langStat.completionPercentage);
                  return (
                    <div key={langStat.language} className="flex gap-2 items-center">
                      <div className="w-20 text-right text-sm font-medium">
                        {getLanguageName(langStat.language)}
                        {langStat.language === "en" && (
                          <span className="ml-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-1 py-0.5 rounded">
                            Base
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-grow">
                        <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden relative group">
                          <div 
                            className={`h-full ${getCompletionColorClass(langStat.completionPercentage)} relative transition-all duration-300 hover:brightness-110`}
                            style={{ width: `${skewedWidth}%` }}
                          >
                            {/* Only show percentage on the bar if it's wide enough */}
                            {skewedWidth > 15 ? (
                              <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-sm">
                                {Math.round(langStat.completionPercentage)}%
                              </span>
                            ) : (
                              <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 text-sm">
                                {Math.round(langStat.completionPercentage)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tooltip with detailed stats (appears on hover) */}
                      <div className="hidden group-hover:block absolute right-0 p-1 rounded bg-gray-900 text-white text-xs whitespace-nowrap z-20">
                        <div className="font-bold">{getLanguageName(langStat.language)}</div>
                        <div>Translated: {langStat.translatedCount}</div>
                        <div>Missing: {langStat.untranslatedCount}</div>
                        <div>Total: {langStat.totalCount}</div>
                        <div>Completion: {Math.round(langStat.completionPercentage)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Table (collapsed by default) */}
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 group-open:mb-4 list-none">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 group-open:rotate-90 transition-transform"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Detailed Statistics
            </div>
          </summary>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {sortedLanguageStats.map((langStat) => (
              <div
                key={langStat.language}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium">
                    {getLanguageName(langStat.language)}
                    {langStat.language === "en" && (
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
        </details>
      </div>
    </div>
  );
};

// Helper function to get color class based on completion percentage
function getCompletionColorClass(percentage: number): string {
  if (percentage < 50) return "bg-red-600";
  if (percentage < 80) return "bg-amber-500";
  if (percentage < 95) return "bg-yellow-400";
  return "bg-green-500";
}

// Function to calculate skewed width to emphasize high completion percentages
function calculateSkewedWidth(percentage: number): number {
  // Apply non-linear transformation to emphasize higher percentages
  if (percentage >= 90) {
    // Scale 90-100% to occupy 40-100% of the width
    return 40 + (percentage - 90) * 6;
  } else if (percentage >= 75) {
    // Scale 75-90% to occupy 25-40% of the width
    return 25 + (percentage - 75) * 1;
  } else if (percentage >= 50) {
    // Scale 50-75% to occupy 15-25% of the width
    return 15 + (percentage - 50) * 0.4;
  } else {
    // Scale 0-50% to occupy 0-15% of the width
    return percentage * 0.3;
  }
}

export default TranslationStats;
