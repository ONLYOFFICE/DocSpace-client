import { ChangeEvent, useEffect, useRef } from "react";

import XIconReactSvgUrl from "PUBLIC_DIR/images/x.react.svg?url";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/shared/components/text-input";
import { IconButton } from "@docspace/shared/components/icon-button";

import { StyledSearchContainer } from "../styles/common";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

const Search = ({ value, onChange, onClose }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onEscapeUp = (e: KeyboardEvent) => {
    if (e.key === "Esc" || e.key === "Escape") onClose();
  };

  const onChangeAction = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    window.addEventListener("keyup", onEscapeUp);

    return () => window.removeEventListener("keyup", onEscapeUp);
  });

  return (
    <StyledSearchContainer>
      <TextInput
        id="info_panel_search_input"
        type={InputType.text}
        size={InputSize.base}
        scale={true}
        onChange={onChangeAction}
        value={value}
        forwardedRef={inputRef}
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

export default Search;
