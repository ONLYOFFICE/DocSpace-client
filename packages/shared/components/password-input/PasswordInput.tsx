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

import React, {
  useCallback,
  useRef,
  useState,
  KeyboardEvent,
  ChangeEvent,
  FocusEvent,
  MouseEvent,
} from "react";
import { TooltipRefProps } from "react-tooltip";

// import equal from "fast-deep-equal/react";

import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";

import { InputBlock } from "../input-block";
import { Link, LinkType } from "../link";
import { Text } from "../text";
import { Tooltip } from "../tooltip";
import { InputType } from "../text-input";

import {
  PasswordProgress,
  StyledInput,
  TooltipStyle,
  StyledTooltipContainer,
  StyledTooltipItem,
} from "./PasswordInput.styled";
import {
  PasswordInputProps,
  TPasswordSettings,
  TPasswordValidation,
} from "./PasswordInput.types";

const PasswordInput = React.forwardRef(
  (
    {
      inputType = InputType.password,
      inputValue,
      clipActionResource,
      emailInputName,
      onBlur,
      onKeyDown,
      onValidateInput,
      onChange,
      isDisabled,
      simpleView,
      passwordSettings,
      generatorSpecial,

      clipCopiedResource,

      tooltipPasswordTitle,
      tooltipPasswordLength,
      tooltipPasswordDigits,
      tooltipPasswordCapital,
      tooltipPasswordSpecial,
      generatePasswordTitle,
      inputName,
      scale,
      size,
      hasError,
      hasWarning,
      placeholder,
      tabIndex,
      maxLength,
      id,
      autoComplete,
      forwardedRef,
      isDisableTooltip,
      inputWidth,
      className,
      style,
      isFullWidth,
      tooltipOffsetLeft,
      tooltipOffsetTop,
      isAutoFocussed,
    }: PasswordInputProps,
    ref,
  ) => {
    const [state, setState] = useState({
      type: inputType,
      value: inputValue,
      copyLabel: clipActionResource,
      disableCopyAction: !emailInputName,
      displayTooltip: false,
      validLength: false,
      validDigits: false,
      validCapital: false,
      validSpecial: false,
    });

    const refProgress = useRef(null);
    const refTooltip = useRef(null);
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

    const handleClickOutside = React.useCallback((event: Event) => {
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
    }, []);

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

    const changeInputType = () => {
      const newType =
        state.type === InputType.text ? InputType.password : InputType.text;

      setState((s) => ({
        ...s,
        type: newType,
      }));
    };

    const testStrength = useCallback(
      (value: string) => {
        if (passwordSettings) {
          const capitalRegExp = new RegExp(
            passwordSettings.upperCaseRegexStr || "",
          );
          const digitalRegExp = new RegExp(
            passwordSettings.digitsRegexStr || "",
          );
          const specSymbolsRegExp = new RegExp(
            passwordSettings.specSymbolsRegexStr || "",
          );

          let capital = true;
          let digits = true;
          let special = true;
          let allowed = true;
          let length = true;

          if (passwordSettings.upperCase) {
            capital = capitalRegExp.test(value);
          }

          if (passwordSettings.digits) {
            digits = digitalRegExp.test(value);
          }

          if (passwordSettings.specSymbols) {
            special = specSymbolsRegExp.test(value);
          }

          if (passwordSettings.allowedCharactersRegexStr) {
            const allowedRegExp = new RegExp(
              `^${passwordSettings.allowedCharactersRegexStr}{1,}$`,
            );
            allowed = allowedRegExp.test(value);
          }

          if (passwordSettings?.minLength !== undefined) {
            length = value.trim().length >= passwordSettings.minLength;
          }

          return {
            allowed,
            digits,
            capital,
            special,
            length,
          };
        }
        return {} as TPasswordValidation;
      },
      [passwordSettings],
    );

    const checkPassword = useCallback(
      (value: string) => {
        const passwordValidation = testStrength(value);
        const progressScore =
          (passwordValidation?.digits &&
            passwordValidation?.capital &&
            passwordValidation?.special &&
            passwordValidation?.length &&
            passwordValidation?.allowed) ||
          false;

        onValidateInput?.(progressScore, passwordValidation);

        setState((s) => ({
          ...s,
          value,
          validLength: passwordValidation.length || false,
          validDigits: passwordValidation.digits || false,
          validCapital: passwordValidation.capital || false,
          validSpecial: passwordValidation.special || false,
        }));
      },
      [onValidateInput, testStrength],
    );

    const onChangeAction = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);

        if (refTooltip.current) {
          const tooltip = refTooltip.current as TooltipRefProps;
          if (tooltip?.isOpen) {
            tooltip?.close?.();
          }
        }

        if (simpleView) {
          setState((s) => ({
            ...s,
            value: e.target.value,
          }));
          return;
        }

        checkPassword(e.target.value);
      },
      [onChange, simpleView, checkPassword],
    );

    const getNewPassword = React.useCallback(() => {
      const length = passwordSettings?.minLength || 0;
      const string = "abcdefghijklmnopqrstuvwxyz";
      const numeric = "0123456789";
      const special = generatorSpecial || "";

      let password = "";
      let character = "";

      while (password.length < length) {
        const a = Math.ceil(string.length * Math.random() * Math.random());
        const b = Math.ceil(numeric.length * Math.random() * Math.random());
        const c = Math.ceil(special.length * Math.random() * Math.random());

        let hold = string.charAt(a);

        if (passwordSettings?.upperCase) {
          hold = password.length % 2 === 0 ? hold.toUpperCase() : hold;
        }

        character += hold;

        if (passwordSettings?.digits) {
          character += numeric.charAt(b);
        }

        if (passwordSettings?.specSymbols) {
          character += special.charAt(c);
        }

        password = character;
      }

      password = password
        .split("")
        .sort(() => 0.5 - Math.random())
        .join("");

      return password.substring(0, length);
    }, [
      generatorSpecial,
      passwordSettings?.digits,
      passwordSettings?.minLength,
      passwordSettings?.specSymbols,
      passwordSettings?.upperCase,
    ]);

    const onGeneratePassword = React.useCallback(
      (e: MouseEvent) => {
        if (isDisabled) return e.preventDefault();

        const newPassword = getNewPassword();

        if (state.type !== InputType.text) {
          setState((s) => ({
            ...s,
            type: InputType.text,
          }));
        }

        checkPassword(newPassword);
        onChangeAction?.({
          target: { value: newPassword },
        } as ChangeEvent<HTMLInputElement>);
      },
      [checkPassword, getNewPassword, isDisabled, onChangeAction, state.type],
    );

    // const copyToClipboard = (emailName: string) => {
    //   const { disableCopyAction, value } = state;

    //   if (isDisabled || disableCopyAction) return;

    //   setState((s) => ({
    //     ...s,
    //     disableCopyAction: true,
    //     copyLabel: clipCopiedResource,
    //   }));

    //   const textField = document.createElement("textarea");
    //   const emailValue = (
    //     document.getElementsByName(emailName)[0] as HTMLInputElement
    //   ).value;
    //   const formattedText = `${clipEmailResource}${emailValue} | ${clipPasswordResource}${value}`;

    //   textField.innerText = formattedText;
    //   document.body.appendChild(textField);
    //   textField.select();
    //   document.execCommand("copy");
    //   textField.remove();

    //   onCopyToClipboard?.(formattedText);

    //   setTimeout(() => {
    //     setState({
    //       ...state,
    //       disableCopyAction: false,
    //       copyLabel: clipActionResource,
    //     });
    //   }, 2000);
    // };

    React.useEffect(() => {
      setState((s) => ({ ...s, copyLabel: clipActionResource }));
    }, [clipActionResource, clipCopiedResource]);

    React.useImperativeHandle(
      ref,
      () => {
        return { onGeneratePassword, setState, value: state.value };
      },
      [onGeneratePassword, setState, state.value],
    );

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
            color="#A3A9AE"
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
      <TooltipStyle ref={refTooltipContent}>
        <StyledTooltipContainer
          forwardedAs="div"
          fontSize="12px"
          title={tooltipPasswordTitle}
        >
          {tooltipPasswordTitle}
          <StyledTooltipItem
            forwardedAs="div"
            title={tooltipPasswordLength}
            valid={state.validLength}
          >
            {tooltipPasswordLength}
          </StyledTooltipItem>
          {passwordSettings?.digits && (
            <StyledTooltipItem
              forwardedAs="div"
              title={tooltipPasswordDigits}
              valid={state.validDigits}
            >
              {tooltipPasswordDigits}
            </StyledTooltipItem>
          )}
          {passwordSettings?.upperCase && (
            <StyledTooltipItem
              forwardedAs="div"
              title={tooltipPasswordCapital}
              valid={state.validCapital}
            >
              {tooltipPasswordCapital}
            </StyledTooltipItem>
          )}
          {passwordSettings?.specSymbols && (
            <StyledTooltipItem
              forwardedAs="div"
              title={tooltipPasswordSpecial}
              valid={state.validSpecial}
            >
              {tooltipPasswordSpecial}
            </StyledTooltipItem>
          )}

          {generatePasswordTitle && (
            <div className="generate-btn-container">
              <Link
                className="generate-btn"
                type={LinkType.action}
                fontWeight="600"
                isHovered
                onClick={onGeneratePassword}
              >
                {generatePasswordTitle}
              </Link>
            </div>
          )}
        </StyledTooltipContainer>
      </TooltipStyle>
    );

    const renderInputGroup = () => {
      const { type, value } = state;
      const iconName = type === "password" ? EyeOffReactSvgUrl : EyeReactSvgUrl;
      const iconButtonClassName = `password_eye--${
        type === "password" ? "close" : "open"
      }`;

      return (
        <>
          <InputBlock
            id={id}
            className="input-relative"
            name={inputName}
            hasError={hasError}
            isDisabled={isDisabled}
            iconName={iconName}
            iconButtonClassName={iconButtonClassName}
            value={value ?? ""}
            onIconClick={changeInputType}
            onChange={onChangeAction}
            scale={scale}
            size={size}
            type={type}
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
          />

          {!isDisableTooltip && !isDisabled && (
            <Tooltip
              place="top"
              clickable
              openOnClick
              anchorSelect="div[id='tooltipContent'] input"
              offsetLeft={tooltipOffsetLeft}
              offsetTop={tooltipOffsetTop}
              ref={refTooltip}
              imperativeModeOnly
            >
              {renderTooltipContent()}
            </Tooltip>
          )}
        </>
      );
    };

    return (
      <StyledInput
        onValidateInput={onValidateInput}
        className={className}
        style={style}
        $isFullWidth={isFullWidth}
        data-testid="password-input"
      >
        {simpleView ? (
          <>
            {renderInputGroup()}
            {renderTextTooltip()}
          </>
        ) : (
          <>
            <div className="password-field-wrapper">
              <PasswordProgress
                id="tooltipContent"
                ref={refProgress}
                inputWidth={inputWidth}
              >
                {renderInputGroup()}
              </PasswordProgress>
            </div>
            {renderTextTooltip()}
          </>
        )}
      </StyledInput>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

PasswordInput.defaultProps = {
  inputName: "passwordInput",
  autoComplete: "new-password",
  isDisabled: false,

  scale: true,

  isDisableTooltip: false,
  isTextTooltipVisible: false,

  clipEmailResource: "E-mail ",
  clipPasswordResource: "Password ",
  clipCopiedResource: "Copied",

  generatorSpecial: "!@#$%^&*",
  className: "",
  simpleView: false,
  passwordSettings: {
    minLength: 8,
    upperCase: false,
    digits: false,
    specSymbols: false,
    digitsRegexStr: "(?=.*\\d)",
    upperCaseRegexStr: "(?=.*[A-Z])",
    specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
  },
  isFullWidth: false,
};

export { PasswordInput };

// const compare = (
//   prevProps: Readonly<PasswordInputProps>,
//   nextProps: Readonly<PasswordInputProps>,
// ) => {
//   return equal(prevProps, nextProps);
// };

// const PasswordInput = React.memo(
//   (props) => <PasswordInputPure {...props} />,
//   compare,
// );

// PasswordInput.displayName = "PasswordInput";

// export { PasswordInput };
