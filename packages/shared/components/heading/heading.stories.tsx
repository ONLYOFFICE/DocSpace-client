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

import { Heading } from ".";

const meta = {
  title: "Base UI Components/Heading",
  component: Heading,
  argTypes: {
    color: { control: "color" },
    level: {
      control: { type: "select" },
      options: ["h1", "h2", "h3", "h4", "h5", "h6"],
    },
    size: {
      control: { type: "select" },
      options: ["xsmall", "small", "medium", "large", "xlarge"],
    },
    type: {
      control: { type: "select" },
      options: ["default", "header", "menu", "content"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Flexible Heading component with multiple configuration options",
      },
    },
  },
} satisfies Meta<typeof Heading>;

type Story = StoryObj<typeof Heading>;

export default meta;

export const Default: Story = {
  args: {
    level: "h1",
    size: "large",
    children: "Default Heading",
  },
};

export const HeadingLevels: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading level="h1">H1 Heading</Heading>
      <Heading level="h2">H2 Heading</Heading>
      <Heading level="h3">H3 Heading</Heading>
      <Heading level="h4">H4 Heading</Heading>
      <Heading level="h5">H5 Heading</Heading>
      <Heading level="h6">H6 Heading</Heading>
    </div>
  ),
};

export const HeadingSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading level="h1" size="xsmall">
        XSmall Heading
      </Heading>
      <Heading level="h1" size="small">
        Small Heading
      </Heading>
      <Heading level="h1" size="medium">
        Medium Heading
      </Heading>
      <Heading level="h1" size="large">
        Large Heading
      </Heading>
      <Heading level="h1" size="xlarge">
        XLarge Heading
      </Heading>
    </div>
  ),
};

export const HeadingTypes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading level="h1" type="header">
        Header Type
      </Heading>
      <Heading level="h1" type="menu">
        Menu Type
      </Heading>
      <Heading level="h1" type="content">
        Content Type
      </Heading>
    </div>
  ),
};

export const StyledHeadings: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading level="h1" color="red" fontSize="24px" fontWeight={700}>
        Custom Styled Heading
      </Heading>
      <Heading level="h2" truncate style={{ maxWidth: "200px" }}>
        Truncated Long Heading That Will Be Shortened with Ellipsis
      </Heading>
      <Heading level="h3" isInline>
        Inline Heading
      </Heading>
    </div>
  ),
};

export const AccessibilityHeadings: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading level="h1" aria-label="Descriptive Accessibility Label">
        Heading with Aria Label
      </Heading>
      <Heading level="h2" aria-describedby="additional-description">
        Heading with Aria Describedby
      </Heading>
      <div id="additional-description" style={{ display: "none" }}>
        This is an additional description for the heading
      </div>
    </div>
  ),
};

export const CustomDataAttributes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Heading
        level="h1"
        data-custom="custom-value"
        data-testid="custom-heading"
      >
        Heading with Custom Data Attributes
      </Heading>
    </div>
  ),
};
