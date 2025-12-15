// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { isTablet, isIOS } from "react-device-detect";

import { InputSize } from "../../text-input";
import { SearchInput } from "../../search-input";

import { SearchInputProps } from "../Filter.types";

const useSearch = ({
  onSearch,
  onClearFilter,
  clearSearch,
  setClearSearch,
  getSelectedInputValue,
  placeholder,
  isIndexEditingMode,

  initSearchValue,
}: SearchInputProps) => {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = React.useState(initSearchValue ?? "");
  const [caretPosition, setCaretPosition] = React.useState({
    start: 0,
    end: 0,
  });

  const onClearSearch = React.useCallback(() => {
    onSearch?.("");
  }, [onSearch]);

  const onInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (isTablet && isIOS) {
      const scrollEvent = () => {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo(0, 0);
        window.onscroll = () => {};
      };

      window.onscroll = scrollEvent;
    }
  };

  React.useEffect(() => {
    if (clearSearch) {
      setInputValue("");
      onClearFilter?.();
      setClearSearch(false);
    }
  }, [clearSearch, onClearFilter, setClearSearch]);

  React.useEffect(() => {
    const value = getSelectedInputValue?.();
    if (value && searchRef.current) {
      searchRef.current.focus();
    }
    searchRef.current?.setSelectionRange(
      caretPosition.start,
      caretPosition.end,
    );

    setInputValue(value);
  }, [getSelectedInputValue]);

  const onChange = React.useCallback(
    (value: string) => {
      onSearch?.(value);
      setCaretPosition({
        start: searchRef.current?.selectionStart || 0,
        end: searchRef.current?.selectionEnd || 0,
      });
    },
    [onSearch],
  );

  const searchComponent = (
    <SearchInput
      forwardedRef={searchRef}
      placeholder={placeholder}
      value={inputValue}
      onChange={onChange}
      onClearSearch={onClearSearch}
      id="filter_search-input"
      size={InputSize.base}
      isDisabled={isIndexEditingMode}
      onFocus={onInputFocus}
      scale
      dataTestId="filter_search_input"
    />
  );
  return { searchComponent };
};

export default useSearch;
