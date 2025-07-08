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
import type { Meta, StoryObj } from "@storybook/react";

import { ContextMenuModel } from "../../context-menu";
import { TableCell } from "../sub-components/table-cell";
import { TableRow } from "./TableRow";

const meta: Meta<typeof TableRow> = {
  title: "Components/Table/TableRow",
  component: TableRow,
  parameters: {
    docs: {
      description: {
        component:
          "TableRow component for displaying a row in a table with context menu support",
      },
    },
  },
  argTypes: {
    fileContextClick: { control: false, table: { disable: true } },
    onHideContextMenu: { control: false, table: { disable: true } },
    getContextModel: { control: false, table: { disable: true } },
    forwardedRef: { control: false, table: { disable: true } },
    onClick: { control: false, table: { disable: true } },
  },
  args: {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr) 24px",
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableRow>;

const contextOptions: ContextMenuModel[] = [
  {
    key: "edit",
    label: "Edit",
    onClick: () => console.log("Edit clicked"),
  },
  {
    key: "delete",
    label: "Delete",
    onClick: () => console.log("Delete clicked"),
  },
];

const RowContent = (
  <>
    <TableCell>
      <span>Cell 1</span>
    </TableCell>
    <TableCell>
      <span>Cell 2</span>
    </TableCell>
    <TableCell>
      <span>Cell 3</span>
    </TableCell>
  </>
);

export const Default: Story = {
  args: {
    children: RowContent,
    className: "custom-row-class",
    selectionProp: { className: "selection-class" },
    title: "Context menu",
    contextOptions,
  },
};

export const IndexEditingMode: Story = {
  args: {
    children: RowContent,
    className: "custom-row-class",
    selectionProp: { className: "selection-class" },
    isIndexEditingMode: true,
  },
};
