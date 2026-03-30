import React from "react";

/**
 * Parses a translation string and returns React elements with
 * variables and HTML tags rendered as styled inline badges.
 */

type TokenType = "text" | "variable" | "htmlTag";

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Tokenize a translation string into text, variables, and HTML tags.
 */
export function tokenizeTranslation(str: string): Token[] {
  if (!str) return [];

  const tokens: Token[] = [];
  // Match:
  // 1. {{variable}} or {variable}
  // 2. HTML tags like <strong>, </strong>, <br />, <a href="...">, etc.
  const regex = /(\{\{[^{}]+\}\}|\{[^{}]+\}|<\/?[a-zA-Z][^>]*\/?>)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: str.slice(lastIndex, match.index) });
    }

    const value = match[0];
    if (value.startsWith("{")) {
      tokens.push({ type: "variable", value });
    } else {
      tokens.push({ type: "htmlTag", value });
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < str.length) {
    tokens.push({ type: "text", value: str.slice(lastIndex) });
  }

  return tokens;
}

/**
 * Extract unique variables and HTML tags from a translation string.
 */
export function extractTokens(str: string): { variables: string[]; htmlTags: string[] } {
  const tokens = tokenizeTranslation(str);
  const variables = new Set<string>();
  const htmlTags = new Set<string>();

  for (const token of tokens) {
    if (token.type === "variable") variables.add(token.value);
    if (token.type === "htmlTag") htmlTags.add(token.value);
  }

  return {
    variables: Array.from(variables),
    htmlTags: Array.from(htmlTags),
  };
}

/**
 * Renders a translation string with variables and HTML tags as styled badges.
 */
const TranslationHighlighter: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const tokens = tokenizeTranslation(text);

  return (
    <span>
      {tokens.map((token, i) => {
        if (token.type === "variable") {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono font-medium bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-700/50 whitespace-nowrap"
            >
              {token.value}
            </span>
          );
        }
        if (token.type === "htmlTag") {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-mono font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700/50 whitespace-nowrap"
            >
              {token.value}
            </span>
          );
        }
        return <span key={i}>{token.value}</span>;
      })}
    </span>
  );
};

export default TranslationHighlighter;
