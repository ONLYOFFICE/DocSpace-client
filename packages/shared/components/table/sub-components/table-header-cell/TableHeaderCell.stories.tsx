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
import { TableHeaderCell } from "./TableHeaderCell";
import { SortByFieldName } from "../../../../enums";

const meta = {
  title: "Components/Table/TableHeaderCell",
  component: TableHeaderCell,
  parameters: {
    docs: {
      description: {
        component:
          "TableHeaderCell component for displaying column headers in tables",
      },
    },
  },
  argTypes: {
    column: { control: false },
    onMouseDown: { control: false, table: { disable: true } },
    tagRef: { control: false, table: { disable: true } },
    sortBy: {
      control: "select",
      options: [SortByFieldName.Name, SortByFieldName.Author],
    },
  },

  decorators: [
    (Story) => {
      return (
        <div style={{ maxWidth: "300px" }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof TableHeaderCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    column: {
      key: "name",
      title: "Name",
      enable: true,
      sortBy: SortByFieldName.Name,
      minWidth: 200,
      resizable: false,
      onClick: () => {},
    },
    index: 0,
    onMouseDown: () => {},
    resizable: false,
    sortBy: SortByFieldName.Author,
    sorted: true,
    sortingVisible: true,
  },
};

export const Resizable: Story = {
  args: {
    ...Default.args,
    column: { ...Default.args?.column, resizable: true },
    resizable: true,
  },
};

export const SortedByThisColumn: Story = {
  args: { ...Default.args, sortBy: SortByFieldName.Name },
};

export const WithoutSorting: Story = {
  render: (args) => (
    <div>
      <i style={{ marginBottom: 12 }}>No sorting icon on hover</i>
      <TableHeaderCell {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    sortingVisible: false,
  },
};

export const WithUncheckedCheckbox: Story = {
  render: (args) => (
    <div>
      <i style={{ marginBottom: 12 }}>Checkbox hidden if it is unchecked</i>
      <TableHeaderCell {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    column: {
      key: "checkbox",
      title: "Select",
      enable: true,
      minWidth: 100,
      resizable: false,
      checkbox: {
        value: false,
        isIndeterminate: false,
        onChange: () => {},
      },
    },
  },
};

export const WithCheckedCheckbox: Story = {
  args: {
    ...Default.args,
    column: {
      key: "checkbox",
      title: "Select",
      enable: true,
      minWidth: 100,
      resizable: false,
      checkbox: {
        value: true,
        isIndeterminate: false,
        onChange: () => {},
      },
    },
  },
};

export const WithIndeterminateCheckbox: Story = {
  args: {
    ...Default.args,
    column: {
      key: "checkbox",
      title: "Select",
      enable: true,
      minWidth: 100,
      resizable: false,
      checkbox: {
        value: true,
        isIndeterminate: true,
        onChange: () => {},
      },
    },
  },
};

export const ShortColumn: Story = {
  render: (args) => (
    <div>
      <i style={{ marginBottom: 12 }}>
        Min gap between title and resize-handle is shorter (12px)
      </i>
      <TableHeaderCell {...args} />
    </div>
  ),
  args: {
    ...Default.args,
    resizable: true,
    sortingVisible: false,
    column: {
      ...Default.args?.column,
      title: "#",
      resizable: false,
      isShort: true,
    },
  },
};
