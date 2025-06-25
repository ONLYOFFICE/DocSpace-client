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

import { Meta, StoryObj } from "@storybook/react";
import { LinkWithDropdown } from "./LinkWithDropdown";

const meta = {
  title: "Components/LinkWithDropdown",
  component: LinkWithDropdown,
  parameters: {
    docs: {
      description: {
        component: `
A dropdown component that appears as a link and expands to show a menu of options.

## Features
- Customizable text styles (font size, weight, color)
- Optional expander icon
- Support for disabled state
- Theme support (light/dark)
- Keyboard navigation
- ARIA attributes for accessibility
`,
      },
    },
  },
  argTypes: {
    children: {
      control: "text",
      description:
        "Content to be displayed as the link text. Can be a string or React nodes",
      table: {
        type: { summary: "ReactNode" },
        defaultValue: { summary: "undefined" },
      },
    },
    data: {
      control: "object",
      description:
        "Array of dropdown items. Each item should have: `key` (required), `label` (string), `onClick` (function), and optionally `isSeparator` (boolean)",
      table: {
        type: {
          summary:
            "Array<{ key: string; label?: string; onClick?: () => void; isSeparator?: boolean; }>",
        },
        defaultValue: { summary: "[]" },
      },
    },
    fontWeight: {
      control: "text",
      description:
        "CSS font-weight value. Can be a number (400, 500, etc.) or string (normal, bold, etc.). Used in conjunction with or instead of isBold",
      table: {
        type: { summary: "number | string" },
        defaultValue: { summary: "undefined" },
      },
    },
    isBold: {
      control: "boolean",
      description:
        "Quick way to make text bold (equivalent to fontWeight: 'bold'). Takes precedence over fontWeight if both are specified",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    isTextOverflow: {
      control: "boolean",
      description:
        "When true, long text will be truncated with ellipsis (...). Useful for fixed-width containers",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    color: {
      control: "color",
      description: "Text color of the link",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "theme.color" },
      },
    },
    dropdownType: {
      control: "select",
      options: ["alwaysDashed", "appearDashedAfterHover"],
      description: "Determines when the dashed underline appears",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "alwaysDashed" },
      },
    },
    fontSize: {
      control: "text",
      description: "Font size of the link text",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "13px" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Disables the dropdown functionality",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    withExpander: {
      control: "boolean",
      description: "Shows/hides the expander icon",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    isSemitransparent: {
      control: "boolean",
      description: "Makes the link semi-transparent",
      table: {
        type: { summary: "boolean" },
        defaultValue: { summary: "false" },
      },
    },
    manualWidth: {
      control: "text",
      description:
        "Sets a custom width for the dropdown menu. If not provided, the width is automatically calculated based on the content width plus padding",
      table: {
        type: { summary: "string" },
        defaultValue: { summary: "undefined" },
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LinkWithDropdown>;

type Story = StoryObj<typeof meta>;

export default meta;

const dropdownItems = [
  {
    key: "key1",
    label: "Button 1",
    onClick: () => console.log("Button 1 clicked"),
  },
  {
    key: "key2",
    label: "Button 2",
    onClick: () => console.log("Button 2 clicked"),
  },
  {
    key: "key3",
    isSeparator: true,
  },
  {
    key: "key4",
    label: "Button 3",
    onClick: () => console.log("Button 3 clicked"),
  },
];

export const Default: Story = {
  args: {
    children: "Default Link",
    data: dropdownItems,
    fontSize: "13px",
    fontWeight: 400,
    isBold: false,
    isTextOverflow: false,
    isSemitransparent: false,
  },
};

export const WithExpander: Story = {
  args: {
    ...Default.args,
    children: "Link with Expander",
    withExpander: true,
  },
};

export const CustomStyling: Story = {
  args: {
    ...Default.args,
    children: "Custom Styled Link",
    fontSize: "16px",
    fontWeight: 600,
    isBold: true,
    color: "#4781d1",
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    children: "Disabled Link",
    isDisabled: true,
  },
};

export const SemiTransparent: Story = {
  args: {
    ...Default.args,
    children: "Semi-transparent Link",
    isSemitransparent: true,
  },
};

export const WithCustomWidth: Story = {
  args: {
    ...Default.args,
    children: "Custom Width Link",
    manualWidth: "300px",
  },
};
