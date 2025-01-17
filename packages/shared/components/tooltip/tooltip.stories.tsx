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
import { Link } from "../link";
import { Text } from "../text";
import { Tooltip } from ".";
import { globalColors } from "../../themes";

const meta = {
  title: "Base UI Components/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component: `
A versatile tooltip component that provides contextual information or hints when hovering over or clicking on elements.

## Features
- Multiple placement options
- Custom styling
- Dynamic content
- Click or hover trigger modes
- Floating behavior
- Arrow customization
`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0?node-id=649%3A4458&mode=dev",
    },
  },
  argTypes: {
    place: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ],
      description: "Position of the tooltip relative to the target element",
    },
    color: {
      control: "color",
      description: "Background color of the tooltip",
    },
    opacity: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
      description: "Opacity of the tooltip",
    },
    maxWidth: {
      control: "text",
      description: "Maximum width of the tooltip",
    },
    noArrow: {
      control: "boolean",
      description: "Whether to show the arrow pointer",
    },
    openOnClick: {
      control: "boolean",
      description: "Open tooltip on click instead of hover",
    },
    float: {
      control: "boolean",
      description: "Enable floating behavior",
    },
  },
} satisfies Meta<typeof Tooltip>;

type Story = StoryObj<typeof Tooltip>;

export default meta;

const bodyStyle = { marginTop: 100, marginInlineStart: 200 };

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link
            data-tooltip-id="default-tooltip"
            data-tooltip-content="Simple tooltip"
          >
            Hover me
          </Link>
        </div>
        <Tooltip {...args} id="default-tooltip" />
      </div>
    );
  },
  args: {
    float: true,
    place: "top",
  },
};

export const CustomStyling: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link
            data-tooltip-id="styled-tooltip"
            data-tooltip-content="Styled tooltip"
          >
            Hover for styled tooltip
          </Link>
        </div>
        <Tooltip {...args} id="styled-tooltip" />
      </div>
    );
  },
  args: {
    color: "green",
    opacity: 0.9,
    maxWidth: "200px",
    noArrow: false,
  },
};

export const ClickToShow: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link
            data-tooltip-id="click-tooltip"
            data-tooltip-content="Click-triggered tooltip"
          >
            Click me
          </Link>
        </div>
        <Tooltip {...args} id="click-tooltip" />
      </div>
    );
  },
  args: {
    openOnClick: true,
    place: "right",
  },
};

export const RichContent: Story = {
  render: (args) => {
    return (
      <div style={{ height: "240px" }}>
        <div style={{ ...bodyStyle, position: "absolute" }}>
          <Link
            data-tooltip-id="rich-tooltip"
            data-tooltip-content="Bob Johnston"
          >
            Hover for rich content
          </Link>
        </div>
        <Tooltip
          {...args}
          id="rich-tooltip"
          getContent={({ content }) => (
            <div>
              <Text isBold fontSize="16px">
                {content}
              </Text>
              <Text color={globalColors.gray} fontSize="13px">
                BobJohnston@gmail.com
              </Text>
              <Text fontSize="13px">Developer</Text>
            </div>
          )}
        />
      </div>
    );
  },
  args: {
    float: true,
    place: "top",
    maxWidth: "250px",
  },
};

export const DynamicGroup: Story = {
  render: () => {
    const users = [
      { name: "Bob", email: "bob@example.com", position: "Developer" },
      { name: "Alice", email: "alice@example.com", position: "Designer" },
      { name: "Charlie", email: "charlie@example.com", position: "Manager" },
    ];

    return (
      <div style={{ padding: "20px" }}>
        <Text>Group of tooltips:</Text>
        <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
          {users.map((user, index) => (
            <Link
              key={user.name}
              data-tooltip-id="group-tooltip"
              data-tooltip-content={index}
            >
              {user.name}
            </Link>
          ))}
        </div>
        <Tooltip
          id="group-tooltip"
          getContent={({ content }) => {
            const user = users[Number(content)];
            return user ? (
              <div>
                <Text isBold fontSize="16px">
                  {user.name}
                </Text>
                <Text color={globalColors.gray} fontSize="13px">
                  {user.email}
                </Text>
                <Text fontSize="13px">{user.position}</Text>
              </div>
            ) : null;
          }}
        />
      </div>
    );
  },
};
