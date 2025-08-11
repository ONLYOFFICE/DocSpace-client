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

import { Label } from "../label";
import { HelpButton } from "../help-button";
import { Text } from "../text";

import { FieldContainerProps } from "./FieldContainer.types";
import styles from "./FieldContainer.module.scss";

const displayInlineBlock = { display: "inline-block" };

const FieldContainer = ({
  isVertical,
  maxLabelWidth = "110px",
  className,
  id,
  style,
  errorMessageWidth = "293px",
  removeMargin = false,
  labelVisible = false,
  inlineHelpButton,
  isRequired,
  labelText,
  tooltipMaxWidth,
  tooltipContent,
  tooltipClass,
  place = "bottom",
  hasError,
  children,
  errorMessage,
  errorColor,
  dataTestId,
}: FieldContainerProps) => {
  const containerStyle = {
    ...style,
    "--label-width": maxLabelWidth,
  } as React.CSSProperties;

  const errorContainerStyle = {
    ...style,
    "--error-width": errorMessageWidth,
    "--error-color": errorColor,
  } as React.CSSProperties;

  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.vertical]: isVertical,
          [styles.horizontal]: !isVertical,
          [styles.noMargin]: removeMargin,
        },
        className,
      )}
      id={id}
      style={containerStyle}
      data-testid={dataTestId ?? "field-container"}
      data-vertical={isVertical}
      data-label-width={maxLabelWidth}
    >
      {labelVisible ? (
        !inlineHelpButton ? (
          <div className={styles.fieldLabelIcon}>
            <Label
              isRequired={isRequired}
              text={labelText}
              truncate
              className={styles.fieldLabel}
              tooltipMaxWidth={tooltipMaxWidth}
              htmlFor=""
            />
            {tooltipContent ? (
              <HelpButton
                className={classNames(styles.iconButton, tooltipClass)}
                tooltipContent={tooltipContent}
                place={place}
                dataTestId={
                  dataTestId ? `${dataTestId}_help_button` : undefined
                }
              />
            ) : null}
          </div>
        ) : (
          <div className={styles.fieldLabelIcon}>
            <Label
              isRequired={isRequired}
              htmlFor=""
              text={labelText}
              truncate
              className={styles.fieldLabel}
            >
              {tooltipContent ? (
                <HelpButton
                  className={classNames(styles.iconButton, tooltipClass)}
                  tooltipContent={tooltipContent}
                  place={place}
                  style={displayInlineBlock}
                  offsetRight={0}
                  dataTestId={
                    dataTestId ? `${dataTestId}_help_button` : undefined
                  }
                />
              ) : null}
            </Label>
          </div>
        )
      ) : null}

      <div className={`${styles.fieldBody} field-body`}>
        {children}
        {hasError && errorMessage ? (
          <Text
            className={styles.errorContainer}
            style={errorContainerStyle}
            fontSize="12px"
            color={errorColor}
          >
            {errorMessage}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export { FieldContainer };
