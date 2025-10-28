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
import { Loader, LoaderTypes } from "../loader";
import { Tooltip } from "../tooltip";
import { ButtonProps } from "./Button.types";
import { ButtonSize } from "./Button.enums";
import styles from "./Button.module.scss";

export const Button = (props: React.PropsWithChildren<ButtonProps>) => {
  const {
    ref,
    label,
    primary,
    size = ButtonSize.normal,
    scale,
    icon,
    isDisabled,
    isLoading,
    isHovered,
    isClicked,
    className,
    testId = "button",
    type,
    id,
    minWidth,
    filled,
    filledStroke,
    style,
    tooltipText,
    ...rest
  } = props;

  const buttonClasses = classNames(
    styles.button,
    {
      [styles.primary]: primary,
      [styles.scale]: scale,
      [styles[size]]: size,
      [styles.filled]: filled,
      [styles.filledStroke]: filledStroke,
      [styles.isLoading]: isLoading,
      [styles.isHovered]: isHovered,
      [styles.isClicked]: isClicked,
      [styles.isDisabled]: isDisabled,
    },
    className,
  );

  const contentClasses = classNames(styles.buttonContent, {
    [styles.loading]: isLoading,
    "button-content": true,
  });

  const buttonStyle = minWidth ? { ...style, minWidth } : style;

  const tooltipId = tooltipText ? (id ?? "button-tooltip") : undefined;

  return (
    <>
      <button
        {...rest}
        id={id}
        ref={ref}
        type={type === "submit" ? "submit" : "button"}
        className={buttonClasses}
        disabled={isDisabled || isLoading}
        data-testid={testId}
        data-size={size}
        aria-label={label}
        aria-disabled={isDisabled ? "true" : undefined}
        aria-busy={isLoading ? "true" : undefined}
        style={buttonStyle}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipText}
      >
        {isLoading ? (
          <Loader
            id={id}
            className={classNames(styles.loader, "loader", {
              [styles.primary]: primary,
            })}
            size="20px"
            type={LoaderTypes.track}
            label={label}
            primary={primary}
            isDisabled={isDisabled}
          />
        ) : null}
        <div className={contentClasses}>
          {icon ? (
            <div className={classNames(styles.icon, "icon")}>{icon}</div>
          ) : null}
          {label}
        </div>
      </button>
      {tooltipText ? (
        <Tooltip id={tooltipId} place="bottom" offset={10} float />
      ) : null}
    </>
  );
};

Button.displayName = "Button";
