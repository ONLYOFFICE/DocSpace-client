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
import type { Meta, StoryObj } from "@storybook/react";

import { Text } from ".";
import { globalColors } from "../../themes";

const meta = {
  title: "Base UI Components/Text",
  component: Text,
  parameters: {
    docs: {
      description: {
        component:
          "Component that displays plain text with various styling options",
      },
    },
  },
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
    fontSize: { control: "text" },
    fontWeight: { control: "text" },
    textAlign: {
      control: "select",
      options: ["left", "center", "right", "justify"],
    },
    as: {
      control: "select",
      options: ["p", "span", "div", "h1", "h2", "h3", "h4", "h5", "h6"],
    },
  },
} satisfies Meta<typeof Text>;

type Story = StoryObj<typeof Text>;

export default meta;

export const Default: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>Test text</Text>
    </div>
  ),
  args: {
    title: "",
    as: "p",
    fontSize: "13px",
    fontWeight: "400",
    truncate: false,
    backgroundColor: "",
    isBold: false,
    isItalic: false,
    isInline: false,
  },
};

export const Heading: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>Heading Text</Text>
    </div>
  ),
  args: {
    as: "h1",
    fontSize: "24px",
    fontWeight: "700",
    color: globalColors.black,
  },
};

export const Inline: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>First inline text</Text>{" "}
      <Text {...args}>Second inline text</Text>
    </div>
  ),
  args: {
    isInline: true,
    fontSize: "13px",
  },
};

export const Styled: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>Styled text with custom properties</Text>
    </div>
  ),
  args: {
    fontSize: "16px",
    fontWeight: "600",
    color: globalColors.white,
    backgroundColor: globalColors.black,
    textAlign: "center",
    isBold: true,
    isItalic: true,
    lineHeight: "1.5",
  },
};

export const Interactive: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>Click me!</Text>
    </div>
  ),
  args: {
    isInline: true,
    color: globalColors.bigGrayDarkMid,
    onClick: () => {},
    style: { cursor: "pointer" },
  },
};

export const NoSelect: Story = {
  render: (args) => (
    <div style={{ width: "100%" }}>
      <Text {...args}>This text cannot be selected</Text>
    </div>
  ),
  args: {
    noSelect: true,
    color: globalColors.gray,
  },
};

export const Truncated: Story = {
  render: (args) => (
    <div style={{ width: "200px" }}>
      <Text {...args}>
        This is a very long text that will be truncated when it exceeds the
        container width
      </Text>
    </div>
  ),
  args: {
    truncate: true,
  },
};
