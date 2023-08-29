import InputBlock from "@docspace/components/input-block";
import SearchInput from "@docspace/components/search-input";
import TextInput from "@docspace/components/text-input";
import FieldContainer from "@docspace/components/field-container";
import { inject } from "mobx-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import styled from "styled-components";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { withTranslation } from "react-i18next";
import debounce from "lodash/debounce";

export const StyledTextInput = styled(TextInput)`
  width: 100%;
  max-width: 653px;
`;

const SearchFilter = ({ oformsFilter, getOforms }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [value, setValue] = useState("");

  // const onFilter = useCallback((val) => {
  //   const newFilter = oformsFilter.clone();
  //   newFilter.search = val;
  //   getOforms(newFilter);
  //   navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  // }, []);

  const onFilter = (val) => {
    const newFilter = oformsFilter.clone();
    newFilter.search = val;
    console.log(newFilter);
    getOforms(newFilter);
    navigate(`${location.pathname}?${newFilter.toUrlParams()}`);
  };

  const debouncedOnFilter = useMemo(() => {
    return debounce(onFilter, 300);
  }, [onFilter]);

  const onChangeValue = (val) => {
    setValue(val);
    // debouncedOnFilter(value);
    onFilter(val);
  };
  const onClearValue = () => onChangeValue("");

  const ref = useRef(null);
  const onInputClick = () => ref?.current?.focus();
  const onInputOutsideClick = (e) =>
    !ref?.current?.contains(e.target) && ref.current.blur();
  useEffect(() => {
    document.addEventListener("mousedown", onInputOutsideClick);
    return () => document.removeEventListener("mousedown", onInputOutsideClick);
  }, [ref]);

  return (
    <SearchInput
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
