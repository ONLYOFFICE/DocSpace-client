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
import { Text } from "../text";
import { HelpButton } from ".";

const meta = {
  title: "Interactive Elements/HelpButton",
  component: HelpButton,
  parameters: {
    docs: {
      description: {
        component:
          "HelpButton is a component that displays a help icon with a tooltip. It's commonly used to provide additional information or guidance to users.",
      },
    },
  },
  argTypes: {
    tooltipContent: {
      description: "Content to be displayed in the tooltip",
      control: "text",
    },
    place: {
      description: "Position of the tooltip relative to the button",
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    size: {
      description: "Size of the help icon",
      control: { type: "number", min: 8, max: 48 },
    },
    color: {
      description: "Color of the help icon",
      control: "color",
    },
    isClickable: {
      description: "Whether the button is clickable",
      control: "boolean",
    },
    openOnClick: {
      description: "Whether to open tooltip on click instead of hover",
      control: "boolean",
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HelpButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic HelpButton with default settings
export const Default: Story = {
  args: {
    tooltipContent: "This is a help tooltip",
    place: "right",
    offset: 8,
  },
};

// HelpButton with custom size and color
export const CustomStyle: Story = {
  args: {
    tooltipContent: "Customized help button",
    size: 24,
    color: "#2DA7DB",
    place: "top",
    offset: 12,
  },
};

// HelpButton with rich content
export const RichContent: Story = {
  args: {
    tooltipContent: (
      <div style={{ padding: "8px" }}>
        <Text fontSize="14px" fontWeight="bold">
          Help Information
        </Text>
        <ul style={{ margin: "8px 0" }}>
          <li>First instruction</li>
          <li>Second instruction</li>
          <li>Third instruction</li>
        </ul>
        <Text fontSize="12px" color="gray">
          Click for more details
        </Text>
      </div>
    ),
    place: "right",
    offset: 8,
  },
};

// HelpButton with dynamic content
export const DynamicContent: Story = {
  args: {
    getContent: () => "This content is generated dynamically",
    place: "top",
    offset: 8,
  },
};

// HelpButton with custom positioning
export const CustomPosition: Story = {
  decorators: [
    (Story) => (
      <div
        style={{ padding: "50px", display: "flex", justifyContent: "center" }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    tooltipContent: "Custom positioned tooltip",
    place: "right",
    offset: 16,
    style: { position: "relative" },
  },
};
