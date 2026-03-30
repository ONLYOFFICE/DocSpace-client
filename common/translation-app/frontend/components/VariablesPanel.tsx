import React, { useMemo } from "react";
import { extractTokens } from "./TranslationHighlighter";

interface VariablesPanelProps {
  /** The base (English) translation string */
  baseText: string;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ baseText }) => {
  const { variables, htmlTags } = useMemo(
    () => extractTokens(baseText || ""),
    [baseText]
  );

  if (variables.length === 0 && htmlTags.length === 0) {
    return (
      <div className="text-xs text-gray-400 dark:text-gray-500 italic p-3">
        No variables or tags
      </div>
    );
  }

  return (
    <div className="p-3 space-y-4">
      {variables.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Variables
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {variables.map((v, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50 cursor-pointer hover:bg-violet-200 dark:hover:bg-violet-900/60 transition-colors"
                title="Click to copy"
                onClick={() => navigator.clipboard.writeText(v)}
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {htmlTags.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            HTML Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {htmlTags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-mono font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700/50 cursor-pointer hover:bg-sky-200 dark:hover:bg-sky-900/60 transition-colors"
                title="Click to copy"
                onClick={() => navigator.clipboard.writeText(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariablesPanel;
