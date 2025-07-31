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

import React, {
  useCallback,
  useRef,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
} from "react";
import { TooltipRefProps } from "react-tooltip";
import classNames from "classnames";

import EyeReactSvg from "PUBLIC_DIR/images/eye.react.svg";
import EyeOffReactSvg from "PUBLIC_DIR/images/eye.off.react.svg";

import { InputBlock } from "../input-block";
import { Link, LinkType } from "../link";
import { Text } from "../text";
import { Tooltip } from "../tooltip";
import { InputType } from "../text-input";

import { PasswordInputProps, TPasswordSettings } from "./PasswordInput.types";
import { globalColors } from "../../themes";

import {
  usePasswordGenerator,
  usePasswordInput,
  usePasswordState,
  usePasswordValidation,
} from "./hooks";

import styles from "./PasswordInput.module.scss";
import { useInterfaceDirection } from "../../hooks/useInterfaceDirection";

export type { PasswordInputHandle } from "./PasswordInput.types";

const DEFAULT_PASSWROD_SETTINGS = {
  minLength: 8,
  upperCase: false,
  digits: false,
  specSymbols: false,
  digitsRegexStr: "(?=.*\\d)",
  upperCaseRegexStr: "(?=.*[A-Z])",
  specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
};

const PasswordInput = ({
  ref,
  inputType = InputType.password,
  inputValue,
  clipActionResource,
  emailInputName,
  passwordSettings = DEFAULT_PASSWROD_SETTINGS,
  onBlur,
  onKeyDown,
  onValidateInput,
  onChange,
  isDisabled = false,
  simpleView = false,
  generatorSpecial = "!@#$%^&*",
  clipCopiedResource = "Copied",
  tooltipPasswordTitle,
  tooltipPasswordLength,
  tooltipPasswordDigits,
  tooltipPasswordCapital,
  tooltipPasswordSpecial,
  generatePasswordTitle,
  inputName = "passwordInput",
  scale = true,
  size,
  hasError,
  hasWarning,
  placeholder,
  tabIndex,
  maxLength,
  id,
  autoComplete = "new-password",
  forwardedRef,
  isDisableTooltip = false,
  inputWidth,
  className = "",
  style,
  isFullWidth = false,
  isAutoFocussed,
  tooltipAllowedCharacters,
  isSimulateType = false,
  testId,

  // clipEmailResource = "E-mail ",
  // clipPasswordResource = "Password ",
  simulateSymbol = "•",
}: PasswordInputProps) => {
  const usePrevious = (value: string) => {
    const inputValueRef = useRef<string>(undefined);
    useEffect(() => {
      inputValueRef.current = value;
    });
    return inputValueRef.current;
  };

  const prevInputValue = usePrevious(inputValue ?? "") ?? "";

  const { state, setState } = usePasswordState(
    inputType,
    inputValue,
    clipActionResource,
    emailInputName,
  );

  const { checkPassword } = usePasswordValidation(
    passwordSettings,
    onValidateInput,
  );
  const { refTooltip, onChangeAction } = usePasswordInput(
    isSimulateType,
    simulateSymbol,
    simpleView,
    state.type,
    checkPassword,
    setState,
    onChange,
    state.value,
  );
  const { onGeneratePassword } = usePasswordGenerator(
    generatorSpecial,
    passwordSettings,
    isDisabled,
    state.type,
    onChangeAction,
    checkPassword,
    setState,
  );

  const { isRTL } = useInterfaceDirection();

  const changeInputType = React.useCallback(() => {
    const newType =
      state.type === InputType.text ? InputType.password : InputType.text;

    setState((s) => ({
      ...s,
      type: newType,
    }));
  }, [setState, state.type]);

  React.useEffect(() => {
    if (isDisabled && state.type === InputType.text) {
      changeInputType();
    }
  }, [isDisabled, changeInputType, state.type]);

  const refProgress = useRef(null);
  const refTooltipContent = useRef(null);

  const onBlurAction = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      e.persist();
      if (onBlur) onBlur(e);
    },
    [onBlur],
  );

  const onFocusAction = () => {
    const length = state.value?.length ?? 0;

    const minLength = passwordSettings?.minLength;

    if ((minLength && length < minLength) || hasError || hasWarning) {
      if (refTooltip.current) {
        const tooltip = refTooltip.current as TooltipRefProps;

        tooltip?.open?.();
      }
    }
  };

  const handleClickOutside = React.useCallback(
    (event: Event) => {
      if (refTooltip.current && refTooltipContent.current) {
        const target = event.target as HTMLElement;
        const tooltip = refTooltip.current as TooltipRefProps;
        const tooltipContent = refTooltipContent.current as HTMLElement;
        if (
          !tooltip ||
          !tooltip.isOpen ||
          tooltip.activeAnchor?.contains(target) ||
          tooltipContent?.parentElement?.contains(target)
        )
          return;

        tooltip.close();
      }
    },
    [refTooltip],
  );

  React.useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const onKeyDownAction = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      e.persist();
      if (onKeyDown) onKeyDown(e);
    },
    [onKeyDown],
  );

  React.useEffect(() => {
    setState((s) => ({ ...s, copyLabel: clipActionResource }));
  }, [clipActionResource, clipCopiedResource, setState]);

  useEffect(() => {
    if (
      (isSimulateType && inputValue !== prevInputValue) ||
      (inputValue === "" && prevInputValue !== "")
    ) {
      onChangeAction?.({
        target: { value: inputValue },
      } as ChangeEvent<HTMLInputElement>);
    }
  }, [inputValue, prevInputValue, isSimulateType, onChangeAction]);

  React.useImperativeHandle(ref, () => {
    return { onGeneratePassword, setState, value: state.value };
  }, [onGeneratePassword, setState, state.value]);

  const renderTextTooltip = (
    settings?: TPasswordSettings,
    length?: number,
    digits?: string,
    capital?: string,
    special?: string,
  ) => {
    return (
      <>
        <div className="break" />
        <Text
          className="text-tooltip"
          fontSize="10px"
          color={globalColors.gray}
          as="span"
        >
          {settings?.minLength ? length : null}{" "}
          {settings?.digits ? `, ${digits}` : null}{" "}
          {settings?.upperCase ? `, ${capital}` : null}{" "}
          {settings?.specSymbols ? `, ${special}` : null}
        </Text>
        <div className="break" />
      </>
    );
  };

  const renderTooltipContent = () => (
    <div className={styles.tooltip} ref={refTooltipContent}>
      <Text
        as="div"
        fontSize="12px"
        className={styles.tooltipContainer}
        title={tooltipPasswordTitle}
      >
        {tooltipPasswordTitle}
        <Text
          as="div"
          title={tooltipPasswordLength}
          color={
            state.validLength
              ? globalColors.lightStatusPositive
              : globalColors.lightErrorStatus
          }
        >
          {tooltipPasswordLength}
        </Text>
        {passwordSettings?.digits ? (
          <Text
            as="div"
            title={tooltipPasswordDigits}
            color={
              state.validDigits
                ? globalColors.lightStatusPositive
                : globalColors.lightErrorStatus
            }
          >
            {tooltipPasswordDigits}
          </Text>
        ) : null}
        {passwordSettings?.upperCase ? (
          <Text
            as="div"
            title={tooltipPasswordCapital}
            color={
              state.validCapital
                ? globalColors.lightStatusPositive
                : globalColors.lightErrorStatus
            }
          >
            {tooltipPasswordCapital}
          </Text>
        ) : null}
        {passwordSettings?.specSymbols ? (
          <Text
            as="div"
            title={tooltipPasswordSpecial}
            color={
              state.validSpecial
                ? globalColors.lightStatusPositive
                : globalColors.lightErrorStatus
            }
          >
            {tooltipPasswordSpecial}
          </Text>
        ) : null}

        {tooltipAllowedCharacters}

        {generatePasswordTitle ? (
          <div className="generate-btn-container">
            <Link
              className="generate-btn"
              type={LinkType.action}
              fontWeight="600"
              isHovered
              onClick={onGeneratePassword}
              dataTestId="generate_password_link"
            >
              {generatePasswordTitle}
            </Link>
          </div>
        ) : null}
      </Text>
    </div>
  );

  const renderInputGroup = () => {
    const { type, value } = state;
    const iconNode =
      type === "password" ? (
        <EyeOffReactSvg
          data-testid={testId ? `${testId}_eye_icon` : undefined}
        />
      ) : (
        <EyeReactSvg data-testid={testId ? `${testId}_eye_icon` : undefined} />
      );
    const iconButtonClassName = `password_eye--${
      type === "password" ? "close" : "open"
    }`;

    const copyPassword = value ?? "";
    const bullets = copyPassword.replace(/(.)/g, simulateSymbol);

    return (
      <>
        <InputBlock
          id={id}
          className="input-relative"
          name={inputName}
          hasError={hasError}
          isDisabled={isDisabled}
          iconNode={iconNode}
          iconButtonClassName={iconButtonClassName}
          value={
            isSimulateType && type === "password" ? bullets : (value ?? "")
          }
          onIconClick={changeInputType}
          onChange={onChangeAction}
          scale={scale}
          size={size}
          type={isSimulateType ? InputType.text : type}
          iconSize={16}
          isIconFill
          onBlur={onBlurAction}
          onFocus={onFocusAction}
          onKeyDown={onKeyDownAction}
          hasWarning={hasWarning}
          placeholder={placeholder}
          tabIndex={tabIndex}
          maxLength={maxLength}
          autoComplete={autoComplete}
          forwardedRef={forwardedRef}
          isAutoFocussed={isAutoFocussed}
          testId={testId}
        />

        {!isDisableTooltip && !isDisabled ? (
          <Tooltip
            place="top"
            clickable
            openOnClick
            anchorSelect="div[id='tooltipContent'] input"
            ref={refTooltip}
            imperativeModeOnly
          >
            {renderTooltipContent()}
          </Tooltip>
        ) : null}
      </>
    );
  };

  return (
    <div
      className={classNames(
        styles.styledInput,
        {
          [styles.rtlStyledInput]: isRTL,
          [styles.fullWidth]: isFullWidth,
          [styles.disabled]: isDisabled,
        },
        className,
      )}
      style={style}
      data-testid="password-input"
      data-scale={scale}
      data-warning={hasWarning}
      data-error={hasError}
      data-disabled={isDisabled}
    >
      {simpleView ? (
        <>
          {renderInputGroup()}
          {renderTextTooltip()}
        </>
      ) : (
        <>
          <div className="password-field-wrapper">
            <div
              id="tooltipContent"
              data-testid="tooltipContent"
              ref={refProgress}
              className={classNames(styles.passwordProgress, {
                [styles.withInputWidth]: inputWidth,
              })}
              style={inputWidth ? { width: inputWidth } : {}}
            >
              {renderInputGroup()}
            </div>
          </div>
          {renderTextTooltip()}
        </>
      )}
    </div>
  );
};

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
