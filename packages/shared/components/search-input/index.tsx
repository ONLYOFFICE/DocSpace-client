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

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  ChangeEvent,
} from "react";
import classNames from "classnames";

import CrossIconReactSvg from "PUBLIC_DIR/images/icons/12/cross.react.svg";
import SearchIconReactSvg from "PUBLIC_DIR/images/search.react.svg";

import { useDebounce } from "../../hooks/useDebounce";

import { InputBlock } from "../input-block";
import { InputSize, InputType } from "../text-input";

import styles from "./SearchInput.module.scss";
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
  resetOnBlur = false,
  children,
}: SearchInputProps) => {
  const [inputValue, setInputValue] = useState(value);

  const afterClear = useRef(false);
  const prevValueRef = useRef(value);

  const debouncedOnChange = useDebounce(
    useCallback(() => {
      if (!afterClear.current) {
        onChange?.(prevValueRef.current);
      }
    }, [onChange]),
    refreshTimeout,
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      prevValueRef.current = newValue;
      afterClear.current = false;
      if (autoRefresh) {
        debouncedOnChange(newValue);
      }
    },
    [autoRefresh, debouncedOnChange],
  );

  const handleClearSearch = useCallback(() => {
    setInputValue("");
    prevValueRef.current = "";
    afterClear.current = true;
    onClearSearch?.();
  }, [onClearSearch]);

  const handleBlur = useCallback(() => {
    // Reset to the external value when focus is lost if they don't match
    if (resetOnBlur && inputValue !== value) {
      setInputValue(value);
      prevValueRef.current = value;
    }
  }, [inputValue, value, resetOnBlur]);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      setInputValue(value);
    }
  }, [value]);

  const clearButtonSize = React.useMemo(() => {
    let buttonSize = 16;

    switch (size) {
      case InputSize.base:
        buttonSize = !!inputValue || showClearButton ? 12 : 16;
        break;
      case InputSize.middle:
        buttonSize = !!inputValue || showClearButton ? 16 : 18;
        break;
      case InputSize.big:
        buttonSize = !!inputValue || showClearButton ? 18 : 22;
        break;
      case InputSize.huge:
        buttonSize = !!inputValue || showClearButton ? 22 : 24;
        break;

      default:
        break;
    }

    return buttonSize;
  }, [size, inputValue, showClearButton]);

  const getIconNode = () => {
    const showCrossIcon = !!inputValue || showClearButton;

    const iconNode = (
      <div className="icon-button_svg not-selectable">
        {showCrossIcon ? <CrossIconReactSvg /> : <SearchIconReactSvg />}
      </div>
    );

    return iconNode;
  };

  const iconNode = getIconNode();

  return (
    <div
      className={classNames(
        styles.searchInputBlock,
        { [styles.scale]: scale, [styles.isFilled]: !!inputValue },
        className,
      )}
      id={id}
      style={style}
      data-testid="search-input"
    >
      <InputBlock
        className="search-input-block"
        forwardedRef={forwardedRef}
        onClick={onClick}
        id={id}
        name={name}
        value={inputValue}
        size={size}
        scale={scale}
        isDisabled={isDisabled}
        onChange={handleInputChange}
        onFocus={onFocus}
        onBlur={handleBlur}
        type={InputType.text}
        iconNode={iconNode}
        iconButtonClassName={
          !!inputValue || showClearButton ? "search-cross" : "search-loupe"
        }
        isIconFill
        iconSize={clearButtonSize}
        onIconClick={
          !!inputValue || showClearButton ? handleClearSearch : undefined
        }
        placeholder={placeholder}
      >
        {children}
      </InputBlock>
    </div>
  );
};

export { SearchInput };
