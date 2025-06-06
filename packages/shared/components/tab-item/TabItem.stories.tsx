// (c) Copyright Ascensio System SIA 2009-2025
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

import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";

import { TabItem } from ".";

const meta = {
  title: "Base UI Components/TabItem",
  component: TabItem,
  parameters: {
    docs: {
      description: {
        component: `TabItem is a component used for creating tabs in a navigation interface.
          
### Accessibility

The TabItem component includes the following ARIA attributes for improved accessibility:

- \`aria-selected\`: Indicates whether the tab is currently selected/active
- \`data-testid\`: Provides test identifiers for automated testing`,
      },
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ZiW5KSwb4t7Tj6Nz5TducC/UI-Kit-DocSpace-1.0.0",
    },
  },
  argTypes: {
    label: {
      description: "Tab text or React node to display",
      control: "text",
    },
    isActive: {
      description: "Whether the tab is currently active",
      control: "boolean",
    },
    onSelect: {
      description: "Callback function when tab is selected",
      action: "selected",
    },
    className: {
      description: "Additional CSS class for the tab",
      control: "text",
    },
  },
} satisfies Meta<typeof TabItem>;

type Story = StoryObj<typeof TabItem>;

export default meta;

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        backgroundColor: "#F8F9F9",
        borderRadius: "6px",
      }}
    >
      {children}
    </div>
  );
};

export const Default: Story = {
  args: {
    label: "Tab Item",
    isActive: false,
  },
};

export const Active: Story = {
  args: {
    label: "Active Tab",
    isActive: true,
  },
};

export const WithReactNodeAsLabel: Story = {
  args: {
    label: (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#2DA7DB" }}>●</span>
        <span>Tab with Icon</span>
      </div>
    ),
    isActive: false,
  },
};

// Create a proper React component for the TabGroup story
const TabGroupExample = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <Wrapper>
      <TabItem
        label="First Tab"
        isActive={activeTab === "tab1"}
        onSelect={() => setActiveTab("tab1")}
      />
      <TabItem
        label="Second Tab"
        isActive={activeTab === "tab2"}
        onSelect={() => setActiveTab("tab2")}
      />
      <TabItem
        label="Third Tab"
        isActive={activeTab === "tab3"}
        onSelect={() => setActiveTab("tab3")}
      />
    </Wrapper>
  );
};

export const TabGroup: Story = {
  render: () => <TabGroupExample />,
  parameters: {
    docs: {
      description: {
        story: "An example of a group of tabs with interactive selection.",
      },
    },
  },
};
