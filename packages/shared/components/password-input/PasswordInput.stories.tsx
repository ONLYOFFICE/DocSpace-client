import React, { useState, useEffect } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { InputSize, InputType, TextInput } from "../text-input";

import { PasswordInputPure } from "./PasswordInput";

import PasswordInputDocs from "./PasswordInput.mdx";
import { PasswordInputProps, TPasswordValidation } from "./PasswordInput.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/PasswordInput",
  component: PasswordInputPure,
  parameters: {
    docs: {
      description: {
        component: "Paging is used to navigate med content pages",
      },
      page: PasswordInputDocs,
    },
  },
  argTypes: {
    // settingMinLength: disable,
    // settingsUpperCase: disable,
    // settingsDigits: disable,
    // settingsSpecSymbols: disable,
  },
} satisfies Meta<typeof PasswordInputPure>;
type Story = StoryObj<typeof PasswordInputPure>;

export default meta;

const Template = ({
  tooltipPasswordLength,
  onChange,
  onValidateInput,
  onCopyToClipboard,
  passwordSettings,
  ...args
}: PasswordInputProps) => {
  const [value, setValue] = useState("");
  const [fakeSettings, setFakeSettings] = useState(passwordSettings);

  useEffect(() => {
    setFakeSettings(passwordSettings);
    setValue("");
  }, [passwordSettings]);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    setValue(e.currentTarget.value);
  };

  const onValidateInputHandler = (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => {
    onValidateInput?.(progressScore, passwordValidation);
  };

  return (
    <div style={{ height: "110px", display: "grid", gridGap: "24px" }}>
      <TextInput
        name="demoEmailInput"
        type={InputType.email}
        size={InputSize.base}
        isDisabled={args.isDisabled}
        isReadOnly
        scale
        value="demo@gmail.com"
      />

      <PasswordInputPure
        {...args}
        size={InputSize.base}
        inputValue={value}
        onChange={onChangeHandler}
        tooltipPasswordLength={`${tooltipPasswordLength} ${passwordSettings?.minLength}`}
        passwordSettings={fakeSettings}
        onValidateInput={onValidateInputHandler}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    isDisabled: false,
    passwordSettings: {
      minLength: 6,
      upperCase: true,
      digits: true,
      specSymbols: true,
      digitsRegexStr: "(?=.*\\d)",
      upperCaseRegexStr: "(?=.*[A-Z])",
      specSymbolsRegexStr:
        "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
    },
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
  },
};
