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
import { Scrollbar } from ".";

const meta = {
  title: "Layout components/Scrollbar",
  component: Scrollbar,
  parameters: {
    docs: {
      description: {
        component:
          "Scrollbar is used for displaying custom scrollbar with auto-hide functionality, custom styling, and both vertical and horizontal scrolling support.",
      },
    },
  },
  argTypes: {
    autoHide: {
      control: "boolean",
      description: "Automatically hide scrollbar when not in use",
      table: { defaultValue: { summary: "false" } },
    },
    fixedSize: {
      control: "boolean",
      description: "Keep scrollbar thumb size fixed",
      table: { defaultValue: { summary: "false" } },
    },
    paddingAfterLastItem: {
      control: "text",
      description: "Add padding after the last item",
    },
    paddingInlineEnd: {
      control: "text",
      description: "Add padding-inline-end",
    },
    style: {
      control: "object",
      description: "Custom styles for the scrollbar container",
    },
  },
} satisfies Meta<typeof Scrollbar>;

type Story = StoryObj<typeof Scrollbar>;

export default meta;

const LongContent = () => (
  <>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <p>
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p>
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
      doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo
      inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
    <p>
      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
      fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
      sequi nesciunt.
    </p>
  </>
);

export const Default: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: false,
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};

export const WithAutoHide: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: true,
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};

export const WithFixedSize: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: false,
    fixedSize: true,
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};

export const WithHorizontalScroll: Story = {
  args: {
    style: { width: 300, height: 100 },
    autoHide: false,
  },
  render: (args) => (
    <Scrollbar {...args}>
      <div
        style={{
          whiteSpace: "nowrap",
          padding: "10px",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <LongContent />
      </div>
    </Scrollbar>
  ),
};

export const WithBothScrollbars: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: false,
  },
  render: (args) => (
    <Scrollbar {...args}>
      <div style={{ width: "500px" }}>
        <LongContent />
      </div>
    </Scrollbar>
  ),
};

export const WithPaddingAfterLastItem: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: false,
    paddingAfterLastItem: "50px",
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};

export const WithPaddingInlineEnd: Story = {
  args: {
    style: { width: 300, height: 200 },
    autoHide: false,
    paddingInlineEnd: "100px",
  },
  render: (args) => (
    <Scrollbar {...args}>
      <LongContent />
    </Scrollbar>
  ),
};
