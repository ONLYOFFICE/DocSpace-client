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

import SearchReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.react.svg?url";
import MailReactSvgUrl from "PUBLIC_DIR/images/mail.react.svg?url";
import CatalogPinReactSvgUrl from "PUBLIC_DIR/images/pin.react.svg?url";
import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";
import PersonReactSvg from "PUBLIC_DIR/images/person.react.svg?url";
import QuestionReactSvg from "PUBLIC_DIR/images/question.react.svg?url";
import SettingsReactSvg from "PUBLIC_DIR/images/settings.react.svg?url";
import { IconButton } from ".";

const meta = {
  title: "Interactive Elements/IconButton",
  component: IconButton,
  parameters: {
    docs: {
      description: {
        component: `
IconButton is a versatile button component that displays an icon and handles various interaction states.

Features:
- Supports hover and click states with different icons and colors
- Customizable size and colors
- Can be disabled
- Supports custom icon nodes
- Handles mouse events (click, hover, down, up)
        `,
      },
    },
  },
  argTypes: {
    color: {
      control: "color",
      description: "The default color of the icon",
    },
    clickColor: {
      control: "color",
      description: "The color of the icon when clicked",
    },
    hoverColor: {
      control: "color",
      description: "The color of the icon when hovered",
    },
    onClick: {
      action: "onClick",
      description: "Function called when the button is clicked",
    },
    size: {
      control: { type: "number", min: 12, max: 50 },
      description: "Size of the icon button in pixels",
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    isFill: {
      control: "boolean",
      description: "Whether to fill the icon",
    },
    isStroke: {
      control: "boolean",
      description: "Whether to apply stroke to the icon",
    },
    iconName: {
      control: {
        type: "select",
      },
      options: [
        SearchReactSvgUrl,
        EyeReactSvgUrl,
        InfoReactSvgUrl,
        MailReactSvgUrl,
        CatalogPinReactSvgUrl,
        CrossReactSvgUrl,
        PersonReactSvg,
        QuestionReactSvg,
        SettingsReactSvg,
      ],
      description: "The main icon to display",
    },
    iconHoverName: {
      control: {
        type: "select",
      },
      options: [
        SearchReactSvgUrl,
        EyeReactSvgUrl,
        InfoReactSvgUrl,
        MailReactSvgUrl,
        CatalogPinReactSvgUrl,
        CrossReactSvgUrl,
        PersonReactSvg,
        QuestionReactSvg,
        SettingsReactSvg,
      ],
      description: "The icon to display on hover",
    },
    iconClickName: {
      control: {
        type: "select",
      },
      options: [
        SearchReactSvgUrl,
        EyeReactSvgUrl,
        InfoReactSvgUrl,
        MailReactSvgUrl,
        CatalogPinReactSvgUrl,
        CrossReactSvgUrl,
        PersonReactSvg,
        QuestionReactSvg,
        SettingsReactSvg,
      ],
      description: "The icon to display when clicked",
    },
  },
} satisfies Meta<typeof IconButton>;

type Story = StoryObj<typeof IconButton>;
export default meta;

export const Default: Story = {
  render: (args) => <IconButton {...args} />,
  args: {
    size: 25,
    iconName: SearchReactSvgUrl,
    isFill: true,
    isDisabled: false,
  },
};

export const WithHoverState: Story = {
  args: {
    ...Default.args,
    iconHoverName: EyeReactSvgUrl,
    hoverColor: "#333",
  },
};

export const WithClickState: Story = {
  args: {
    ...Default.args,
    iconClickName: InfoReactSvgUrl,
    clickColor: "green",
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    isDisabled: true,
  },
};

export const CustomSize: Story = {
  args: {
    ...Default.args,
    size: 40,
  },
};

export const WithStroke: Story = {
  args: {
    ...Default.args,
    isStroke: true,
    isFill: false,
  },
};

export const WithCustomNode: Story = {
  args: {
    ...Default.args,
    // Example of passing a custom React node instead of an SVG icon
    iconNode: (
      <div
        style={{
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          color: "#fff",
          background:
            "linear-gradient(135deg, rgba(106,17,203,1) 0%, rgba(37,117,252,1) 100%)",
          boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
        }}
        title="Custom node"
      >
        IC
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates using the `iconNode` prop to pass any custom React node (e.g., avatar/initials) instead of an SVG icon. In this example, we render a small 'JD' avatar tile.",
      },
    },
  },
};
