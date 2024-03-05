import { ChangeEvent, useCallback, useEffect, useState } from "react";
import debounce from "lodash.debounce";
import { inject } from "mobx-react";

import XIconReactSvgUrl from "PUBLIC_DIR/images/x.react.svg?url";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { IconButton } from "@docspace/shared/components/icon-button";

import { StyledSearchContainer } from "../styles/common";

interface SearchProps {
  setSearchValue: (value: string) => void;
  resetSearch: () => void;
}

const Search = ({ setSearchValue, resetSearch }: SearchProps) => {
  const [value, setValue] = useState("");

  const onClose = () => {
    resetSearch();
  };

  const onEscapeUp = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  const debouncedSearch = useCallback(
    debounce((debouncedValue: string) => setSearchValue(debouncedValue), 300),
    [],
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setValue(newValue);

    debouncedSearch(newValue.trim());
  };

  useEffect(() => {
    window.addEventListener("keyup", onEscapeUp);

    return () => window.removeEventListener("keyup", onEscapeUp);
  }, []);

  return (
    <StyledSearchContainer>
      <TextInput
        id="info_panel_search_input"
        type={InputType.text}
        size={InputSize.base}
        scale
        onChange={onChange}
        value={value}
        isAutoFocussed
      />
      <IconButton
        id="search_close"
        iconName={XIconReactSvgUrl}
        size={16}
        onClick={onClose}
        isClickable
      />
    </StyledSearchContainer>
  );
};

export default inject(({ infoPanelStore }) => ({
  resetSearch: infoPanelStore.resetSearch,
  setSearchValue: infoPanelStore.setSearchValue,
}))(Search);
