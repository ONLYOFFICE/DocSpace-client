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

import React, { useState, useEffect } from "react";

import { Meta, StoryObj } from "@storybook/react";

import { InputSize, InputType, TextInput } from "../text-input";

import { PasswordInput } from "./PasswordInput";

// import PasswordInputDocs from "./PasswordInput.mdx";
import { PasswordInputProps, TPasswordValidation } from "./PasswordInput.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/PasswordInput",
  component: PasswordInput,
  parameters: {
    docs: {
      description: {
        component: "Paging is used to navigate med content pages",
      },
      // page: PasswordInputDocs,
    },
  },
  argTypes: {
    // settingMinLength: disable,
    // settingsUpperCase: disable,
    // settingsDigits: disable,
    // settingsSpecSymbols: disable,
  },
} satisfies Meta<typeof PasswordInput>;
type Story = StoryObj<typeof PasswordInput>;

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
        value="demo@gmail.com"
      />

      <PasswordInput
        {...args}
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
    size: InputSize.base,
  },
};
