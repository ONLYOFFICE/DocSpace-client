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

import type { TFunction } from "i18next";

import type { TGroup } from "@docspace/shared/api/groups/types";
import {
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import { ManagerCell, MembersCell, NameCell } from "./GroupsCells";

/** The old header's column keys, which the record of visible columns keeps. */
export const MEMBERS_COLUMN = "People";
export const MANAGER_COLUMN = "Head of Group";

/** Which of the columns after the title are on. */
export type TGroupsColumnFlags = {
  [MEMBERS_COLUMN]: boolean;
  [MANAGER_COLUMN]: boolean;
};

const testId = (part: string) => (_: TGroup, index: number) =>
  `contacts_table_groups_${part}_cell_${index}`;

/**
 * The record of visible columns in the old header's format: every column in
 * order, its key when it is on and `false` when it is not.
 */
export const groupsColumnsRecord = (flags: TGroupsColumnFlags) =>
  [
    "Name",
    flags[MEMBERS_COLUMN] && MEMBERS_COLUMN,
    flags[MANAGER_COLUMN] && MANAGER_COLUMN,
  ].join(",");

/** The title, the members and the head of the group, and the settings. */
export const getGroupsColumns = (
  t: TFunction,
  flags: TGroupsColumnFlags,
): DataTableColumn<TGroup>[] => [
  {
    id: "Name",
    title: t("Common:Title"),
    width: { type: "fill" },
    sortKey: "title",
    cellClassName: "table-container_group-title-cell",
    cellTestId: testId("title"),
    cell: (group, { index }) => <NameCell group={group} index={index} />,
  },
  {
    id: MEMBERS_COLUMN,
    title: t("Common:Members"),
    width: { type: "flex" },
    visible: flags[MEMBERS_COLUMN],
    hideable: true,
    sortKey: "membersCount",
    cellClassName: "table-container_group-people",
    cellTestId: testId("members_count"),
    cell: (group) => <MembersCell group={group} />,
  },
  {
    id: MANAGER_COLUMN,
    title: t("Common:HeadOfGroup"),
    width: { type: "flex" },
    visible: flags[MANAGER_COLUMN],
    hideable: true,
    sortKey: "manager",
    cellClassName: "table-container_group-manager",
    cellTestId: testId("manager"),
    cell: (group) => <ManagerCell group={group} />,
  },
  settingsColumn<TGroup>({
    title: t("Common:TableSettingsTitle"),
    withContextMenu: true,
    // The old rows' menu button test id, which the client's specs look for.
    contextMenuButtonTestId: "context-menu-button",
  }),
];
