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

import React, { useEffect, useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { EmailSettings } from "../../utils";
import { InputSize } from "../text-input";

import { EmailInput } from "./EmailInput";
import { EmailInputProps, TValidate } from "./EmailInput.types";

// const disable = {
//   table: {
//     disable: true,
//   },
// };

const meta = {
  title: "Components/EmailInput",
  component: EmailInput,
  argTypes: {
    // allowDomainPunycode: disable,
    // allowLocalPartPunycode: disable,
    // allowDomainIp: disable,
    // allowStrictLocalPart: disable,
    // allowSpaces: disable,
    // allowName: disable,
    // allowLocalDomainName: disable,
  },
} satisfies Meta<typeof EmailInput>;
type Story = StoryObj<typeof EmailInput>;

export default meta;

const Template = ({ ...rest }: EmailInputProps) => {
  const [emailValue, setEmailValue] = useState("");

  const onChangeHandler = (value: string) => {
    setEmailValue(value);
  };
  const settings = EmailSettings.parse({
    allowDomainPunycode: false,
    allowLocalPartPunycode: false,
    allowDomainIp: false,
    allowStrictLocalPart: false,
    allowSpaces: false,
    allowName: false,
    allowLocalDomainName: false,
  });

  useEffect(() => {
    setEmailValue(rest.value);
  }, [rest.value]);

  return (
    <div style={{ margin: "7px" }}>
      <EmailInput
        {...rest}
        value={emailValue}
        emailSettings={settings}
        onValidateInput={(data: TValidate) => rest.onValidateInput?.(data)}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          rest.onChange(e);
          onChangeHandler(e.target.value);
        }}
      />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    // allowDomainPunycode: false,
    // allowLocalPartPunycode: false,
    // allowDomainIp: false,
    // allowSpaces: false,
    // allowName: false,
    // allowLocalDomainName: false,
    // allowStrictLocalPart: true,
    placeholder: "Input email",
    size: InputSize.base,
  },
};
