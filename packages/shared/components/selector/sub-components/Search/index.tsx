import React from "react";

import SearchInput from "../../../search-input";

import { SearchProps } from "./Search.types";

const Search = React.memo(
  ({ placeholder, value, onSearch, onClearSearch }: SearchProps) => {
    return (
      <SearchInput
        // @ts-expect-error TS(2322): Type '{ className: string; placeholder: string | u... Remove this comment to see the full error message
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onSearch}
        onClearSearch={onClearSearch}
      />
    );
  }
);

export default Search;
