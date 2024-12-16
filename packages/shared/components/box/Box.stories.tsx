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
import { Box } from ".";

const meta: Meta<typeof Box> = {
  title: "Components/Box",
  component: Box,
  argTypes: {
    displayProp: {
      control: "select",
      options: ["block", "flex", "grid", "inline", "inline-block", "none"],
      description: "Sets the display type of the box",
    },
    flexDirection: {
      control: "select",
      options: ["row", "column", "row-reverse", "column-reverse"],
      description: "Controls flex direction when displayProp is flex",
    },
    alignItems: {
      control: "select",
      options: ["flex-start", "center", "flex-end", "stretch", "baseline"],
      description: "Aligns items along the cross axis",
    },
    justifyContent: {
      control: "select",
      options: [
        "flex-start",
        "center",
        "flex-end",
        "space-between",
        "space-around",
      ],
      description: "Aligns items along the main axis",
    },
    borderProp: {
      control: "object",
      description: "Sets border properties",
    },
    paddingProp: {
      control: "text",
      description: "Sets padding",
    },
    marginProp: {
      control: "text",
      description: "Sets margin",
    },
    backgroundProp: {
      control: "color",
      description: "Sets background color",
    },
  },
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A versatile container component that provides extensive layout control through flexbox, grid, spacing, and styling props.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

// Base example
export const Default: Story = {
  args: {
    children: "Basic Box Content",
    paddingProp: "16px",
    backgroundProp: "#f5f5f5",
    borderProp: "1px solid #ddd",
  },
};

// Layout examples
export const FlexLayout: Story = {
  args: {
    displayProp: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingProp: "16px",
    gapProp: "8px",
    children: (
      <>
        <Box paddingProp="8px" backgroundProp="#e3e3e3">
          Item 1
        </Box>
        <Box paddingProp="8px" backgroundProp="#e3e3e3">
          Item 2
        </Box>
        <Box paddingProp="8px" backgroundProp="#e3e3e3">
          Item 3
        </Box>
      </>
    ),
  },
};

// Border variations
export const BorderStyles: Story = {
  render: () => (
    <Box displayProp="flex" flexDirection="column" gapProp="16px">
      <Box borderProp="1px solid black" paddingProp="8px">
        Solid Border
      </Box>
      <Box borderProp="1px dashed black" paddingProp="8px">
        Dashed Border
      </Box>
      <Box
        borderProp={{
          style: "solid",
          width: "1px",
          color: "black",
          radius: "8px",
        }}
        paddingProp="8px"
      >
        Rounded Border
      </Box>
    </Box>
  ),
};

// Responsive layout
export const ResponsiveGrid: Story = {
  render: () => (
    <Box
      displayProp="grid"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
      }}
    >
      <Box paddingProp="16px" backgroundProp="#e3e3e3">
        Grid Item 1
      </Box>
      <Box paddingProp="16px" backgroundProp="#e3e3e3">
        Grid Item 2
      </Box>
      <Box paddingProp="16px" backgroundProp="#e3e3e3">
        Grid Item 3
      </Box>
    </Box>
  ),
};

// Accessibility example
export const AccessibleBox: Story = {
  args: {
    role: "button",
    "aria-label": "Interactive box",
    onClick: () => alert("Box clicked"),
    paddingProp: "16px",
    backgroundProp: "#007bff",
    style: {
      color: "white",
      cursor: "pointer",
    },
    children: "Click me",
  },
};

// RTL support example
export const RTLSupport: Story = {
  render: () => (
    <Box displayProp="flex" flexDirection="row" gapProp="8px">
      <Box paddingProp="8px" backgroundProp="#e3e3e3">
        First
      </Box>
      <Box paddingProp="8px" backgroundProp="#e3e3e3">
        Second
      </Box>
      <Box paddingProp="8px" backgroundProp="#e3e3e3">
        Third
      </Box>
    </Box>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Box component automatically adjusts layout for RTL languages when interface direction is RTL",
      },
    },
  },
};

// Nested layout example
export const NestedLayout: Story = {
  render: () => (
    <Box
      displayProp="flex"
      flexDirection="column"
      gapProp="16px"
      paddingProp="16px"
      backgroundProp="#f5f5f5"
    >
      <Box paddingProp="16px" backgroundProp="white">
        Header
      </Box>
      <Box displayProp="flex" gapProp="16px">
        <Box flexProp="0 0 200px" paddingProp="16px" backgroundProp="white">
          Sidebar
        </Box>
        <Box flexProp="1" paddingProp="16px" backgroundProp="white">
          Main Content
        </Box>
      </Box>
      <Box paddingProp="16px" backgroundProp="white">
        Footer
      </Box>
    </Box>
  ),
};
