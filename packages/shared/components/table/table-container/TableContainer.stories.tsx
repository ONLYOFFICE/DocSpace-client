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

import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { uuid as uuidv4 } from "../../../utils/";

import { TableContainer } from "./TableContainer";
import { Scrollbar } from "../../scrollbar";
import { TableRow } from "../table-row";
import { TableCell } from "../sub-components/table-cell";
import { TableHeader } from "../table-header";
import { SortByFieldName } from "../../../enums";
import type { TableContainerProps } from "../Table.types";
import { TableBody } from "../table-body";

const COLUMN_STORAGE_NAME = "storybook-table-container-column-storage";
const COLUMN_INFO_PANEL_STORAGE_NAME =
  "storybook-table-container-info-panel-storage";

const mockColumns = [
  {
    key: "Column 1",
    title: "Column 1",
    resizable: true,
    enable: true,
    default: true,
    sortBy: SortByFieldName.Name,
    minWidth: 210,
    onChange: () => {},
    onClick: () => {},
  },
  {
    key: "Column 2",
    title: "Column 2",
    enable: true,
    resizable: true,
    sortBy: SortByFieldName.Type,
    onChange: () => {},
    onClick: () => {},
  },
  {
    key: "Column 3",
    title: "Column 3",
    enable: true,
    resizable: true,
    sortBy: SortByFieldName.Tags,
    withTagRef: true,
    onChange: () => {},
    onClick: () => {},
  },
];

const createTableRows = (count: number) => {
  return Array.from({ length: count }, (_, index) => {
    return (
      <TableRow key={uuidv4()}>
        <TableCell>{`Cell ${index + 1}-1`}</TableCell>
        <TableCell>{`Cell ${index + 1}-2`}</TableCell>
        <TableCell>{`Cell ${index + 1}-3`}</TableCell>
      </TableRow>
    );
  });
};

const TableContainerWrapper = (props: TableContainerProps) => {
  const { useReactWindow } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <TableContainer {...props} forwardedRef={containerRef}>
      <TableHeader
        containerRef={containerRef}
        columns={mockColumns}
        columnStorageName={COLUMN_STORAGE_NAME}
        columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
        sectionWidth={800}
        useReactWindow={useReactWindow}
        showSettings
        sortingVisible
        sorted
      />
      <TableBody
        columnStorageName={COLUMN_STORAGE_NAME}
        columnInfoPanelStorageName={COLUMN_INFO_PANEL_STORAGE_NAME}
        fetchMoreFiles={async () => {}}
        filesLength={10}
        hasMoreFiles={false}
        itemCount={10}
        itemHeight={50}
        useReactWindow={useReactWindow}
      >
        {createTableRows(10)}
      </TableBody>
    </TableContainer>
  );
};

const meta = {
  title: "Components/Table/TableContainer",
  component: TableContainerWrapper,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "TableContainer is a container component for table elements (header, rows, cells). It applies specific styling when used with react-window for virtualized tables, including grid layout and scrolling behavior.",
      },
    },
  },
  argTypes: {
    forwardedRef: { control: false },
    children: { control: false },
  },
  decorators: [
    (Story) => {
      return (
        <div>
          <div style={{ marginBottom: "20px", fontSize: "14px" }}>
            <p>
              <strong>Note:</strong> TableContainer is a wrapper for table
              elements (header, body, rows, cells). When used with react-window,
              it sets specific styles to properly contain virtualized content.
            </p>
          </div>
          <Scrollbar
            id="sectionScroll"
            style={{ height: "400px" }}
            autoHide={false}
          >
            <div style={{ marginTop: "25px" }}>
              <Story />
            </div>
          </Scrollbar>
        </div>
      );
    },
  ],
} satisfies Meta<typeof TableContainer>;

export default meta;
type Story = StoryObj<typeof TableContainer>;

export const Default: Story = {
  args: {
    useReactWindow: false,
  },
};
