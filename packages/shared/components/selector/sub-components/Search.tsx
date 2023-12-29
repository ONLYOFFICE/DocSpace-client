import React from "react";

import { SearchInput } from "../../search-input";
import { InputSize } from "../../text-input";

import { SearchProps } from "../Selector.types";

const Search = React.memo(
  ({ placeholder, value, onSearch, onClearSearch }: SearchProps) => {
    return (
      <SearchInput
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onSearch}
        onClearSearch={onClearSearch}
        size={InputSize.base}
      />
    );
  },
);

Search.displayName = "Search";

export { Search };
