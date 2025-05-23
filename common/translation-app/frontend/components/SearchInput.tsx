"use client";

import React, { useState, useEffect } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
}) => {
  const [showClear, setShowClear] = useState(value.length > 0);

  useEffect(() => {
    setShowClear(value.length > 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full pr-8 ${inputClassName}`}
      />
      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchInput;
