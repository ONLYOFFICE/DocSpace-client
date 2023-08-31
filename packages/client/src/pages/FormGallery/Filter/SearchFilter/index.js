import SearchInput from "@docspace/components/search-input";
import { inject } from "mobx-react";
import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { withTranslation } from "react-i18next";

export const StyledSearchInput = styled(SearchInput)`
  width: 100%;
  max-width: 653px;
`;

const SearchFilter = ({ filterOformsBySearch }) => {
  const [value, setValue] = useState("");
  const onSearch = (val) => filterOformsBySearch(val);
  const onClear = () => onChangeValue("");
  const onChangeValue = (val) => {
    setValue(val);
    onSearch(val);
  };

  const ref = useRef(null);
  const onInputClick = () => ref?.current?.focus();
  const onInputOutsideClick = (e) =>
    !ref?.current?.contains(e.target) && ref.current.blur();
  useEffect(() => {
    document.addEventListener("mousedown", onInputOutsideClick);
    return () => document.removeEventListener("mousedown", onInputOutsideClick);
  }, [ref]);

  return (
    <StyledSearchInput
      forwardedRef={ref}
      className="first-name"
      tabIndex={1}
      placeholder={"Search"}
      value={value}
      onChange={onChangeValue}
      onClick={onInputClick}
      onClearSearch={onClear}
    />
  );
};

export default inject(({ oformsStore }) => ({
  filterOformsBySearch: oformsStore.filterOformsBySearch,
}))(withTranslation(["FormGallery", "Common"])(SearchFilter));
