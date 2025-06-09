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

import React, { useRef, useEffect, useState, useCallback } from "react";
import copy from "copy-to-clipboard";
import classNames from "classnames";
import TextareaAutosize from "react-autosize-textarea";

import CopyIconUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";
import { isJSON } from "../../utils/json";

import { toastr } from "../toast";

import { IconButton } from "../icon-button";
import { Scrollbar } from "../scrollbar";
import { jsonify } from "./Textarea.utils";
import { TextareaProps } from "./Textarea.types";
import styles from "./Textarea.module.scss";

const Textarea = ({
  className,
  wrapperClassName,
  id,
  isDisabled = false,
  isReadOnly = false,
  hasError = false,
  heightScale = false,
  maxLength,
  name,
  onChange,
  placeholder = " ",
  style,
  tabIndex = -1,
  value = "",
  fontSize = 13,
  heightTextArea,
  color,
  autoFocus,
  areaSelect = false,
  isJSONField = false,
  copyInfoText = "Content was copied successfully!",
  enableCopy = false,
  hasNumeration = false,
  isFullHeight = false,
  classNameCopyIcon,
  isChatMode = false,
}: TextareaProps) => {
  const { isRTL } = useInterfaceDirection();

  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [isError, setIsError] = useState(hasError);
  const [isFocus, setIsFocus] = useState(false);
  const modifiedValue = jsonify(value, isJSONField);

  const calculateDimensions = useCallback(() => {
    const lineHeight = 1.5;
    const padding = 7;
    const numberOfLines = modifiedValue.split("\n").length;
    const fullHeight = numberOfLines * fontSize * lineHeight + padding + 4;
    const stringifiedHeight =
      typeof heightTextArea === "number"
        ? `${heightTextArea}px`
        : heightTextArea;

    const defaultPaddingLeft = 42;
    const numberOfDigits =
      String(numberOfLines).length - 2 > 0 ? String(numberOfLines).length : 0;
    const paddingLeftProp = hasNumeration
      ? fontSize < 13
        ? `${defaultPaddingLeft + numberOfDigits * 6}px`
        : `${((defaultPaddingLeft + numberOfDigits * 4) * fontSize) / 13}px`
      : "8px";

    return {
      fullHeight,
      stringifiedHeight,
      paddingLeftProp,
      numberOfLines,
    };
  }, [modifiedValue, fontSize, heightTextArea, hasNumeration]);

  const handleTextareaClick = useCallback(() => {
    if (areaRef.current && enableCopy) {
      areaRef.current.select();
    }
  }, [enableCopy]);

  const handleCopy = useCallback(() => {
    if (modifiedValue) {
      copy(modifiedValue);
      toastr.success(copyInfoText);
    }
  }, [modifiedValue, copyInfoText]);

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

  const { fullHeight, stringifiedHeight, paddingLeftProp, numberOfLines } =
    calculateDimensions();

  const numerationValue = Array.from(
    { length: numberOfLines },
    (_, index) => index + 1,
  ).join("\n");

  return (
    <div
      className={classNames(styles.wrapper, wrapperClassName, {
        [styles.heightScale]: heightScale,
        [styles.isFullHeight]: isFullHeight,
        [styles.defaultHeight]: !heightScale && !isFullHeight,
        [styles.isJSONField]: isJSONField && enableCopy,
        [styles.copy]: enableCopy,
        [styles.scrollbar]: isChatMode,
      })}
      style={
        {
          "--height-textarea": stringifiedHeight,
          "--full-height": `${fullHeight}px`,
        } as React.CSSProperties
      }
      onClick={handleTextareaClick}
    >
      {enableCopy ? (
        <IconButton
          className={`${styles.copyIconWrapper} ${classNameCopyIcon || ""}`}
          onClick={handleCopy}
          iconName={CopyIconUrl}
          size={16}
        />
      ) : null}

      <Scrollbar
        className={classNames(className, {
          [styles.heightScale]: heightScale,
          [styles.isFullHeight]: isFullHeight,
          [styles.defaultHeight]: !heightScale && !isFullHeight,
          [styles.hasError]: isError || hasError,
          [styles.isDisabled]: isDisabled,
          [styles.scrollbar]: !isChatMode,
        })}
        style={
          {
            ...style,
            "--height-textarea": stringifiedHeight,
            "--full-height": `${fullHeight}px`,
          } as React.CSSProperties
        }
        data-disabled={isDisabled}
        data-error={isError || hasError}
        data-focus={isFocus}
      >
        {hasNumeration ? (
          <pre
            className={styles.numeration}
            style={fontSize !== 13 ? { fontSize: `${fontSize}px` } : {}}
          >
            {numerationValue}
          </pre>
        ) : null}
        {/*  @ts-expect-error: Passing pointer events causes a React warning - "Unknown event handler". TextareaAutosize types are outdated */}
        <TextareaAutosize
          id={id}
          className={classNames(styles.textarea, {
            [styles.isJSONField]: isJSONField,
            [styles.hasError]: isError || hasError,
          })}
          placeholder={placeholder}
          onChange={onChange}
          maxLength={maxLength}
          name={name}
          tabIndex={tabIndex}
          disabled={isDisabled}
          readOnly={isReadOnly}
          value={isJSONField ? modifiedValue : value}
          style={
            {
              fontSize: `${fontSize}px`,
              color,
              "--padding-inline-start": paddingLeftProp,
            } as React.CSSProperties
          }
          autoFocus={autoFocus}
          ref={areaRef}
          dir="auto"
          data-dir={isRTL ? "rtl" : undefined}
          data-testid="textarea"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
        />
      </Scrollbar>
    </div>
  );
};

export { Textarea };
