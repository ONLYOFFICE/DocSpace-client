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

import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { TableHeader } from "./TableHeader";
import { type TableHeaderProps, TTableColumn } from "../Table.types";

const TableHeaderWrapper = (args: Omit<TableHeaderProps, "containerRef">) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ width: "100%", maxWidth: "1000px" }}>
      <div ref={containerRef} style={{ display: "grid" }}>
        <TableHeader {...args} containerRef={containerRef} />
      </div>
    </div>
  );
};

const meta = {
  title: "Components/Table/TableHeader",
  component: TableHeader,
  parameters: {
    docs: {
      description: {
        component:
          "TableHeader component for displaying table headers with resizable columns",
      },
    },
  },
  argTypes: {
    onClick: { control: false, table: { disable: true } },
    containerRef: { control: false, table: { disable: true } },
    setHideColumns: { control: false, table: { disable: true } },
    tagRef: { control: false, table: { disable: true } },
    theme: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof TableHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <TableHeaderWrapper {...args} />,
  args: {
    containerRef: { current: null },
    columns: [
      {
        key: "Name",
        title: "Name",
        resizable: true,
        enable: true,
        default: true,
        sortBy: "AZ",
        minWidth: 210,
      },
      {
        key: "Type",
        title: "Type",
        enable: true,
        resizable: true,
        sortBy: "roomType",
      },
      {
        key: "Tags",
        title: "Tags",
        enable: true,
        resizable: true,
        sortBy: "Tags",
        withTagRef: true,
      },
      {
        key: "Owner",
        title: "Owner",
        enable: true,
        resizable: true,
        sortBy: "Author",
      },
    ],
    columnStorageName: "table-header-story",
    sectionWidth: 1000,
    sortBy: "name",
    sorted: true,
    useReactWindow: false,
    showSettings: true,
    sortingVisible: true,
    isLengthenHeader: false,
    resetColumnsSize: false,
    infoPanelVisible: false,
    columnInfoPanelStorageName: "table-header-info-panel-story",
    settingsTitle: "Column Settings",
    isIndexEditingMode: false,
    withoutWideColumn: false,
  },
};

export const WithoutSettings: Story = {
  render: (args) => <TableHeaderWrapper {...args} />,
  args: {
    ...Default.args,
    showSettings: false,
  },
};

export const WithInfoPanel: Story = {
  render: (args) => <TableHeaderWrapper {...args} />,
  args: {
    ...Default.args,
    infoPanelVisible: true,
  },
};

export const WithoutSorting: Story = {
  render: (args) => <TableHeaderWrapper {...args} />,
  args: {
    ...Default.args,
    sortingVisible: false,
  },
};

export const WithCheckbox: Story = {
  render: (args) => <TableHeaderWrapper {...args} />,
  args: {
    ...Default.args,
    columns: [
      {
        key: "checkbox",
        title: "checkbox",
        enable: true,
        default: true,
        active: true,
        minWidth: 180,
        resizable: false,
        checkbox: {
          value: true,
          isIndeterminate: false,
          onChange: () => {},
        },
      },
      ...(Default.args?.columns as TTableColumn[]),
    ],
  },
};
