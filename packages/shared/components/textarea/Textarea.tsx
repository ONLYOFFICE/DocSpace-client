import React, { useRef, useState, useEffect } from "react";
import copy from "copy-to-clipboard";

import { Toast, toastr } from "../toast";

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
  const textareaHeight = isFullHeight
    ? numberOfLines * fontSize * lineHeight + padding + 4
    : heightTextArea;

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
    if (hasError !== isError) setIsError(hasError);
  }, [hasError, isError]);

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
        hasError={isError}
        heightScale={heightScale}
        heightTextArea={textareaHeight}
      >
        <Toast />

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
