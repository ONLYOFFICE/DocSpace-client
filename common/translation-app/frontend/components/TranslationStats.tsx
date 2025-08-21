import React, { useState, useEffect } from "react";
import { fetchTranslationStats } from "@/lib/api";
import { getLanguageName, getLanguageColor } from "@/utils/languageUtils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts";

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

        {/* Recharts Bar Chart - Vertical and showing only languages < 100% completion */}
        <div className="mb-8 bg-gray-50 dark:bg-gray-750 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-600 dark:text-gray-400 mb-3">
            Languages Needing Translation Work
          </h4>
          
          {/* Filter for languages with less than 100% completion */}
          {sortedLanguageStats.filter(stat => stat.completionPercentage < 100).length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              <p>All languages are 100% complete! 🎉</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                layout="horizontal"
                data={sortedLanguageStats
                  .filter(stat => stat.completionPercentage < 100)
                  .map((stat) => ({
                    language: getLanguageName(stat.language),
                    completionPercentage: stat.completionPercentage,
                    translatedCount: stat.translatedCount,
                    untranslatedCount: stat.untranslatedCount,
                    totalCount: stat.totalCount,
                    code: stat.language,
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#444"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="language"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fill: "var(--color-text-secondary)" }}
                />
                <YAxis
                  label={{ 
                    value: "Completion %", 
                    angle: -90, 
                    position: "insideLeft",
                    style: { fill: "var(--color-text-secondary)" } 
                  }}
                  domain={[0, 100]}
                  tick={{ fill: "var(--color-text-secondary)" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="completionPercentage"
                  name="Completion"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                >
                  {sortedLanguageStats
                    .filter(stat => stat.completionPercentage < 100)
                    .map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getLanguageColor(entry.language)}
                      />
                    ))}
                  <LabelList
                    dataKey="completionPercentage"
                    position="top"
                    fill="var(--color-text-primary)"
                    fontSize={12}
                    fontWeight="bold"
                    formatter={(value: number | string) => `${(value as number).toFixed(1)}%`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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
const getCompletionColorClass = (percentage: number): string => {
  if (percentage >= 90) return "bg-green-500";
  if (percentage >= 70) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

// Helper function to get color for charts based on completion percentage
const getCompletionChartColor = (percentage: number): string => {
  if (percentage >= 90) return "#10B981"; // Green
  if (percentage >= 70) return "#3B82F6"; // Blue
  if (percentage >= 40) return "#F59E0B"; // Yellow
  return "#EF4444"; // Red
};

// Function to calculate skewed width to emphasize high completion percentages
const calculateSkewedWidth = (percentage: number): number => {
  // Apply a non-linear transformation to visually emphasize high completion rates
  // This will make the bars wider as they get closer to 100%
  // We're using a power function here: percentage ^ exponent
  const exponent = 1.5; // Higher values create more skew (emphasize high percentages more)
  const normalizedPercentage = percentage / 100;
  const skewedValue = Math.pow(normalizedPercentage, exponent) * 100;

  // Scale the result to ensure it's not too narrow at low percentages
  // Minimum width is 2% of max-width
  const minWidth = 2;
  const scaledWidth = minWidth + (skewedValue * (100 - minWidth)) / 100;

  // Round to the nearest integer
  return Math.round(scaledWidth);
};

// Custom tooltip component for recharts
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: LanguageStats & { language: string };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 shadow-md rounded-md">
        <p className="font-medium">{`${label}`}</p>
        <p className="text-primary-600 dark:text-primary-400">
          {`Completion: ${payload[0].value.toFixed(1)}%`}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          {`Translated: ${payload[0].payload.translatedCount} / ${payload[0].payload.totalCount}`}
        </p>
      </div>
    );
  }
  return null;
};

export default TranslationStats;
