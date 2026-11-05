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

import { SortByFieldName } from "@docspace/shared/enums";
import {
  settingsColumn,
  type DataTableColumn,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import type { TItem } from "./UsersDataTableView.types";

import {
  AISpendingCell,
  EmailCell,
  GroupsCell,
  InvitedDateCell,
  InviterCell,
  NameCell,
  StorageCell,
  TypeCell,
} from "./UsersCells";

/** The Contacts tabs this table lists. */
export type TUsersTab = "people" | "guests" | "inside_group";

/** Which of a tab's columns are on, by the old header's column keys. */
export type TUsersColumnFlags = Partial<Record<string, boolean>>;

export type TUsersColumnsOptions = {
  t: TFunction;
  tab: TUsersTab;
  flags: TUsersColumnFlags;
  showStorageInfo: boolean;
  showAISpendingInfo: boolean;
  isDefaultUsersQuotaSet: boolean;
  isRoomAdmin: boolean;
};

type TColumnSpec = {
  /** The old header's column key: the id, the flag and the stored name. */
  id: string;
  title: (options: TUsersColumnsOptions) => string;
  /** The people filter's `sortBy` the column sorts by. */
  sortKey?: string;
  /** Cell class of the old row, which the client's styles and specs use. */
  className: string;
  /** Part of the cells' test id, `contacts_<part>_cell_<index>`. */
  testIdPart: string;
  cell: () => React.ReactNode;
};

const COLUMNS: Record<string, TColumnSpec> = {
  Type: {
    id: "Type",
    title: ({ t }) => t("Common:Type"),
    sortKey: "type",
    className: "table-cell_type",
    testIdPart: "type",
    cell: () => <TypeCell />,
  },
  Department: {
    id: "Department",
    title: ({ t }) => t("Common:Group"),
    sortKey: "department",
    className: "table-cell_groups",
    testIdPart: "groups",
    cell: () => <GroupsCell />,
  },
  Mail: {
    id: "Mail",
    title: ({ t }) => t("Common:Email"),
    sortKey: "email",
    className: "table-cell_email",
    testIdPart: "email",
    cell: () => <EmailCell />,
  },
  Inviter: {
    id: "Inviter",
    title: ({ t }) => t("Common:Inviter"),
    sortKey: "createdby",
    className: "table-cell_inviter",
    testIdPart: "inviter",
    cell: () => <InviterCell />,
  },
  InvitedDate: {
    id: "InvitedDate",
    title: ({ t }) => t("PeopleTranslations:RegistrationDate"),
    sortKey: "registrationDate",
    className: "table-cell_invited-date",
    testIdPart: "invited_date",
    cell: () => <InvitedDateCell />,
  },
  Storage: {
    id: "Storage",
    title: ({ t, isDefaultUsersQuotaSet }) =>
      isDefaultUsersQuotaSet
        ? t("Common:StorageAndQuota")
        : t("Common:Storage"),
    sortKey: SortByFieldName.UsedSpace,
    className: "table-cell_Storage/Quota",
    testIdPart: "storage",
    cell: () => <StorageCell />,
  },
  AISpending: {
    id: "AISpending",
    title: ({ t }) => t("Common:AISpending"),
    className: "table-cell_AISpending",
    testIdPart: "ai_spending",
    cell: () => <AISpendingCell />,
  },
};

/** The sort key of the name column; the people filter calls it `displayname`. */
export const NAME_SORT_KEY = "AZ";

/**
 * The columns a tab can show after the name, in order, as the old header
 * built them: guests have no type, group, storage or AI spending, and room
 * admins do not see who invited a guest or when.
 */
export const getUsersColumnIds = ({
  tab,
  showStorageInfo,
  showAISpendingInfo,
  isRoomAdmin,
}: TUsersColumnsOptions) => {
  if (tab === "guests")
    return isRoomAdmin ? ["Mail"] : ["Mail", "Inviter", "InvitedDate"];

  return [
    "Type",
    "Department",
    "Mail",
    ...(showStorageInfo ? ["Storage"] : []),
    ...(showAISpendingInfo ? ["AISpending"] : []),
  ];
};

/**
 * The record of visible columns in the old header's format: the keys of the
 * columns that are on, the name included.
 */
export const usersColumnsRecord = (
  options: TUsersColumnsOptions,
  flags: TUsersColumnFlags,
) =>
  ["Name", ...getUsersColumnIds(options).filter((id) => flags[id])].join(",");

const rowTestId = (part: string) => (_: TItem, index: number) =>
  `contacts_${part}_cell_${index}`;

/** The name, the tab's other columns, and the settings with the row menus. */
export const getUsersColumns = (
  options: TUsersColumnsOptions,
): DataTableColumn<TItem>[] => {
  const { t, flags } = options;

  const name: DataTableColumn<TItem> = {
    id: "Name",
    title: t("Common:Label"),
    width: { type: "fill" },
    sortKey: NAME_SORT_KEY,
    cellClassName: "table-container_user-name-cell",
    cellTestId: rowTestId("name"),
    cell: () => <NameCell />,
  };

  const others = getUsersColumnIds(options).map(
    (id): DataTableColumn<TItem> => {
      const spec = COLUMNS[id];
      return {
        id,
        title: spec.title(options),
        width: { type: "flex" },
        visible: !!flags[id],
        hideable: true,
        sortKey: spec.sortKey,
        cellClassName: spec.className,
        cellTestId: rowTestId(spec.testIdPart),
        cell: spec.cell,
      };
    },
  );

  return [
    name,
    ...others,
    settingsColumn<TItem>({
      title: t("Common:TableSettingsTitle"),
      withContextMenu: true,
      // The old rows' menu button test id, which the client's specs look for.
      contextMenuButtonTestId: "context-menu-button",
    }),
  ];
};
