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

import React from "react";
import { Meta, StoryObj } from "@storybook/react";

import { FilesRowWrapper } from ".";

const RowContent = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: "16px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {children}
  </div>
);

const meta = {
  title: "Components/FilesRow/FilesRowWrapper",
  component: FilesRowWrapper,
  parameters: {
    docs: {
      description: {
        component:
          "FilesRowWrapper component that provides styling and behavior for file rows",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    isActive: { control: "boolean" },
    isIndexEditingMode: { control: "boolean" },
    isFirstElem: { control: "boolean" },
    isIndexUpdated: { control: "boolean" },
    isDragging: { control: "boolean" },
    showHotkeyBorder: { control: "boolean" },
    isHighlight: { control: "boolean" },
    className: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  decorators: [
    (Story) => (
      <div style={{ paddingInline: "24px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilesRowWrapper>;

type Story = StoryObj<typeof FilesRowWrapper>;
export default meta;

export const Default: Story = {
  args: {
    children: <RowContent>Files Row Content</RowContent>,
  },
};

export const Active: Story = {
  args: {
    isActive: true,
    children: <RowContent>Active Row</RowContent>,
  },
};

export const IndexEditing: Story = {
  args: {
    isIndexEditingMode: true,
    children: <RowContent>Index Editing Mode</RowContent>,
  },
};

export const FirstElement: Story = {
  args: {
    isFirstElem: true,
    children: <RowContent>First Element Row</RowContent>,
  },
};

export const IndexUpdated: Story = {
  args: {
    isIndexUpdated: true,
    children: <RowContent>Index Updated Row</RowContent>,
  },
};

export const HotkeyBorder: Story = {
  args: {
    showHotkeyBorder: true,
    children: <RowContent>Row with Hotkey Border</RowContent>,
  },
};

export const Highlight: Story = {
  args: {
    isHighlight: true,
    children: <RowContent>Highlighted Row</RowContent>,
  },
};
