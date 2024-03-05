import React from "react";

import { SearchInput } from "../../search-input";
import { InputSize } from "../../text-input";

import { SearchProps } from "../Selector.types";

const Search = React.memo(
  ({
    placeholder,
    value,
    onSearch,
    onClearSearch,
    setIsSearch,
  }: SearchProps) => {
    const onClearSearchAction = React.useCallback(() => {
      onClearSearch?.(() => setIsSearch(false));
    }, [onClearSearch, setIsSearch]);

    const onSearchAction = React.useCallback(
      (data: string) => {
        const v = data.trim();

        if (v === "") return onClearSearchAction();

        onSearch?.(v, () => setIsSearch(true));
      },
      [onClearSearchAction, onSearch, setIsSearch],
    );

    return (
      <SearchInput
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onSearchAction}
        onClearSearch={onClearSearchAction}
        size={InputSize.base}
      />
    );
  },
);

Search.displayName = "Search";

export { Search };
