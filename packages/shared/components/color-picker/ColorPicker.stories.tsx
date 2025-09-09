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

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { ColorPicker } from "./ColorPicker";
import { globalColors } from "../../themes";

const meta = {
  title: "Components/ColorPicker",
  component: ColorPicker,
  parameters: {
    docs: {
      description: {
        component:
          "A color picker component that allows users to select colors using a visual picker or hex input. Supports both standalone picker mode and a modal-like interface with apply/cancel actions.",
      },
    },
  },
  argTypes: {
    appliedColor: {
      control: "color",
      description: "The currently selected color in hex format",
      defaultValue: globalColors.lightBlueMain,
    },
    isPickerOnly: {
      control: "boolean",
      description:
        "If true, shows only the color picker without hex input and buttons",
    },
    applyButtonLabel: {
      control: "text",
      description: "Label for the apply button",
    },
    cancelButtonLabel: {
      control: "text",
      description: "Label for the cancel button",
    },
    hexCodeLabel: {
      control: "text",
      description: "Label for the hex code input field",
    },
    onApply: {
      description: "Callback when the apply button is clicked",
    },
    onClose: {
      description: "Callback when the cancel button or close icon is clicked",
    },
    handleChange: {
      description: "Callback that fires on every color change",
    },
  },
} satisfies Meta<typeof ColorPicker>;

type Story = StoryObj<typeof ColorPicker>;

export default meta;

export const Default: Story = {
  args: {
    isPickerOnly: false,
    appliedColor: globalColors.lightBlueMain,
    applyButtonLabel: "Apply",
    cancelButtonLabel: "Cancel",
    hexCodeLabel: "Hex code",
    onClose: () => console.log("Close clicked"),
    onApply: (color) => console.log("Apply clicked with color:", color),
    handleChange: (color) => console.log("Color changed to:", color),
  },
};

export const PickerOnly: Story = {
  args: {
    ...Default.args,
    isPickerOnly: true,
  },
};

export const CustomLabels: Story = {
  args: {
    ...Default.args,
    applyButtonLabel: "Save Color",
    cancelButtonLabel: "Discard",
    hexCodeLabel: "Color Code",
  },
};

export const PresetColor: Story = {
  args: {
    ...Default.args,
    appliedColor: "#FF0000",
  },
};

export const WithChangeHandler: Story = {
  args: {
    ...Default.args,
    handleChange: (color) => {
      console.log("Selected color:", color);
      // You can perform additional actions here
    },
  },
};

// Example of how to use the ColorPicker in a controlled way
export const Controlled: Story = {
  render: function ControlledStory() {
    const [color, setColor] = React.useState(globalColors.lightBlueMain);

    return (
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <ColorPicker
          isPickerOnly={false}
          appliedColor={color}
          handleChange={setColor}
          onApply={(newColor) => {
            setColor(newColor);
            console.log("Applied color:", newColor);
          }}
        />
      </div>
    );
  },
};
