import SearchInput from "@docspace/components/search-input";
import { inject } from "mobx-react";
import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";

export const StyledSearchInput = styled(SearchInput)`
  width: 100%;
  max-width: 653px;
`;

const SearchFilter = ({ oformsFilter, getOforms }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState("");
  const onChangeValue = (val) => {
    setValue(val);
    onSearch(val);
  };
  const onClearValue = () => onChangeValue("");

  const onSearch = (val) => {
    const newFilter = oformsFilter.clone();
    newFilter.search = val;
    console.log(newFilter);
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
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
      onClearSearch={onClearValue}
    />
  );
};

export default inject(({ oformsStore }) => ({
  oformsFilter: oformsStore.oformsFilter,
  getOforms: oformsStore.getOforms,
}))(withTranslation(["FormGallery", "Common"])(SearchFilter));
