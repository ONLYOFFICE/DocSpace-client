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
import { PasswordInput } from ".";
import { PasswordInputProps, TPasswordValidation } from "./PasswordInput.types";

const meta = {
  title: "Form Controls/PasswordInput",
  component: PasswordInput,
  parameters: {
    docs: {
      description: {
        component:
          "PasswordInput is a specialized input component for password entry with built-in validation, strength indicators, and customizable requirements.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: Object.values(InputSize),
      description: "Size of the input field",
    },
    simpleView: {
      control: "boolean",
      description: "Toggle between simple and advanced view with validation",
    },
    isDisabled: {
      control: "boolean",
      description: "Disable the input field",
    },
    isDisableTooltip: {
      control: "boolean",
      description: "Disable the validation tooltip",
    },
    maxLength: {
      control: "number",
      description: "Maximum length of the password",
    },
    inputWidth: {
      control: "text",
      description: "Custom width of the input field",
    },
    scale: {
      control: "boolean",
      description: "Enable scaling of the input field",
    },
  },
} satisfies Meta<typeof PasswordInput>;

type Story = StoryObj<typeof PasswordInput>;

export default meta;

const Template = ({
  tooltipPasswordLength,
  onChange,
  onValidateInput,
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
    setValue(e.currentTarget?.value);
  };

  const onValidateInputHandler = (
    progressScore: boolean,
    passwordValidation: TPasswordValidation,
  ) => {
    onValidateInput?.(progressScore, passwordValidation);
  };

  return (
    <div style={{ height: "110px", display: "grid", gridGap: "24px" }}>
      <div style={{ backgroundColor: "transparent", width: "fit-content" }}>
        <TextInput
          name="demoEmailInput"
          type={InputType.email}
          size={InputSize.base}
          isDisabled={args.isDisabled}
          isReadOnly
          value="demo@gmail.com"
          style={{ width: "166px" }}
        />
      </div>

      <div style={{ backgroundColor: "transparent", width: "fit-content" }}>
        <PasswordInput
          size={InputSize.base}
          {...args}
          inputValue={value}
          onChange={onChangeHandler}
          tooltipPasswordLength={`${tooltipPasswordLength} ${passwordSettings?.minLength}`}
          passwordSettings={fakeSettings}
          onValidateInput={onValidateInputHandler}
        />
      </div>
    </div>
  );
};

// Base configuration for password settings
const basePasswordSettings = {
  minLength: 6,
  upperCase: true,
  digits: true,
  specSymbols: true,
  digitsRegexStr: "(?=.*\\d)",
  upperCaseRegexStr: "(?=.*[A-Z])",
  specSymbolsRegexStr: "(?=.*[\\x21-\\x2F\\x3A-\\x40\\x5B-\\x60\\x7B-\\x7E])",
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    isDisabled: false,
    passwordSettings: basePasswordSettings,
    simpleView: false,
    inputName: "demoPasswordInput-default",
    emailInputName: "demoEmailInput",
    isDisableTooltip: false,
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

export const SimpleView: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    simpleView: true,
    inputName: "demoPasswordInput-simple",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Simple view mode without validation indicators, suitable for login forms",
      },
    },
  },
};

export const CustomValidation: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    passwordSettings: {
      ...basePasswordSettings,
      minLength: 8,
      upperCase: true,
      digits: true,
      specSymbols: false,
    },
    inputName: "demoPasswordInput-custom",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Custom validation requirements: minimum 8 characters, uppercase, and digits required",
      },
    },
  },
};

export const WithCustomWidth: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    inputWidth: "400px",
    inputName: "demoPasswordInput-width",
  },
  parameters: {
    docs: {
      description: {
        story: "Password input with custom width",
      },
    },
  },
};

export const Large: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    size: InputSize.large,
    inputName: "demoPasswordInput-large",
  },
  parameters: {
    docs: {
      description: {
        story: "Large-sized password input",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    isDisabled: true,
    inputName: "demoPasswordInput-disabled",
  },
  parameters: {
    docs: {
      description: {
        story: "Disabled password input state",
      },
    },
  },
};

export const WithError: Story = {
  render: (args) => <Template {...args} />,
  args: {
    ...Default.args,
    hasError: true,
    inputName: "demoPasswordInput-error",
  },
  parameters: {
    docs: {
      description: {
        story: "Password input with error state",
      },
    },
  },
};
