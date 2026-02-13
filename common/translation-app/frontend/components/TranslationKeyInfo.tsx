import React, { useEffect, useState } from "react";
import { useKeyUsageStore } from "../store/keyUsageStore";
import KeyUsageDetails from "./KeyUsageDetails";

interface TranslationKeyInfoProps {
  translationKey: string;
  namespace: string;
  projectName: string;
}

/**
 * Component to display inline usage information for a translation key
 * Intended to be embedded in the translation editor UI
 */
const TranslationKeyInfo: React.FC<TranslationKeyInfoProps> = ({
  translationKey,
  namespace,
  projectName,
}) => {
  const {
    loadKeyUsage,
    keyUsage: storeKeyUsage,
    isLoadingKeyUsage,
    keyUsageError,
  } = useKeyUsageStore();
  const [keyInfo, setKeyInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fully qualified key (namespace:key)
  // Calculate fullKey outside of useEffect to avoid recreating it on each render
  const fullKey = React.useMemo(() => {
    return namespace ? `${namespace}:${translationKey}` : translationKey;
  }, [namespace, translationKey]);

  // Load key usage information - only run once when the component mounts or when fullKey changes
  useEffect(() => {
    if (!translationKey) return;
    loadKeyUsage(fullKey);
    // Do not include loadKeyUsage in the dependency array to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullKey, translationKey]);

  // Update local state when store changes
  // Only update keyInfo if storeKeyUsage has actually changed
  useEffect(() => {
    if (storeKeyUsage && (!keyInfo || keyInfo.key !== storeKeyUsage.key)) {
      setKeyInfo(storeKeyUsage);
      setError(null);
    }
  }, [storeKeyUsage, keyInfo]);

  // Handle errors separately to avoid potential race conditions
  useEffect(() => {
    if (keyUsageError) {
      setError(keyUsageError);
      setKeyInfo(null);
    }
  }, [keyUsageError]);

  // Render nothing if we're still loading or there's no data
  if (isLoadingKeyUsage || (!keyInfo && !error)) {
    return null;
  }

  // If there's an error or no usage data, render minimal info
  if (error || !keyInfo || keyInfo.usages.length === 0) {
    return (
      <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="mr-1">ℹ️</span>
        <span>{error || "No usage information available for this key"}</span>
      </div>
    );
  }

  // Count usages by module
  const moduleUsages: Record<string, number> = keyInfo.usages.reduce(
    (acc: Record<string, number>, usage: { module: string }) => {
      if (!acc[usage.module]) {
        acc[usage.module] = 0;
      }
      acc[usage.module]++;
      return acc;
    },
    {}
  );

  return (
    <>
      <div className="mt-1 mb-1">
        {/* Comment summary */}
        {keyInfo.comment && (
          <div className="flex items-start mb-1">
            <span className="text-gray-500 dark:text-gray-400 mr-1 mt-0.5">
              💬
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {keyInfo.comment.comment}
            </span>
          </div>
        )}

        {/* Usage summary */}
        <div className="flex items-center flex-wrap gap-1">
          <span className="text-gray-500 dark:text-gray-400">📁</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {keyInfo.usages.length} location
            {keyInfo.usages.length !== 1 ? "s" : ""}:
          </span>

          {(Object.entries(moduleUsages) as [string, number][]).map(
            ([module, count]) => (
              <div key={module} className="relative group">
                <span className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                  {module} ({count})
                </span>
                <div className="hidden group-hover:block absolute bottom-full mb-1 left-0 bg-gray-800 text-white text-xs rounded p-1 z-10 whitespace-nowrap">
                  {`${count} usage${count !== 1 ? "s" : ""} in ${module}`}
                </div>
              </div>
            )
          )}

          <button
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 ml-1"
            onClick={() => setShowDetailsDialog(true)}
          >
            View details
          </button>
        </div>
      </div>

      {/* Dialog for showing full key usage details */}
      {showDetailsDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Translation Key Details
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {`Project: ${String(projectName)}, Key: ${String(fullKey)}`}
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShowDetailsDialog(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-grow">
              <KeyUsageDetails translationKey={String(fullKey)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TranslationKeyInfo;
