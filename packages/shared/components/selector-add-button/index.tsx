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

import React from "react";
import classNames from "classnames";
import ActionsHeaderTouchReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";

import { useTheme } from "../../hooks/useTheme";
import { TextWithTooltip as Text } from "../text";
import { IconButton } from "../icon-button";
import { DivWithTooltip } from "../tooltip";
import styles from "./SelectorAddButton.module.scss";
import { SelectorAddButtonProps } from "./SelectorAddButton.types";
import { Loader, LoaderTypes } from "../loader";

const SelectorAddButton = (props: SelectorAddButtonProps) => {
  const {
    isDisabled = false,
    isAction,
    title,
    className,
    id,
    style,
    iconName = ActionsHeaderTouchReactSvgUrl,
    onClick,
    iconSize = 12,
    size,

    label,
    titleText,
    fontSize = "13px",
    lineHeight = "20px",
    noSelect,
    dir,
    truncate,

    testId = "selector-add-button",
    isLoading = false,
    ...rest
  } = props;

  const { currentColorScheme } = useTheme();
  const mainAccentColor = currentColorScheme?.main?.accent;

  const onClickAction = (e: React.MouseEvent) => {
    if (!isDisabled && !isLoading) onClick?.(e);
  };

  const buttonClassName = classNames(styles.selectorButton, {
    [styles.isAction]: isAction,
    [styles.isDisabled]: isDisabled,
    [styles.isLoading]: isLoading,
    // [styles.isSize]: !!size,
  });

  const containerClassName = classNames(
    styles.container,
    {
      [styles.isDisabled]: isDisabled,
      [styles.truncate]: truncate,
    },
    className,
  );

  const buttonStyle = mainAccentColor
    ? ({
        ...style,
        "--main-accent-button": `${mainAccentColor}1A`,
        "--selector-add-button-size": size,
      } as React.CSSProperties)
    : style;

  const ButtonWrapper = title ? DivWithTooltip : "div";

  return (
    <div
      data-testid="selector-add-button-container"
      className={containerClassName}
    >
      <ButtonWrapper
        {...rest}
        id={id}
        style={buttonStyle}
        title={title}
        className={buttonClassName}
        onClick={onClickAction}
        data-testid={testId}
      >
        {isLoading ? (
          <Loader color="" size="20px" type={LoaderTypes.track} />
        ) : (
          <IconButton
            size={iconSize}
            iconName={iconName}
            isFill
            isDisabled={isDisabled}
            isClickable={!isDisabled}
          />
        )}
      </ButtonWrapper>

      {label ? (
        <Text
          className={styles.selectorText}
          fontWeight={600}
          lineHeight={lineHeight}
          onClick={onClickAction}
          title={titleText}
          fontSize={fontSize}
          noSelect={noSelect}
          dir={dir}
          truncate={truncate}
        >
          {label}
        </Text>
      ) : null}
    </div>
  );
};

export { SelectorAddButton };
