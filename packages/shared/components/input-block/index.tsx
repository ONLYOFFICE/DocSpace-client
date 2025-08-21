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

import React, { useCallback, useMemo, useState } from "react";
import classNames from "classnames";

import { InputSize, TextInput } from "../text-input";
import { IconButton } from "../icon-button";

import { InputBlockProps } from "./InputBlock.types";
import styles from "./InputBlock.module.scss";

const InputBlock = React.memo(
  ({
    // Input props
    id,
    name,
    type,
    value = "",
    placeholder,
    tabIndex = -1,
    maxLength = 255,
    autoComplete = "off",
    mask,
    keepCharPositions = false,

    // State props
    hasError = false,
    hasWarning = false,
    isDisabled = false,
    isReadOnly,
    isAutoFocussed,
    scale = false,

    // Icon props
    iconName = "",
    iconNode,
    iconSize,
    iconColor,
    hoverColor,
    iconButtonClassName = "",
    isIconFill = false,
    noIcon = false,

    // Event handlers
    onChange,
    onIconClick,
    onBlur,
    onFocus,
    onKeyDown,
    onClick,

    // Style props
    size,
    className,
    style,

    // Other props
    children,
    forwardedRef,
    testId,
    dataTestId,
  }: InputBlockProps) => {
    const [isFocus, setIsFocus] = useState(isAutoFocussed);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e),
      [onChange],
    );

    const handleIconClick = useCallback(
      (e: React.MouseEvent) => onIconClick?.(e),
      [onIconClick],
    );

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocus(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocus(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const inputProps = {
      id,
      type,
      name,
      value,
      placeholder,
      maxLength,
      autoComplete,
      mask,
      keepCharPositions,
      isDisabled,
      hasError,
      hasWarning,
      isReadOnly,
      isAutoFocussed,
      scale,
      size,
      withBorder: false,
      forwardedRef,
      onClick,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown,
      tabIndex,
      onChange: handleChange,
      testId,
    };

    const inputGroupClassName = classNames(styles.inputGroup, className, {
      [styles.error]: hasError,
      [styles.warning]: hasWarning,
      [styles.disabled]: isDisabled,
    });

    return (
      <div
        className={inputGroupClassName}
        style={style}
        data-testid={dataTestId || "input-block"}
        data-size={size}
        data-scale={scale}
        data-error={hasError}
        data-focus={isFocus}
        data-warning={hasWarning}
        data-disabled={isDisabled}
      >
        {children ? (
          <div className={styles.prepend}>
            <div className={styles.childrenBlock}>{children}</div>
          </div>
        ) : null}

        <TextInput {...inputProps} />

        {!noIcon && !isDisabled ? (
          <div className="append">
            <div
              className={`${styles.iconBlock} ${iconButtonClassName} input-block-icon`}
              onClick={handleIconClick}
              data-size={size}
            >
              <IconButton
                size={size}
                iconNode={iconNode}
                iconName={iconName}
                className="input-block-icon"
                isFill={isIconFill}
                isClickable={typeof onIconClick === "function"}
                color={iconColor}
                isDisabled={typeof onIconClick !== "function"}
                hoverColor={hoverColor}
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

InputBlock.displayName = "InputBlock";

export { InputBlock };
