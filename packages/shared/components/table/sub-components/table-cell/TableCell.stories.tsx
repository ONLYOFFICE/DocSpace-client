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

import type { Meta, StoryObj } from "@storybook/react";

import { TableCell } from "./TableCell";
import { Avatar, AvatarRole, AvatarSize } from "../../../avatar";
import { Checkbox } from "../../../checkbox";

const meta: Meta<typeof TableCell> = {
  title: "Components/Table/TableCell",
  component: TableCell,
  parameters: {
    docs: {
      description: {
        component: "TableCell component used in table structures",
      },
    },
  },
  argTypes: {
    forwardedRef: {
      control: false,
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TableCell>;

export const Simple: Story = {
  args: {
    className: "custom-cell",
    children: "Cell Content",
    hasAccess: false,
    checked: false,
  },
};

export const WithElement: Story = {
  render: (args) => (
    <TableCell {...args}>
      <div className="table-container_element">
        <Avatar
          role={AvatarRole.none}
          size={AvatarSize.min}
          source=""
          noClick={!args.hasAccess}
        />
      </div>
      <Checkbox
        className="table-container_row-checkbox"
        isChecked={args.checked}
      />
    </TableCell>
  ),
  args: {
    className: "custom-cell",
    hasAccess: true,
    checked: false,
  },
};

export const WithElementChecked: Story = {
  render: (args) => (
    <TableCell {...args}>
      <div className="table-container_element">
        <Avatar
          role={AvatarRole.none}
          size={AvatarSize.min}
          source=""
          noClick={!args.hasAccess}
        />
      </div>
      <Checkbox
        className="table-container_row-checkbox"
        isChecked={args.checked}
      />
    </TableCell>
  ),
  args: {
    className: "custom-cell",
    hasAccess: true,
    checked: true,
  },
};

export const WithElementNoAccess: Story = {
  render: (args) => (
    <TableCell {...args}>
      <div className="table-container_element">
        <Avatar
          role={AvatarRole.none}
          size={AvatarSize.min}
          source=""
          noClick={!args.hasAccess}
        />
      </div>
      <Checkbox
        className="table-container_row-checkbox"
        isChecked={args.checked}
      />
    </TableCell>
  ),
  args: {
    className: "custom-cell",
    hasAccess: false,
    checked: false,
  },
};
