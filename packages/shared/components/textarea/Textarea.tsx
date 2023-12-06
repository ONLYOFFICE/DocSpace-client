import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  StyledTextarea,
  StyledScrollbar,
  StyledCopyIcon,
  CopyIconWrapper,
  Wrapper,
  Numeration,
} from "./styled-textarea";
import { ColorTheme, ThemeType } from "../ColorTheme";
import Toast from "../toast";
import toastr from "../toast/toastr";
import { isJSON, beautifyJSON } from "./utils";

import copy from "copy-to-clipboard";

// eslint-disable-next-line react/prop-types, no-unused-vars

const jsonify = (value: any, isJSONField: any) => {
  if (isJSONField && value && isJSON(value)) {
    return beautifyJSON(value);
  }
  return value;
};

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
  fontSize,
  heightTextArea,
  color,
  theme,
  autoFocus,
  areaSelect,
  isJSONField,
  copyInfoText,
  enableCopy,
  hasNumeration,
  isFullHeight,
  classNameCopyIcon
}: any) => {
  const areaRef = useRef(null);
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

  for (let i = 1; i <= numberOfLines; i++) {
    numerationValue.push(i);
  }

  function onTextareaClick() {
    // @ts-expect-error TS(2531): Object is possibly 'null'.
    areaRef.current.select();
  }

  useEffect(() => {
    hasError !== isError && setIsError(hasError);
  }, [hasError]);

  useEffect(() => {
    setIsError(isJSONField && (!value || !isJSON(value)));
  }, [isJSONField, value]);

  useEffect(() => {
    if (areaSelect && areaRef.current) {
      // @ts-expect-error TS(2339): Property 'select' does not exist on type 'never'.
      areaRef.current.select();
    }
  }, [areaSelect]);

  const WrappedStyledCopyIcon = ({
    heightScale,
    isJSONField,
    ...props
  }: any) => (
    <StyledCopyIcon {...props} />
  );

  return (
    <Wrapper
      className="textarea-wrapper"
      // @ts-expect-error TS(2769): No overload matches this call.
      isJSONField={isJSONField}
      enableCopy={enableCopy}
      onClick={onTextareaClick}
    >
      {enableCopy && (
        <CopyIconWrapper
          className={classNameCopyIcon}
          // @ts-expect-error TS(2769): No overload matches this call.
          isJSONField={isJSONField}
          onClick={() => {
            copy(modifiedValue);
            // @ts-expect-error TS(2554): Expected 5 arguments, but got 1.
            toastr.success(copyInfoText);
          }}
        >
          <WrappedStyledCopyIcon heightScale={heightScale} />
        </CopyIconWrapper>
      )}
      // @ts-expect-error TS(2322): Type '{ children: any[]; themeId: string; classNam... Remove this comment to see the full error message
      <ColorTheme
        themeId={ThemeType.Textarea}
        className={className}
        style={style}
        stype="preMediumBlack"
        isDisabled={isDisabled}
        hasError={isError}
        heightScale={heightScale}
        heightTextArea={textareaHeight}
      >
        <Toast />

        {hasNumeration && (
          // @ts-expect-error TS(2769): No overload matches this call.
          <Numeration fontSize={fontSize}>
            {numerationValue.join("\n")}
          </Numeration>
        )}
        <StyledTextarea
          // @ts-expect-error TS(2769): No overload matches this call.
          id={id}
          paddingLeftProp={paddingLeftProp}
          isJSONField={isJSONField}
          enableCopy={enableCopy}
          placeholder={placeholder}
          onChange={(e: any) => onChange && onChange(e)}
          maxLength={maxLength}
          name={name}
          tabIndex={tabIndex}
          isDisabled={isDisabled}
          disabled={isDisabled}
          readOnly={isReadOnly}
          value={isJSONField ? modifiedValue : value}
          fontSize={fontSize}
          color={color}
          autoFocus={autoFocus}
          ref={areaRef}
          dir="auto"
        />
      </ColorTheme>
    </Wrapper>
  );
};

Textarea.propTypes = {

};

Textarea.defaultProps = {
  isDisabled: false,
  isReadOnly: false,
  hasError: false,
  heightScale: false,
  placeholder: " ",
  tabIndex: -1,
  value: "",
  fontSize: 13,
  isAutoFocussed: false,
  areaSelect: false,
  isJSONField: false,
  copyInfoText: "Content was copied successfully!",
  enableCopy: false,
  hasNumeration: false,
  isFullHeight: false,
};

export default Textarea;
