import React from "react";
import { ReactSVG } from "react-svg";

import CrossIconReactSvgUrl from "PUBLIC_DIR/images/cross.react.svg?url";
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
      >
        {children}
      </InputBlock>
    </StyledSearchInput>
  );
};

export { SearchInput };
