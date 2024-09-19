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

import React from "react";
import { ReactSVG } from "react-svg";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";

import { InputBlock } from "../input-block";
import { InputSize, InputType } from "../text-input";

import StyledSearchInput from "./SearchInput.styled";
import { SearchInputProps } from "./SearchInput.types";

const SearchInput = ({
  forwardedRef,
  value = "",
  autoRefresh = true,
  refreshTimeout = 1000,
  showClearButton = false,
  onClearSearch,
  onChange,
  size,
  className,
  style,
  scale = false,
  onClick,
  id,
  name,
  isDisabled = false,
  placeholder,
  onFocus,
  children,
}: SearchInputProps) => {
  const timerId = React.useRef<null | ReturnType<typeof setTimeout>>(null);

  const prevValue = React.useRef(value);

  const [inputValue, setInputValue] = React.useState(value);

  const onClearSearchAction = React.useCallback(() => {
    setInputValue("");
    onClearSearch?.();
  }, [onClearSearch]);

  const setSearchTimer = React.useCallback(
    (v: string) => {
      if (timerId.current) clearTimeout(timerId.current);

      timerId.current = setTimeout(() => {
        onChange?.(v);
        if (timerId.current) clearTimeout(timerId.current);
        timerId.current = null;
      }, refreshTimeout);
    },
    [onChange, refreshTimeout],
  );

  const onInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (autoRefresh) setSearchTimer(e.target.value);
    },
    [autoRefresh, setSearchTimer],
  );

  React.useEffect(() => {
    if (prevValue.current !== value) {
      prevValue.current = value;
      setInputValue(value);
    }
  }, [value]);

  const getClearButtonSize = () => {
    let clearButtonSize = 16;

    switch (size) {
      case InputSize.base:
        clearButtonSize = !!inputValue || showClearButton ? 12 : 16;
        break;
      case InputSize.middle:
        clearButtonSize = !!inputValue || showClearButton ? 16 : 18;
        break;
      case InputSize.big:
        clearButtonSize = !!inputValue || showClearButton ? 18 : 22;
        break;
      case InputSize.huge:
        clearButtonSize = !!inputValue || showClearButton ? 22 : 24;
        break;

      default:
        break;
    }

    return clearButtonSize;
  };

  const getIconNode = () => {
    const showCrossIcon = !!inputValue || showClearButton;
    const iconNode = (
      <ReactSVG
        className="icon-button_svg not-selectable"
        src={showCrossIcon ? CrossIconReactSvgUrl : SearchIconReactSvgUrl}
      />
    );

    return iconNode;
  };

  const clearButtonSize = getClearButtonSize();
  const iconNode = getIconNode();

  return (
    <StyledSearchInput
      className={className}
      style={style}
      isScale={scale}
      data-testid="search-input"
    >
      <InputBlock
        className="search-input-block"
        forwardedRef={forwardedRef}
        onClick={onClick}
        id={id}
        name={name}
        isDisabled={isDisabled}
        type={InputType.text}
        iconNode={iconNode}
        iconButtonClassName={
          !!inputValue || showClearButton ? "search-cross" : "search-loupe"
        }
        isIconFill
        iconSize={clearButtonSize}
        onIconClick={
          !!inputValue || showClearButton ? onClearSearchAction : undefined
        }
        size={size}
        scale
        value={inputValue}
        placeholder={placeholder}
        onChange={onInputChange}
        onFocus={onFocus}
      >
        {children}
      </InputBlock>
    </StyledSearchInput>
  );
};

export { SearchInput };
