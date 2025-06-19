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

import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { v4 as uuidv4 } from "uuid";

import { TableBody } from "./TableBody";
import { TableRow } from "../table-row";
import { TableCell } from "../sub-components/table-cell";
import { Scrollbar } from "../../scrollbar";
import { TableContainer } from "../table-container";

const COLUMN_STORAGE_NAME = "storybook-table-body-column-storage";
const COLUMN_INFO_PANEL_STORAGE_NAME =
  "storybook-table-body-info-panel-storage";

const meta = {
  title: "Components/Table/TableBody",
  component: TableBody,
  tags: ["!autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "TableBody component for displaying data in a table format with infinite scrolling capabilities",
      },
    },
  },
  argTypes: {
    fetchMoreFiles: {
      control: false,
      action: "fetchMoreFiles",
    },
    onScroll: {
      control: false,
      action: "onScroll",
    },
    children: { control: false },
  },
  decorators: [
    (Story, context) => {
      const ref = useRef<HTMLDivElement>(null);
      const [isMounted, setIsMounted] = useState(false);
      const [renderedCount, setRenderedCount] = useState(0);

      useEffect(() => {
        if (!isMounted) {
          setIsMounted(true);
        }
      }, [isMounted, setIsMounted]);

      useEffect(() => {
        if (isMounted) {
          const rowsCount = document.querySelectorAll(
            ".table-container_row",
          ).length;
          setRenderedCount(rowsCount);
        }
      }, [isMounted]);

      return (
        <div>
          <Scrollbar
            id="sectionScroll"
            style={{ height: "400px" }}
            autoHide={false}
          >
            <div style={{ paddingTop: "20px", width: "98%" }}>
              <TableContainer
                forwardedRef={ref}
                useReactWindow={context.args.useReactWindow}
              >
                {isMounted ? <Story /> : null}
              </TableContainer>
            </div>
          </Scrollbar>

          <div style={{ marginTop: "20px", fontSize: "16px" }}>
            <div>useReactWindow: {context.args.useReactWindow.toString()}</div>
            <div>
              Rendered rows: {renderedCount}/{context.args.itemCount}
            </div>
          </div>
        </div>
      );
    },
  ],
} satisfies Meta<typeof TableBody>;

export default meta;
type Story = StoryObj<typeof TableBody>;

const createMockRows = (count: number) => {
  return Array(count)
    .fill(null)
    .map((_, index) => (
      <TableRow
        key={uuidv4()}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 24px" }}
      >
        <TableCell>{`Cell ${index + 1}-1`}</TableCell>
        <TableCell>{`Cell ${index + 1}-2`}</TableCell>
        <TableCell>{`Cell ${index + 1}-3`}</TableCell>
      </TableRow>
    ));
};

export const Default: Story = {
  args: {
    columnStorageName: COLUMN_STORAGE_NAME,
    columnInfoPanelStorageName: COLUMN_INFO_PANEL_STORAGE_NAME,
    fetchMoreFiles: async () => {},
    filesLength: 20,
    hasMoreFiles: false,
    itemCount: 20,
    itemHeight: 50,
    useReactWindow: true,
    infoPanelVisible: false,
    children: createMockRows(20),
  },
};

export const WithoutReactWindow: Story = {
  args: {
    ...Default.args,
    useReactWindow: false,
  },
};

export const CustomItemHeight: Story = {
  args: {
    ...Default.args,
    itemHeight: 80,
  },
};

export const WithMoreFiles: Story = {
  args: {
    ...Default.args,
    children: createMockRows(5),
    filesLength: 5,
    itemCount: 5,
    hasMoreFiles: true,
  },
};
