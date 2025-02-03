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

import { Label } from "../label";
import { HelpButton } from "../help-button";
import { Text } from "../text";

import Container from "./FieldContainer.styled";
import { FieldContainerProps } from "./FieldContainer.types";

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
  //   helpButtonHeaderContent,
  place = "bottom",
  hasError,
  children,
  errorMessage,
  errorColor,
  testId = "field-container",
}: FieldContainerProps) => {
  return (
    <Container
      vertical={isVertical}
      labelWidth={maxLabelWidth}
      className={className}
      id={id}
      style={style}
      maxwidth={errorMessageWidth}
      removeMargin={removeMargin}
      data-testid={testId}
    >
      {labelVisible ? (
        !inlineHelpButton ? (
          <div className="field-label-icon">
            <Label
              isRequired={isRequired}
              // error={hasError}
              text={labelText}
              truncate
              className="field-label"
              tooltipMaxWidth={tooltipMaxWidth}
              htmlFor=""
            />
            {tooltipContent ? (
              <HelpButton
                className={tooltipClass}
                tooltipContent={tooltipContent}
                place={place}
                // helpButtonHeaderContent={helpButtonHeaderContent}
              />
            ) : null}
          </div>
        ) : (
          <div className="field-label-icon">
            <Label
              isRequired={isRequired}
              htmlFor=""
              // error={hasError}
              text={labelText}
              truncate
              className="field-label"
            >
              {tooltipContent ? (
                <HelpButton
                  className={tooltipClass}
                  tooltipContent={tooltipContent}
                  place={place}
                  //   helpButtonHeaderContent={helpButtonHeaderContent}
                  style={displayInlineBlock}
                  offsetRight={0}
                />
              ) : null}
            </Label>
          </div>
        )
      ) : null}

      <div className="field-body">
        {children}
        {hasError && errorMessage ? (
          <Text className="error-label" fontSize="12px" color={errorColor}>
            {errorMessage}
          </Text>
        ) : null}
      </div>
    </Container>
  );
};

export { FieldContainer };
