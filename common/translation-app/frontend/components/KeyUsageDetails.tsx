import React, { useState, useEffect } from 'react';
import { useKeyUsageStore } from '../store/keyUsageStore';

// Define a simple code highlighting component instead of importing JavaScriptCode
interface JavaScriptCodeProps {
  codeContent: string;
  codeTitle?: string;
  darkTheme?: boolean;
  showLineNumbers?: boolean;
}

const JavaScriptCode: React.FC<JavaScriptCodeProps> = ({ 
  codeContent, 
  codeTitle, 
  darkTheme = false, 
  showLineNumbers = true 
}) => {
  return (
    <div className={`border rounded ${darkTheme ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
      {codeTitle && (
        <div className={`px-3 py-1 border-b ${darkTheme ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
          <span className="font-mono text-xs">{codeTitle}</span>
        </div>
      )}
      <pre className={`p-3 overflow-x-auto ${showLineNumbers ? 'pl-8 relative' : ''} font-mono text-xs`}>
        <code>{codeContent}</code>
      </pre>
    </div>
  );
};

// Define a type for the Tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// TabPanel component to handle tab content switching
const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="pt-2">
          {children}
        </div>
      )}
    </div>
  );
};

// Props for the KeyUsageDetails component
// Define a type for key usage data matching store structure
interface Usage {
  file_path: string;
  line_number: number;
  context: string;
  module: string;
}

interface KeyUsage {
  key: string;
  usages: Usage[];
  comment: {
    comment: string;
    is_auto: boolean;
    updated_at: string;
  } | null;
}

interface KeyUsageDetailsProps {
  translationKey: string;
}

const KeyUsageDetails: React.FC<KeyUsageDetailsProps> = ({ translationKey }) => {
  // State from the store
  const { loadKeyUsage, keyUsage, isLoadingKeyUsage, keyUsageError, setKeyComment } = useKeyUsageStore();
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [groupedUsages, setGroupedUsages] = useState<Record<string, Usage[]>>({});

  // Load key usage data when the component mounts or the key changes
  useEffect(() => {
    if (translationKey) {
      loadKeyUsage(translationKey);
    }
    // Omit loadKeyUsage from dependencies to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationKey]);

  // Update the comment text when the key usage changes
  useEffect(() => {
    if (keyUsage?.comment) {
      setCommentText(keyUsage.comment.comment);
    } else {
      setCommentText('');
    }
    setIsEditingComment(false);
    // Only run this effect when keyUsage changes or is first loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyUsage?.comment ? keyUsage.comment.comment : null]);

  // Group usages by module when key usage data changes - memoize this to avoid recalculations
  useEffect(() => {
    if (keyUsage?.usages) {
      // Limit to first 100 usages to prevent performance issues
      const limitedUsages = keyUsage.usages.slice(0, 100);
      const grouped = limitedUsages.reduce<Record<string, Usage[]>>((acc, usage) => {
        if (!acc[usage.module]) {
          acc[usage.module] = [];
        }
        acc[usage.module].push(usage);
        return acc;
      }, {});
      setGroupedUsages(grouped);
    }
    // Only run this when usages array changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyUsage ? JSON.stringify(keyUsage.usages.map(u => u.module)) : null]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent | null, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle saving comment
  const handleSaveComment = async () => {
    await setKeyComment(translationKey, commentText);
    setIsEditingComment(false);
  };

  // Render loading state
  if (isLoadingKeyUsage) {
    return (
      <div className="flex justify-center p-3">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Render error state
  if (keyUsageError) {
    return (
      <div className="p-2">
        <p className="text-red-500">Error: {keyUsageError}</p>
      </div>
    );
  }

  // Render when no data is found
  if (!keyUsage) {
    return (
      <div className="p-2">
        <p className="text-gray-800 dark:text-gray-200">
          No usage information found for key: {translationKey}
        </p>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          This key might not be used in the codebase or the usage analysis hasn&apos;t been run yet.
        </p>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          {translationKey}
        </h2>
        
        {/* Comment Section */}
        <div className="mb-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
              Comment
              {keyUsage.comment?.is_auto && (
                <span className="ml-2 text-xs bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 py-0.5 px-2 rounded-full text-xs">
                  Auto
                </span>
              )}
            </div>
            {!isEditingComment ? (
              <button 
                className="text-xs py-1 px-2 btn btn-secondary"
                onClick={() => setIsEditingComment(true)}
              >
                <span className="mr-1">✏️</span> Edit
              </button>
            ) : (
              <button 
                className="text-xs py-1 px-2 btn btn-primary"
                onClick={handleSaveComment}
              >
                <span className="mr-1">💾</span> Save
              </button>
            )}
          </div>
          
          {!isEditingComment ? (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {commentText || "No comment available."}
            </p>
          ) : (
            <textarea
              className="w-full rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 p-2"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
          )}
        </div>
        
        {/* Tabs for different views */}
        <div className="mt-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                className={`mr-4 py-2 ${tabValue === 0 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => handleTabChange(null, 0)}
              >
                Locations
              </button>
              <button
                className={`py-2 ${tabValue === 1 
                  ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400 font-medium' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => handleTabChange(null, 1)}
              >
                By Module ({Object.keys(groupedUsages).length})
              </button>
            </nav>
          </div>
          
          {/* Locations Tab */}
          <TabPanel value={tabValue} index={0}>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Found in {keyUsage.usages.length} location{keyUsage.usages.length !== 1 ? 's' : ''}
              {keyUsage.usages.length > 100 && ' (showing first 100)'}
            </p>
            
            {keyUsage.usages.slice(0, 100).map((usage: Usage, index: number) => (
              <div key={index} className="mb-3 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div 
                  className="p-2 bg-gray-50 dark:bg-gray-750 flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    const detailsEl = document.getElementById(`usage-details-${index}`);
                    if (detailsEl) {
                      detailsEl.hidden = !detailsEl.hidden;
                    }
                  }}
                >
                  <div className="flex items-center text-gray-800 dark:text-gray-200">
                    <span className="mr-2">📁</span>
                    {usage.file_path}:{usage.line_number}
                    <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {usage.module}
                    </span>
                  </div>
                  <span>▼</span>
                </div>
                <div id={`usage-details-${index}`} className="p-2 border-t border-gray-200 dark:border-gray-700">
                  <JavaScriptCode 
                    codeContent={usage.context}
                    showLineNumbers={false}
                  />
                </div>
              </div>
            ))}
          </TabPanel>
          
          {/* By Module Tab */}
          <TabPanel value={tabValue} index={1}>
            {Object.entries(groupedUsages).map(([module, usages]) => (
              <div key={module} className="mb-3 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div 
                  className="p-2 bg-gray-50 dark:bg-gray-750 flex justify-between items-center cursor-pointer"
                  onClick={() => {
                    const detailsEl = document.getElementById(`module-details-${module}`);
                    if (detailsEl) {
                      detailsEl.hidden = !detailsEl.hidden;
                    }
                  }}
                >
                  <div className="text-gray-800 dark:text-gray-200">
                    {module} 
                    <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                      {usages.length} location{usages.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span>▼</span>
                </div>
                <div id={`module-details-${module}`} className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="pl-4">
                    {usages.map((usage, index) => (
                      <div key={index} className="mb-4">
                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-2">
                          {usage.file_path}:{usage.line_number}
                        </p>
                        <JavaScriptCode 
                          codeContent={usage.context}
                          showLineNumbers={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </TabPanel>
        </div>
      </div>
    </div>
  );
};

export default KeyUsageDetails;
