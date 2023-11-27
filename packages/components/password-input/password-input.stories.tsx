import React, { useState, useEffect } from "react";
import PasswordInput from ".";
import TextInput from "../text-input";
// @ts-expect-error TS(2307): Cannot find module './password-input.mdx' or its c... Remove this comment to see the full error message
import PasswordInputDocs from "./password-input.mdx";

const disable = {
  table: {
    disable: true,
  },
};

export default {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    docs: {
      description: {
        component: "Paging is used to navigate med content pages",
      },
      page: PasswordInputDocs,
    },
  },
  argTypes: {
    settingMinLength: disable,
    settingsUpperCase: disable,
    settingsDigits: disable,
    settingsSpecSymbols: disable,
  },
};

const Template = ({
  settingMinLength,
  settingsUpperCase,
  settingsDigits,
  settingsSpecSymbols,
  settingsDigitsRegexStr,
  settingsUpperCaseRegexStr,
  settingsSpecSymbolsRegexStr,
  tooltipPasswordLength,
  onChange,
  onValidateInput,
  onCopyToClipboard,
  ...args
}: any) => {
  const [value, setValue] = useState("");
  const [fakeSettings, setFakeSettings] = useState();

  useEffect(() => {
    setFakeSettings({
      // @ts-expect-error TS(2345): Argument of type '{ minLength: any; upperCase: any... Remove this comment to see the full error message
      minLength: settingMinLength,
      upperCase: settingsUpperCase,
      digits: settingsDigits,
      specSymbols: settingsSpecSymbols,
      digitsRegexStr: settingsDigitsRegexStr,
      upperCaseRegexStr: settingsUpperCaseRegexStr,
      specSymbolsRegexStr: settingsSpecSymbolsRegexStr,
    });
    setValue("");
  }, [
    settingMinLength,
    settingsUpperCase,
    settingsDigits,
    settingsSpecSymbols,
    settingsDigitsRegexStr,
    settingsUpperCaseRegexStr,
    settingsSpecSymbolsRegexStr,
  ]);

  const onChangeHandler = (e: any) => {
    onChange(e.currentTarget.value);
    setValue(e.currentTarget.value);
  };

  const onValidateInputHandler = (e: any) => {
    onValidateInput(e);
  };

  return (
    <div style={{ height: "110px", display: "grid", gridGap: "24px" }}>
      <TextInput
        name="demoEmailInput"
        size="base"
        isDisabled={args.isDisabled}
        isReadOnly={true}
        scale={true}
        value="demo@gmail.com"
      />

      <PasswordInput
        {...args}
        inputValue={value}
        onChange={onChangeHandler}
        tooltipPasswordLength={`${tooltipPasswordLength} ${settingMinLength}`}
        passwordSettings={fakeSettings}
        onValidateInput={onValidateInputHandler}
      />
    </div>
  );
};

export const Default = Template.bind({});

// @ts-expect-error TS(2339): Property 'args' does not exist on type '({ setting... Remove this comment to see the full error message
Default.args = {
  isDisabled: false,
  settingMinLength: 6,
  settingsUpperCase: true,
  settingsDigits: true,
  settingsSpecSymbols: true,
  simpleView: false,
  inputName: "demoPasswordInput",
  emailInputName: "demoEmailInput",
  isDisableTooltip: false,
  isTextTooltipVisible: false,
  tooltipPasswordTitle: "Password must contain:",
  tooltipPasswordLength: "minimum length: ",
  tooltipPasswordDigits: "digits",
  tooltipPasswordCapital: "capital letters",
  tooltipPasswordSpecial: "special characters (!@#$%^&*)",
  generatorSpecial: "!@#$%^&*",
  placeholder: "password",
  maxLength: 30,
  settingsDigitsRegexStr: "(?=.*\\d)",
  settingsUpperCaseRegexStr: "(?=.*[A-Z])",
  settingsSpecSymbolsRegexStr:
    "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
};
