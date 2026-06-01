// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { ChangeEvent, useCallback, useEffect, useState } from "react";
import debounce from "lodash/debounce";

import XIconReactSvgUrl from "PUBLIC_DIR/images/x.react.svg?url";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { IconButton } from "@docspace/ui-kit/components/icon-button";

import styles from "../Members.module.scss";

type SearchProps = {
  setSearchValue: (value: string) => void;
  onClose: () => void;
};

const Search = ({ setSearchValue, onClose }: SearchProps) => {
  const [value, setValue] = useState("");

  const debouncedSearch = useCallback(
    debounce((v: string) => setSearchValue(v), 300),
    [],
  );

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setValue(newValue);
    debouncedSearch(newValue.trim());
  };

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Esc" || e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, [onClose]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  return (
    <div className={styles.searchContainer}>
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
    </div>
  );
};

export default Search;
