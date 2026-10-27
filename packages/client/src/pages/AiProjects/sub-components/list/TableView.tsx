/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { use } from "react";
import classnames from "classnames";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "@onlyoffice/apps-ui-kit/components/table";
import type { TTableColumn } from "@onlyoffice/apps-ui-kit/components/table";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";
import { Context } from "@onlyoffice/apps-ui-kit/utils/context";
import type { TAiProject } from "@docspace/shared/api/ai/projects";
import { Events } from "@docspace/shared/enums";

import type AiProjectsStore from "SRC_DIR/store/AiProjectsStore";

import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { ProjectLogo } from "./ProjectLogo";
import { SourceTags } from "./SourceTags";
import styles from "../../AiProjects.module.scss";

// Column widths are persisted per user, one key with the info panel closed
// and one with it open, as in Files. The ui-kit table renders nothing at all
// while either key is missing.
const COLUMN_STORAGE = "aiProjectsColumns";
const COLUMN_STORAGE_INFO_PANEL = "aiProjectsColumnsInfoPanel";
// The keys of the columns shown, chosen with the cog of the header (per
// user), in the comma-separated form TableStore uses for the other tables.
const TABLE_COLUMNS_STORAGE = "aiProjectsTableColumns";

const ROW_HEIGHT = 48;

type ColumnKey = "Name" | "Instructions" | "Knowledge" | "Activity";

/** Applies the saved choice to the default columns, as TableStore.getColumns does. */
const applySavedColumns = (columns: TTableColumn[], storageName: string) => {
  try {
    const saved = localStorage.getItem(storageName);
    if (saved === null) return columns;
    const keys = saved.split(",");
    return columns.map((column) =>
      column.default ? column : { ...column, enable: keys.includes(column.key as string) },
    );
  } catch {
    return columns;
  }
};

type TableViewProps = {
  store: AiProjectsStore;
  onOpen: (project: TAiProject) => void;
  getContextModel: (project: TAiProject) => import("@onlyoffice/apps-ui-kit/components/context-menu").ContextMenuModel[];
  locale?: string;
  userId: string;
  /** The info panel is open, which narrows the table (own column widths). */
  infoPanelVisible: boolean;
};

