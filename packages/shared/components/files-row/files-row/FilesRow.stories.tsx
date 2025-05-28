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

import CopyIconSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";
import TrashIconSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";

import { FilesRow } from ".";

const RowContent = ({ children }: { children: React.ReactNode }) => (
  <div style={{ width: "500px" }}>{children}</div>
);

const contextOptions = [
  {
    key: "copy",
    label: "Copy",
    icon: CopyIconSvgUrl,
  },
  {
    key: "delete",
    label: "Delete",
    icon: TrashIconSvgUrl,
  },
];

const meta = {
  title: "Components/FilesRow/FilesRow",
  component: FilesRow,
  parameters: {
    docs: {
      description: {
        component:
          "FilesRow component for displaying file row content with various states",
      },
    },
  },
  argTypes: {
    checked: { control: "boolean" },
    isActive: { control: "boolean" },
    isThirdPartyFolder: { control: "boolean" },
    isFirstElem: { control: "boolean" },
    isIndexUpdated: { control: "boolean" },
    isDragging: { control: "boolean" },
    showHotkeyBorder: { control: "boolean" },
    isHighlight: { control: "boolean" },
    canDrag: { control: "boolean" },
    isEdit: { control: "boolean" },
    folderCategory: { control: "boolean" },
    withAccess: { control: "boolean" },
    inProgress: { control: "boolean" },
    indeterminate: { control: "boolean" },
    mode: { control: "select", options: ["modern", "default"] },
    isIndexEditingMode: { control: "boolean" },
    withoutBorder: { control: "boolean" },
    contextTitle: { control: "text" },
    isDisabled: { control: "boolean" },

    // disabled controls
    contextOptions: { table: { disable: true } },
    children: { table: { disable: true } },
    contentElement: { table: { disable: true } },
    element: { table: { disable: true } },
    className: { table: { disable: true } },
    id: { table: { disable: true } },
    data: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    onRowClick: { table: { disable: true } },
    getContextModel: { table: { disable: true } },
    style: { table: { disable: true } },
    badgesComponent: { table: { disable: true } },
    badgeUrl: { table: { disable: true } },
    onChangeIndex: { table: { disable: true } },
    rowContextClose: { table: { disable: true } },
    item: { table: { disable: true } },
    isRoom: { table: { disable: true } },
    isArchive: { table: { disable: true } },
    onContextClick: { table: { disable: true } },
    contextButtonSpacerWidth: { table: { disable: true } },
  },
  args: {
    contextOptions,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FilesRow>;

type Story = StoryObj<typeof FilesRow>;
export default meta;

export const Default: Story = {
  args: {
    children: <RowContent>Files Row Content</RowContent>,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
    children: <RowContent>Checked Row</RowContent>,
  },
};

export const Loading: Story = {
  args: {
    inProgress: true,
    children: <RowContent>Loading Row</RowContent>,
  },
};
