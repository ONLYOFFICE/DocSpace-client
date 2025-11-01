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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import { EmailSettings } from "../../utils";
import { InputSize } from "../text-input";
import { EmailInput } from ".";
import type { EmailInputProps, TValidate } from "./EmailInput.types";

const meta = {
  title: "Form Controls/EmailInput",
  component: EmailInput,
  parameters: {
    docs: {
      description: {
        component: "Email input field with validation",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: Object.values(InputSize),
    },
    isDisabled: { control: "boolean" },
    isReadOnly: { control: "boolean" },
    hasError: { control: "boolean" },
    scale: { control: "boolean" },
  },
} satisfies Meta<typeof EmailInput>;

export default meta;
type Story = StoryObj<typeof EmailInput>;

const Template = ({
  value: initialValue,
  size,
  isDisabled,
  isReadOnly,
  hasError,
  scale,
  placeholder,
}: EmailInputProps) => {
  const [value, setValue] = useState(initialValue || "");
  const [validationState, setValidationState] = useState<TValidate>();

  const settings = EmailSettings.parse({
    allowDomainPunycode: false,
    allowLocalPartPunycode: false,
    allowDomainIp: false,
    allowStrictLocalPart: true,
    allowSpaces: false,
    allowName: false,
    allowLocalDomainName: false,
  });

  return (
    <div style={{ width: "320px" }}>
      <EmailInput
        placeholder={placeholder || "Enter email address"}
        value={value}
        emailSettings={settings}
        onChange={(e) => setValue(e.target.value)}
        onValidateInput={(data) => setValidationState(data)}
        size={size}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        hasError={hasError}
        scale={scale}
      />
      {validationState ? (
        <div style={{ marginTop: "8px", fontSize: "12px" }}>
          <div>Valid: {validationState.isValid ? "Yes" : "No"}</div>
          {(validationState.errors ?? []).length > 0 ? (
            <div>Errors: {validationState.errors?.join(", ")}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export const Default: Story = {
  render: Template,
  args: {
    placeholder: "Enter email address",
    size: InputSize.base,
    isDisabled: false,
    isReadOnly: false,
    hasError: false,
    scale: false,
    value: "",
  },
};

export const WithInitialValue: Story = {
  render: Template,
  args: {
    ...Default.args,
    value: "test@example.com",
  },
};

export const WithCustomValidation: Story = {
  render: Template,
  args: {
    ...Default.args,
    scale: true,
    placeholder: "Enter @custom-domain.com email",
    customValidate: (value) => ({
      value,
      isValid: value.endsWith("@custom-domain.com"),
      errors: value ? ["Must be @custom-domain.com email"] : [],
    }),
  },
};

export const Disabled: Story = {
  render: Template,
  args: {
    ...Default.args,
    isDisabled: true,
    value: "disabled@example.com",
  },
};

export const ReadOnly: Story = {
  render: Template,
  args: {
    ...Default.args,
    isReadOnly: true,
    value: "readonly@example.com",
  },
};

export const WithError: Story = {
  render: Template,
  args: {
    ...Default.args,
    hasError: true,
    value: "invalid-email",
  },
};