export const TableView = observer(
  ({ store, onOpen, getContextModel, locale, userId, infoPanelVisible }: TableViewProps) => {
    const { t } = useTranslation(["Common"]);
    const { sectionWidth } = use(Context);
    const columnStorageName = `${COLUMN_STORAGE}=${userId}`;
    const columnInfoPanelStorageName = `${COLUMN_STORAGE_INFO_PANEL}=${userId}`;
    const tableStorageName = `${TABLE_COLUMNS_STORAGE}=${userId}`;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [hideColumns, setHideColumns] = React.useState(false);

    const sortBy = store.sortBy === "AZ" ? "AZ" : "DateAndTime";
    const onSort = (key: string) => {
      const next = key === "AZ" ? "AZ" : "DateAndTime";
      const flip = store.sortBy === next;
      store.setSort(
        next,
        flip ? (store.sortOrder === "ascending" ? "descending" : "ascending") : "ascending",
      );
    };

    // The columns live in state and are toggled in place, the way the class
    // headers of Files and Contacts do it: the ui-kit header compares the
    // `enable` flags of the array it was given last time with the new ones.
    const onColumnChange = (key: string) => {
      setColumns((prev) => {
        const next = prev.map((column) => (column.key === key ? { ...column, enable: !column.enable } : column));
        try {
          localStorage.setItem(
            tableStorageName,
            next
              .filter((column) => column.enable)
              .map((column) => column.key)
              .join(","),
          );
        } catch {
          // Storage may be unavailable (private mode); the choice then lives for the session.
        }
        return next;
      });
      window.dispatchEvent(new Event(Events.CHANGE_COLUMN));
    };

    const [columns, setColumns] = React.useState<TTableColumn[]>(() =>
      applySavedColumns(
        [
          {
            key: "Name",
            title: t("Common:Name"),
            resizable: true,
            enable: true,
            default: true,
            sortBy: "AZ",
            minWidth: 210,
            onClick: onSort,
          },
          {
            key: "Instructions",
            title: t("Common:AIProjectInstructions"),
            resizable: true,
            enable: true,
            minWidth: 160,
            onChange: onColumnChange,
          },
          {
            key: "Knowledge",
            title: t("Common:Knowledge"),
            resizable: true,
            enable: true,
            minWidth: 160,
            onChange: onColumnChange,
          },
          {
            key: "Activity",
            title: t("Common:AIProjectLastActivity"),
            resizable: true,
            enable: true,
            sortBy: "DateAndTime",
            onClick: onSort,
            onChange: onColumnChange,
            defaultSize: 180,
          },
        ],
        tableStorageName,
      ),
    );

    const isEnabled = (key: ColumnKey) => columns.find((column) => column.key === key)?.enable ?? false;

    return (
      // Virtualised like every other table of the client: in the Section's
      // sticky-header mode the table header stays in flow, and only this mode
      // keeps it out of the column grid of the rows.
      <TableContainer forwardedRef={containerRef} useReactWindow className={styles.table}>
        <TableHeader
          containerRef={containerRef}
          columns={columns}
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          infoPanelVisible={infoPanelVisible}
          sectionWidth={sectionWidth ?? 0}
          sortBy={sortBy}
          sorted={store.sortOrder === "descending"}
          useReactWindow
          showSettings
          settingsTitle={t("Common:TableSettingsTitle")}
          setHideColumns={setHideColumns}
        />
        <TableBody
          columnStorageName={columnStorageName}
          columnInfoPanelStorageName={columnInfoPanelStorageName}
          infoPanelVisible={infoPanelVisible}
          // Infinite scroll as in Files: the total sizes the list, the next
          // page loads as its end comes into view.
          fetchMoreFiles={store.fetchMoreProjects}
          filesLength={store.projects.length}
          hasMoreFiles={store.hasMoreProjects}
          itemCount={store.total}
          itemHeight={ROW_HEIGHT}
          useReactWindow
        >
          {store.projects.map((project) => (
            <TableRow
              key={project.id}
              className={styles.tableRow}
              getContextModel={() => getContextModel(project)}
              contextOptions={getContextModel(project)}
              onDoubleClick={() => onOpen(project)}
              hideColumns={hideColumns}
              dataTestId={`ai-project-row-${project.id}`}
            >
              <TableCell className={classnames(styles.nameCell, "table-container_file-name-cell")}>
                <ProjectLogo project={project} />
                <Text
                  className={styles.nameLink}
                  fontWeight={600}
                  fontSize="13px"
                  truncate
                  title={project.title}
                  onClick={() => onOpen(project)}
                >
                  {project.title}
                </Text>
              </TableCell>
              {isEnabled("Instructions") ? (
                <TableCell>
                  <SourceTags rooms={project.aiProject.instructionsRooms} columnCount={2} />
                </TableCell>
              ) : (
                // A disabled column keeps a 0px track in the grid, so the row
                // keeps a placeholder for it (as every other table does).
                <div />
              )}
              {isEnabled("Knowledge") ? (
                <TableCell>
                  <SourceTags rooms={project.aiProject.knowledgeRooms} columnCount={2} />
                </TableCell>
              ) : (
                // A disabled column keeps a 0px track in the grid, so the row
                // keeps a placeholder for it (as every other table does).
                <div />
              )}
              {isEnabled("Activity") ? (
                <TableCell>
                  <Text className={styles.dim} fontSize="12px" truncate>
                    {getCorrectDate(locale ?? "en", project.updated)}
                  </Text>
                </TableCell>
              ) : (
                // A disabled column keeps a 0px track in the grid, so the row
                // keeps a placeholder for it (as every other table does).
                <div />
              )}
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    );
  },
);

export default TableView;
