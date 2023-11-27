import React from "react";
import PropTypes from "prop-types";
import equal from "fast-deep-equal/react";

import InputBlock from "../input-block";
import Link from "../link";
import Text from "../text";
import Tooltip from "../tooltip";

// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/eye.react.sv... Remove this comment to see the full error message
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
// @ts-expect-error TS(2307): Cannot find module 'PUBLIC_DIR/images/eye.off.reac... Remove this comment to see the full error message
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";

import {
  PasswordProgress,
  StyledInput,
  TooltipStyle,
  StyledTooltipContainer,
  StyledTooltipItem,
} from "./styled-password-input";

class PasswordInput extends React.Component {
  ref: any;
  refTooltip: any;
  constructor(props: any) {
    super(props);

    const { inputValue, inputType, clipActionResource, emailInputName } = props;

    this.ref = React.createRef();

    this.state = {
      type: inputType,
      inputValue: inputValue,
      copyLabel: clipActionResource,
      disableCopyAction: emailInputName ? false : true,
      displayTooltip: false,
      validLength: false,
      validDigits: false,
      validCapital: false,
      validSpecial: false,
    };
  }

  onBlur = (e: any) => {
    e.persist();
    // @ts-expect-error TS(2339): Property 'onBlur' does not exist on type 'Readonly... Remove this comment to see the full error message
    if (this.props.onBlur) this.props.onBlur(e);
  };

  onKeyDown = (e: any) => {
    e.persist();
    // @ts-expect-error TS(2339): Property 'onKeyDown' does not exist on type 'Reado... Remove this comment to see the full error message
    if (this.props.onKeyDown) this.props.onKeyDown(e);
  };

  changeInputType = () => {
    // @ts-expect-error TS(2339): Property 'type' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const newType = this.state.type === "text" ? "password" : "text";

    this.setState({
      type: newType,
    });
  };

  testStrength = (value: any) => {
    // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
    const { passwordSettings } = this.props;
    const capitalRegExp = new RegExp(passwordSettings.upperCaseRegexStr);
    const digitalRegExp = new RegExp(passwordSettings.digitsRegexStr);
    const specSymbolsRegExp = new RegExp(passwordSettings.specSymbolsRegexStr);
    const allowedRegExp = new RegExp(
      "^" + passwordSettings.allowedCharactersRegexStr + "{1,}$"
    );

    let capital;
    let digits;
    let special;

    passwordSettings.upperCase
      ? (capital = capitalRegExp.test(value))
      : (capital = true);

    passwordSettings.digits
      ? (digits = digitalRegExp.test(value))
      : (digits = true);

    passwordSettings.specSymbols
      ? (special = specSymbolsRegExp.test(value))
      : (special = true);

    const allowedCharacters = allowedRegExp.test(value);

    return {
      allowed: allowedCharacters,
      digits: digits,
      capital: capital,
      special: special,
      length: value.trim().length >= passwordSettings.minLength,
    };
  };

  checkPassword = (value: any) => {
    const passwordValidation = this.testStrength(value);
    const progressScore =
      passwordValidation.digits &&
      passwordValidation.capital &&
      passwordValidation.special &&
      passwordValidation.length &&
      passwordValidation.allowed;

    // @ts-expect-error TS(2339): Property 'onValidateInput' does not exist on type ... Remove this comment to see the full error message
    this.props.onValidateInput &&
      // @ts-expect-error TS(2339): Property 'onValidateInput' does not exist on type ... Remove this comment to see the full error message
      this.props.onValidateInput(progressScore, passwordValidation);

    this.setState({
      inputValue: value,
      validLength: passwordValidation.length,
      validDigits: passwordValidation.digits,
      validCapital: passwordValidation.capital,
      validSpecial: passwordValidation.special,
    });
  };

