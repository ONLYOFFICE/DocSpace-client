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

/* eslint-disable no-console */
import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { ColorInput } from "./ColorInput";
import { ColorInputProps } from "./ColorInput.types";
import { InputSize } from "../text-input/TextInput.enums";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/ColorInput",
  component: ColorInput,
  parameters: {
    docs: {
      description: {
        component:
          "A color input component that allows users to enter and select colors using a hex value or color picker.",
      },
    },
  },
  argTypes: {
    defaultColor: {
      control: "color",
      description: "Initial color value",
    },
    size: {
      control: "select",
      options: Object.values(InputSize),
      description: "Size of the input field",
    },
    scale: {
      control: "boolean",
      description: "Whether the input field has scale",
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the input field",
    },
    hasError: {
      control: "boolean",
      description: "Shows error state",
    },
    hasWarning: {
      control: "boolean",
      description: "Shows warning state",
    },
    handleChange: {
      description: "Callback when color changes",
    },
  },
} satisfies Meta<typeof ColorInput>;

type Story = StoryObj<typeof ColorInput>;

export default meta;

const Template = ({ ...args }: ColorInputProps) => {
  return (
    <div style={{ height: "300px" }}>
      <ColorInput {...args} />
    </div>
  );
};

export const Default: Story = {
  render: (args) => <Template {...args} />,
  args: {
    defaultColor: globalColors.lightBlueMain,
    handleChange: (color) => console.log("Color changed:", color),
    size: InputSize.base,
    scale: false,
    isDisabled: false,
    hasError: false,
    hasWarning: false,
  },
};

export const WithScale: Story = {
  args: {
    ...Default.args,
    scale: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const WithError: Story = {
  args: {
    ...Default.args,
    hasError: true,
  },
};

export const WithWarning: Story = {
  args: {
    ...Default.args,
    hasWarning: true,
  },
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {Object.values(InputSize).map((size) => (
        <ColorInput
          key={size}
          defaultColor={globalColors.lightBlueMain}
          size={size}
          handleChange={(color) => console.log(`${size} color changed:`, color)}
        />
      ))}
    </div>
  ),
};
