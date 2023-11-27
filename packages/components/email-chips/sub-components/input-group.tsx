import React, { memo, useState } from "react";
import PropTypes from "prop-types";

import Link from "../../link";
import TextInput from "../../text-input";

import { StyledInputWithLink, StyledTooltip } from "../styled-emailchips";
import { EmailSettings, parseAddresses } from "../../utils/email";

const InputGroup = memo(
  ({
    // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type '{}'... Remove this comment to see the full error message
    placeholder,
    // @ts-expect-error TS(2339): Property 'exceededLimitText' does not exist on typ... Remove this comment to see the full error message
    exceededLimitText,
    // @ts-expect-error TS(2339): Property 'existEmailText' does not exist on type '... Remove this comment to see the full error message
    existEmailText,
    // @ts-expect-error TS(2339): Property 'exceededLimitInputText' does not exist o... Remove this comment to see the full error message
    exceededLimitInputText,
    // @ts-expect-error TS(2339): Property 'clearButtonLabel' does not exist on type... Remove this comment to see the full error message
    clearButtonLabel,

    // @ts-expect-error TS(2339): Property 'inputRef' does not exist on type '{}'.
    inputRef,
    // @ts-expect-error TS(2339): Property 'containerRef' does not exist on type '{}... Remove this comment to see the full error message
    containerRef,

    // @ts-expect-error TS(2339): Property 'maxLength' does not exist on type '{}'.
    maxLength,

    // @ts-expect-error TS(2339): Property 'isExistedOn' does not exist on type '{}'... Remove this comment to see the full error message
    isExistedOn,
    // @ts-expect-error TS(2339): Property 'isExceededLimitChips' does not exist on ... Remove this comment to see the full error message
    isExceededLimitChips,
    // @ts-expect-error TS(2339): Property 'isExceededLimitInput' does not exist on ... Remove this comment to see the full error message
    isExceededLimitInput,

    // @ts-expect-error TS(2339): Property 'goFromInputToChips' does not exist on ty... Remove this comment to see the full error message
    goFromInputToChips,
    // @ts-expect-error TS(2339): Property 'onClearClick' does not exist on type '{}... Remove this comment to see the full error message
    onClearClick,
    // @ts-expect-error TS(2339): Property 'onHideAllTooltips' does not exist on typ... Remove this comment to see the full error message
    onHideAllTooltips,
    // @ts-expect-error TS(2339): Property 'showTooltipOfLimit' does not exist on ty... Remove this comment to see the full error message
    showTooltipOfLimit,
    // @ts-expect-error TS(2339): Property 'onAddChip' does not exist on type '{}'.
    onAddChip,
  }) => {
    const [value, setValue] = useState("");

    const onInputChange = (e: any) => {
      setValue(e.target.value);
      onHideAllTooltips();
      if (e.target.value.length >= maxLength) showTooltipOfLimit();
    };

    const onInputKeyDown = (e: any) => {
      const code = e.code;

      switch (code) {
        case "Enter":
        case "NumpadEnter": {
          onEnterPress();
          break;
        }
        case "ArrowLeft": {
          const isCursorStart = inputRef.current.selectionStart === 0;
          if (!isCursorStart) return;
          goFromInputToChips();
          if (inputRef) {
            onHideAllTooltips();
            inputRef.current.blur();
            containerRef.current.setAttribute("tabindex", "0");
            containerRef.current.focus();
          }
        }
      }
    };

    const onEnterPress = () => {
      if (isExceededLimitChips) return;
      if (isExistedOn) return;
      if (value.trim().length == 0) return;
      const settings = new EmailSettings();
      settings.allowName = true;
      // @ts-expect-error TS(7006): Parameter 'it' implicitly has an 'any' type.
      const chipsFromString = parseAddresses(value, settings).map((it) => ({
        name: it.name === "" ? it.email : it.name,
        email: it.email,
        isValid: it.isValid(),
        parseErrors: it.parseErrors,
      }));
      onAddChip(chipsFromString);
      setValue("");
    };

    return (
      <StyledInputWithLink>
        {isExistedOn && <StyledTooltip>{existEmailText}</StyledTooltip>}
        {isExceededLimitChips && (
          <StyledTooltip>{exceededLimitText}</StyledTooltip>
        )}
        {isExceededLimitInput && (
          <StyledTooltip>{exceededLimitInputText}</StyledTooltip>
        )}

        <TextInput
          value={value}
          onChange={onInputChange}
          forwardedRef={inputRef}
          onKeyDown={onInputKeyDown}
          placeholder={placeholder}
          withBorder={false}
          className="textInput"
          maxLength={maxLength}
        />
        <Link
          type="action"
          isHovered={true}
          className="link"
          onClick={onClearClick}
        >
          {clearButtonLabel}
        </Link>
      </StyledInputWithLink>
    );
  }
);

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'Named... Remove this comment to see the full error message
InputGroup.propTypes = {
  inputRef: PropTypes.shape({ current: PropTypes.any }),
  containerRef: PropTypes.shape({ current: PropTypes.any }),

  placeholder: PropTypes.string,
  exceededLimitText: PropTypes.string,
  existEmailText: PropTypes.string,
  exceededLimitInputText: PropTypes.string,
  clearButtonLabel: PropTypes.string,

  maxLength: PropTypes.number,

  goFromInputToChips: PropTypes.func,
  onClearClick: PropTypes.func,
  isExistedOn: PropTypes.bool,
  isExceededLimitChips: PropTypes.bool,
  isExceededLimitInput: PropTypes.bool,
  onHideAllTooltips: PropTypes.func,
  showTooltipOfLimit: PropTypes.func,
  onAddChip: PropTypes.func,
};

InputGroup.displayName = "InputGroup";

export default InputGroup;