  onChangeAction = (e: any) => {
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onChange && this.props.onChange(e);

    // @ts-expect-error TS(2339): Property 'simpleView' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.simpleView) {
      this.setState({
        inputValue: e.target.value,
      });
      return;
    }

    this.checkPassword(e.target.value);
  };

  onGeneratePassword = (e: any) => {
    // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
    if (this.props.isDisabled) return e.preventDefault();

    const newPassword = this.getNewPassword();

    // @ts-expect-error TS(2339): Property 'type' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    if (this.state.type !== "text") {
      this.setState({
        type: "text",
      });
    }

    this.checkPassword(newPassword);
    // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
    this.props.onChange &&
      // @ts-expect-error TS(2339): Property 'onChange' does not exist on type 'Readon... Remove this comment to see the full error message
      this.props.onChange({ target: { value: newPassword } });
  };

  getNewPassword = () => {
    // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
    const { passwordSettings, generatorSpecial } = this.props;

    const length = passwordSettings.minLength;
    const string = "abcdefghijklmnopqrstuvwxyz";
    const numeric = "0123456789";
    const special = generatorSpecial;

    let password = "";
    let character = "";

    while (password.length < length) {
      const a = Math.ceil(string.length * Math.random() * Math.random());
      const b = Math.ceil(numeric.length * Math.random() * Math.random());
      const c = Math.ceil(special.length * Math.random() * Math.random());

      let hold = string.charAt(a);

      if (passwordSettings.upperCase) {
        hold = password.length % 2 == 0 ? hold.toUpperCase() : hold;
      }

      character += hold;

      if (passwordSettings.digits) {
        character += numeric.charAt(b);
      }

      if (passwordSettings.specSymbols) {
        character += special.charAt(c);
      }

      password = character;
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    return password.substr(0, length);
  };

  copyToClipboard = (emailInputName: any) => {
    const {
      // @ts-expect-error TS(2339): Property 'clipEmailResource' does not exist on typ... Remove this comment to see the full error message
      clipEmailResource,
      // @ts-expect-error TS(2339): Property 'clipPasswordResource' does not exist on ... Remove this comment to see the full error message
      clipPasswordResource,
      // @ts-expect-error TS(2339): Property 'clipActionResource' does not exist on ty... Remove this comment to see the full error message
      clipActionResource,
      // @ts-expect-error TS(2339): Property 'clipCopiedResource' does not exist on ty... Remove this comment to see the full error message
      clipCopiedResource,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'onCopyToClipboard' does not exist on typ... Remove this comment to see the full error message
      onCopyToClipboard,
    } = this.props;
    // @ts-expect-error TS(2339): Property 'disableCopyAction' does not exist on typ... Remove this comment to see the full error message
    const { disableCopyAction, inputValue } = this.state;

    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    if (isDisabled || disableCopyAction) return event.preventDefault();

    this.setState({
      disableCopyAction: true,
      copyLabel: clipCopiedResource,
    });

    const textField = document.createElement("textarea");
    // @ts-expect-error TS(2339): Property 'value' does not exist on type 'HTMLEleme... Remove this comment to see the full error message
    const emailValue = document.getElementsByName(emailInputName)[0].value;
    const formattedText =
      clipEmailResource +
      emailValue +
      " | " +
      clipPasswordResource +
      inputValue;

    textField.innerText = formattedText;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();

    onCopyToClipboard && onCopyToClipboard(formattedText);

    setTimeout(() => {
      this.setState({
        disableCopyAction: false,
        copyLabel: clipActionResource,
      });
    }, 2000);
  };

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return !equal(this.props, nextProps) || !equal(this.state, nextState);
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    if (
      // @ts-expect-error TS(2339): Property 'clipActionResource' does not exist on ty... Remove this comment to see the full error message
      prevProps.clipActionResource !== this.props.clipActionResource &&
      // @ts-expect-error TS(2339): Property 'copyLabel' does not exist on type 'Reado... Remove this comment to see the full error message
      this.state.copyLabel !== this.props.clipCopiedResource
    ) {
      // @ts-expect-error TS(2339): Property 'clipActionResource' does not exist on ty... Remove this comment to see the full error message
      this.setState({ copyLabel: this.props.clipActionResource });
    }
  }

  renderTextTooltip = (settings: any, length: any, digits: any, capital: any, special: any) => {
    return (
      <>
        <div className="break"></div>
        // @ts-expect-error TS(2322): Type '{ children: any[]; className: string; fontSi... Remove this comment to see the full error message
        <Text
          className="text-tooltip"
          fontSize="10px"
          color="#A3A9AE"
          as="span"
        >
          {settings.minLength ? length : null}{" "}
          {settings.digits ? `, ${digits}` : null}{" "}
          {settings.upperCase ? `, ${capital}` : null}{" "}
          {settings.specSymbols ? `, ${special}` : null}
        </Text>
        <div className="break"></div>
      </>
    );
  };

  // @ts-expect-error TS(2300): Duplicate identifier 'renderTextTooltip'.
  renderTextTooltip = () => {
    const {
      // @ts-expect-error TS(2339): Property 'tooltipPasswordLength' does not exist on... Remove this comment to see the full error message
      tooltipPasswordLength,
      // @ts-expect-error TS(2339): Property 'tooltipPasswordDigits' does not exist on... Remove this comment to see the full error message
      tooltipPasswordDigits,
      // @ts-expect-error TS(2339): Property 'tooltipPasswordCapital' does not exist o... Remove this comment to see the full error message
      tooltipPasswordCapital,
      // @ts-expect-error TS(2339): Property 'tooltipPasswordSpecial' does not exist o... Remove this comment to see the full error message
      tooltipPasswordSpecial,
      // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
      passwordSettings,
      // @ts-expect-error TS(2339): Property 'isTextTooltipVisible' does not exist on ... Remove this comment to see the full error message
      isTextTooltipVisible,
    } = this.props;
    return isTextTooltipVisible ? (
      <>
        <div className="break"></div>
        // @ts-expect-error TS(2322): Type '{ children: any[]; className: string; fontSi... Remove this comment to see the full error message
        <Text
          className="text-tooltip"
          fontSize="10px"
          color="#A3A9AE"
          as="span"
        >
          {passwordSettings.minLength ? tooltipPasswordLength : null}{" "}
          {passwordSettings.digits ? `, ${tooltipPasswordDigits}` : null}{" "}
          {passwordSettings.upperCase ? `, ${tooltipPasswordCapital}` : null}{" "}
          {passwordSettings.specSymbols ? `, ${tooltipPasswordSpecial}` : null}
        </Text>
        <div className="break"></div>
      </>
    ) : null;
  };

  renderTooltipContent = () => (
    <TooltipStyle>
      <StyledTooltipContainer
        forwardedAs="div"
        fontSize="12px"
        // @ts-expect-error TS(2339): Property 'tooltipPasswordTitle' does not exist on ... Remove this comment to see the full error message
        title={this.props.tooltipPasswordTitle}
      >
        // @ts-expect-error TS(2339): Property 'tooltipPasswordTitle' does not exist on ... Remove this comment to see the full error message
        {this.props.tooltipPasswordTitle}
        <StyledTooltipItem
          forwardedAs="div"
          // @ts-expect-error TS(2339): Property 'tooltipPasswordLength' does not exist on... Remove this comment to see the full error message
          title={this.props.tooltipPasswordLength}
          // @ts-expect-error TS(2339): Property 'validLength' does not exist on type 'Rea... Remove this comment to see the full error message
          valid={this.state.validLength}
        >
          // @ts-expect-error TS(2339): Property 'tooltipPasswordLength' does not exist on... Remove this comment to see the full error message
          {this.props.tooltipPasswordLength}
        </StyledTooltipItem>
        // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
        {this.props.passwordSettings.digits && (
          <StyledTooltipItem
            forwardedAs="div"
            // @ts-expect-error TS(2339): Property 'tooltipPasswordDigits' does not exist on... Remove this comment to see the full error message
            title={this.props.tooltipPasswordDigits}
            // @ts-expect-error TS(2339): Property 'validDigits' does not exist on type 'Rea... Remove this comment to see the full error message
            valid={this.state.validDigits}
          >
            // @ts-expect-error TS(2339): Property 'tooltipPasswordDigits' does not exist on... Remove this comment to see the full error message
            {this.props.tooltipPasswordDigits}
          </StyledTooltipItem>
        )}
        // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
        {this.props.passwordSettings.upperCase && (
          <StyledTooltipItem
            forwardedAs="div"
            // @ts-expect-error TS(2339): Property 'tooltipPasswordCapital' does not exist o... Remove this comment to see the full error message
            title={this.props.tooltipPasswordCapital}
            // @ts-expect-error TS(2339): Property 'validCapital' does not exist on type 'Re... Remove this comment to see the full error message
            valid={this.state.validCapital}
          >
            // @ts-expect-error TS(2339): Property 'tooltipPasswordCapital' does not exist o... Remove this comment to see the full error message
            {this.props.tooltipPasswordCapital}
          </StyledTooltipItem>
        )}
        // @ts-expect-error TS(2339): Property 'passwordSettings' does not exist on type... Remove this comment to see the full error message
        {this.props.passwordSettings.specSymbols && (
          <StyledTooltipItem
            forwardedAs="div"
            // @ts-expect-error TS(2339): Property 'tooltipPasswordSpecial' does not exist o... Remove this comment to see the full error message
            title={this.props.tooltipPasswordSpecial}
            // @ts-expect-error TS(2339): Property 'validSpecial' does not exist on type 'Re... Remove this comment to see the full error message
            valid={this.state.validSpecial}
          >
            // @ts-expect-error TS(2339): Property 'tooltipPasswordSpecial' does not exist o... Remove this comment to see the full error message
            {this.props.tooltipPasswordSpecial}
          </StyledTooltipItem>
        )}

        // @ts-expect-error TS(2339): Property 'generatePasswordTitle' does not exist on... Remove this comment to see the full error message
        {this.props.generatePasswordTitle && (
          <div className="generate-btn-container">
            <Link
              className="generate-btn"
              type="action"
              fontWeight="600"
              isHovered={true}
              onClick={this.onGeneratePassword}
            >
              // @ts-expect-error TS(2339): Property 'generatePasswordTitle' does not exist on... Remove this comment to see the full error message
              {this.props.generatePasswordTitle}
            </Link>
          </div>
        )}
      </StyledTooltipContainer>
    </TooltipStyle>
  );

  renderInputGroup = () => {
    const {
      // @ts-expect-error TS(2339): Property 'inputName' does not exist on type 'Reado... Remove this comment to see the full error message
      inputName,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'scale' does not exist on type 'Readonly<... Remove this comment to see the full error message
      scale,
      // @ts-expect-error TS(2339): Property 'size' does not exist on type 'Readonly<{... Remove this comment to see the full error message
      size,
      // @ts-expect-error TS(2339): Property 'hasError' does not exist on type 'Readon... Remove this comment to see the full error message
      hasError,
      // @ts-expect-error TS(2339): Property 'hasWarning' does not exist on type 'Read... Remove this comment to see the full error message
      hasWarning,
      // @ts-expect-error TS(2339): Property 'placeholder' does not exist on type 'Rea... Remove this comment to see the full error message
      placeholder,
      // @ts-expect-error TS(2339): Property 'tabIndex' does not exist on type 'Readon... Remove this comment to see the full error message
      tabIndex,
      // @ts-expect-error TS(2339): Property 'maxLength' does not exist on type 'Reado... Remove this comment to see the full error message
      maxLength,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'autoComplete' does not exist on type 'Re... Remove this comment to see the full error message
      autoComplete,
      // @ts-expect-error TS(2339): Property 'forwardedRef' does not exist on type 'Re... Remove this comment to see the full error message
      forwardedRef,
      // @ts-expect-error TS(2339): Property 'isDisableTooltip' does not exist on type... Remove this comment to see the full error message
      isDisableTooltip,
    } = this.props;

    // @ts-expect-error TS(2339): Property 'type' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { type, inputValue } = this.state;
    const iconName = type === "password" ? EyeOffReactSvgUrl : EyeReactSvgUrl;
    const iconButtonClassName = `password_eye--${
      type === "password" ? "close" : "open"
    }`;
    return (
      <>
        <InputBlock
          // @ts-expect-error TS(2322): Type '{ id: any; className: string; name: any; has... Remove this comment to see the full error message
          id={id}
          className="input-relative"
          name={inputName}
          hasError={hasError}
          isDisabled={isDisabled}
          iconName={iconName}
          iconButtonClassName={iconButtonClassName}
          value={inputValue}
          onIconClick={this.changeInputType}
          onChange={this.onChangeAction}
          scale={scale}
          size={size}
          type={type}
          iconSize={16}
          isIconFill={true}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
          hasWarning={hasWarning}
          placeholder={placeholder}
          tabIndex={tabIndex}
          maxLength={maxLength}
          autoComplete={autoComplete}
          forwardedRef={forwardedRef}
        ></InputBlock>

        {!isDisableTooltip && !isDisabled && (
          <Tooltip
            place="top"
            clickable
            openOnClick
            anchorSelect="div[id='tooltipContent'] input"
            // @ts-expect-error TS(2322): Type '{ children: Element; place: string; clickabl... Remove this comment to see the full error message
            offsetLeft={this.props.tooltipOffsetLeft}
            // @ts-expect-error TS(2339): Property 'tooltipOffsetTop' does not exist on type... Remove this comment to see the full error message
            offsetTop={this.props.tooltipOffsetTop}
            reference={this.refTooltip}
          >
            {this.renderTooltipContent()}
          </Tooltip>
        )}
      </>
    );
  };
  render() {
    //console.log('PasswordInput render()');
    const {
      // @ts-expect-error TS(2339): Property 'inputWidth' does not exist on type 'Read... Remove this comment to see the full error message
      inputWidth,
      // @ts-expect-error TS(2339): Property 'onValidateInput' does not exist on type ... Remove this comment to see the full error message
      onValidateInput,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'style' does not exist on type 'Readonly<... Remove this comment to see the full error message
      style,
      // @ts-expect-error TS(2339): Property 'simpleView' does not exist on type 'Read... Remove this comment to see the full error message
      simpleView,
      // @ts-expect-error TS(2339): Property 'isDisabled' does not exist on type 'Read... Remove this comment to see the full error message
      isDisabled,
      // @ts-expect-error TS(2339): Property 'isFullWidth' does not exist on type 'Rea... Remove this comment to see the full error message
      isFullWidth,
    } = this.props;

    return (
      <StyledInput
        onValidateInput={onValidateInput}
        className={className}
        style={style}
        $isFullWidth={isFullWidth}
      >
        {simpleView ? (
          <>
            {this.renderInputGroup()}
            // @ts-expect-error TS(2554): Expected 5 arguments, but got 0.
            {this.renderTextTooltip()}
          </>
        ) : (
          <>
            <div className="password-field-wrapper">
              <PasswordProgress
                id="tooltipContent"
                ref={this.ref}
                // @ts-expect-error TS(2769): No overload matches this call.
                inputWidth={inputWidth}
                isDisabled={isDisabled}
              >
                {this.renderInputGroup()}
              </PasswordProgress>
            </div>
            // @ts-expect-error TS(2554): Expected 5 arguments, but got 0.
            {this.renderTextTooltip()}
          </>
        )}
      </StyledInput>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
PasswordInput.propTypes = {
  /** Allows setting the component id  */
  id: PropTypes.string,
  /** Allows setting the component auto-complete */
  autoComplete: PropTypes.string,
  /** Facilitates the correct display of values inside the input*/
  inputType: PropTypes.oneOf(["text", "password"]),
  /** Input name */
  inputName: PropTypes.string,
  /** Required to associate the password field with the email field */
  emailInputName: PropTypes.string,
  /** Input value */
  inputValue: PropTypes.string,
  /** Sets a callback function that is triggered on PasswordInput */
  onChange: PropTypes.func,
  /** Default event that is triggered when the button is already pressed but not released */
  onKeyDown: PropTypes.func,
  /** Event that is triggered when the focused item is lost  */
  onBlur: PropTypes.func,
  /** Sets the input width manually */
  inputWidth: PropTypes.string,
  /** Notifies if the error occurs */
  hasError: PropTypes.bool,
  /** Notifies if the warning occurs */
  hasWarning: PropTypes.bool,
  /** Default placeholder input */
  placeholder: PropTypes.string,
  /** Tab index input */
  tabIndex: PropTypes.number,
  /** Default maxLength input */
  maxLength: PropTypes.number,
  /** Accepts class */
  className: PropTypes.string,
  /** Accepts css style */
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  /** Sets the input disabled */
  isDisabled: PropTypes.bool,
  size: PropTypes.oneOf(["base", "middle", "big", "huge", "large"]),
  /** Indicates that the input field has scale  */
  scale: PropTypes.bool,
  /** Allows to hide Tooltip */
  isDisableTooltip: PropTypes.bool,
  /** Allows to show Tooltip text */
  isTextTooltipVisible: PropTypes.bool,
  /** Prompts to copy the email and password data to clipboard */
  clipActionResource: PropTypes.string,
  /** Prompts to copy the email data to clipboard */
  clipEmailResource: PropTypes.string,
  /** Prompts to copy the password data to clipboard */
  clipPasswordResource: PropTypes.string,
  /** Prompts that the data has been copied to clipboard */
  clipCopiedResource: PropTypes.string,
  /** Title that indicates that the tooltip must contain a password */
  tooltipPasswordTitle: PropTypes.string,
  /** Prompt that indicates the minimal password length  */
  tooltipPasswordLength: PropTypes.string,
  /** Prompt that instructs to include digits into the password */
  tooltipPasswordDigits: PropTypes.string,
  /** Prompt that indicates that capital letters are allowed */
  tooltipPasswordCapital: PropTypes.string,
  /** Prompt that indicates that special characters are allowed */
  tooltipPasswordSpecial: PropTypes.string,
  /** Set of special characters for password generator and validator */
  generatorSpecial: PropTypes.string,
  /** Set of settings for password generator and validator */
  passwordSettings: PropTypes.object,
  /** Sets a callback function that is triggered on PasswordInput. Returns bool value */
  onValidateInput: PropTypes.func,
  /** Sets a callback function that is triggered when the copy button is clicked. Returns formatted value */
  onCopyToClipboard: PropTypes.func,
  /** Sets the tooltip offset to the left */
  tooltipOffsetLeft: PropTypes.number,
  /** Sets the tooltip offset to the top */
  tooltipOffsetTop: PropTypes.number,
  /** Sets the password input view to simple (without tooltips, password progress bar and several additional buttons (copy and generate password) */
  simpleView: PropTypes.bool,
  /** Sets a title of the password generation button */
  generatePasswordTitle: PropTypes.string,
  /** Setting display block to set element to full width*/
  isfullwidth: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
PasswordInput.defaultProps = {
  inputType: "password",
  inputName: "passwordInput",
  autoComplete: "new-password",
  isDisabled: false,
  size: "base",
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
  isfullwidth: false,
};

export default PasswordInput;
