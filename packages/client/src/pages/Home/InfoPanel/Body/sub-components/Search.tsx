// (c) Copyright Ascensio System SIA 2009-2024
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
