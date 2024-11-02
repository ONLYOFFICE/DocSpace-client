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

import React, { useRef, useState, useEffect } from "react";
import copy from "copy-to-clipboard";

import { toastr } from "../toast";

import {
  StyledTextarea,
  StyledCopyIcon,
  CopyIconWrapper,
  Wrapper,
  Numeration,
} from "./Textarea.styled";
import { isJSON, jsonify } from "./Textarea.utils";
import { TextareaProps } from "./Textarea.types";
import { TextareaTheme } from "./Textarea.theme";

const WrappedStyledCopyIcon = ({
  heightScale,
  isJSONField,
  ...props
}: TextareaProps) => <StyledCopyIcon {...props} />;

const Textarea = ({
  className,
  id,
  isDisabled,
  isReadOnly,
  hasError,
  heightScale,
  maxLength,
  name,
  onChange,
  placeholder,
  style,
  tabIndex,
  value,
  fontSize = 13,
  heightTextArea,
  color,
  autoFocus,
  areaSelect,
  isJSONField,
  copyInfoText,
  enableCopy,
  hasNumeration,
  isFullHeight,
  classNameCopyIcon,
}: TextareaProps) => {
  const areaRef = useRef<null | HTMLTextAreaElement>(null);
  const [isError, setIsError] = useState(hasError);
  const modifiedValue = jsonify(value, isJSONField);

  const lineHeight = 1.5;
  const padding = 7;
  const numberOfLines = modifiedValue.split("\n").length;
  const fullHeight = numberOfLines * fontSize * lineHeight + padding + 4;
  const stringifiedHeight =
    typeof heightTextArea === "number" ? `${heightTextArea}px` : heightTextArea;

  const defaultPaddingLeft = 42;
  const numberOfDigits =
    String(numberOfLines).length - 2 > 0 ? String(numberOfLines).length : 0;
  const paddingLeftProp = hasNumeration
    ? fontSize < 13
      ? `${defaultPaddingLeft + numberOfDigits * 6}px`
      : `${((defaultPaddingLeft + numberOfDigits * 4) * fontSize) / 13}px`
    : "8px";

  const numerationValue = [];

  for (let i = 1; i <= numberOfLines; i += 1) {
    numerationValue.push(i);
  }

  const onTextareaClick = () => {
    if (areaRef.current && enableCopy) areaRef.current.select();
  };

  useEffect(() => {
    setIsError(hasError);
  }, [hasError]);

  useEffect(() => {
    setIsError(isJSONField && (!value || !isJSON(value)));
  }, [isJSONField, value]);

  useEffect(() => {
    if (areaSelect && areaRef.current) {
      areaRef.current.select();
    }
  }, [areaSelect]);

  return (
    <Wrapper
      className="textarea-wrapper"
      isJSONField={isJSONField}
      enableCopy={enableCopy}
      onClick={onTextareaClick}
      data-testid="textarea"
      heightScale={heightScale}
      heightTextArea={stringifiedHeight}
      isFullHeight={isFullHeight}
      fullHeight={fullHeight}
    >
      {enableCopy && (
        <CopyIconWrapper
          className={classNameCopyIcon}
          isJSONField={isJSONField || false}
          onClick={() => {
            copy(modifiedValue);

            toastr.success(copyInfoText);
          }}
        >
          <WrappedStyledCopyIcon heightScale={heightScale} />
        </CopyIconWrapper>
      )}

      <TextareaTheme
        className={className}
        style={style}
        isDisabled={isDisabled}
        hasError={isError || hasError}
        heightScale={heightScale}
        heightTextAreaProp={stringifiedHeight}
        isFullHeight={isFullHeight}
        fullHeight={fullHeight}
      >
        {hasNumeration && (
          <Numeration fontSize={`${fontSize}px`}>
            {numerationValue.join("\n")}
          </Numeration>
        )}
        <StyledTextarea
          id={id}
          paddingLeftProp={paddingLeftProp}
          isJSONField={isJSONField}
          enableCopy={enableCopy}
          placeholder={placeholder}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange?.(e)
          }
          maxLength={maxLength}
          name={name}
          tabIndex={tabIndex}
          isDisabled={isDisabled}
          disabled={isDisabled || false}
          readOnly={isReadOnly || false}
          value={isJSONField ? modifiedValue : value}
          fontSize={fontSize}
          color={color}
          autoFocus={autoFocus}
          ref={areaRef}
          dir="auto"
          minHeight={stringifiedHeight}
        />
      </TextareaTheme>
    </Wrapper>
  );
};

Textarea.defaultProps = {
  isDisabled: false,
  isReadOnly: false,
  hasError: false,
  heightScale: false,
  placeholder: " ",
  tabIndex: -1,
  value: "",
  isAutoFocussed: false,
  areaSelect: false,
  isJSONField: false,
  copyInfoText: "Content was copied successfully!",
  enableCopy: false,
  hasNumeration: false,
  isFullHeight: false,
};

export { Textarea };
