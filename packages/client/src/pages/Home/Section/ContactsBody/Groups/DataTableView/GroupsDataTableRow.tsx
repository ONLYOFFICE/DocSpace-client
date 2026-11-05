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

import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import type { TGroup } from "@docspace/shared/api/groups/types";
import {
  DataTableRow,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";

import type GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
import type ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";

import { GroupsRowContext, type TGroupsRowValue } from "./GroupsRowContext";
import styles from "./GroupsDataTableView.module.scss";

type TGroupsDataTableRowProps = {
  item: TGroup;
  index: number;
  checked: boolean;
  /** What `getRowProps` gave the row, which `renderRow` passes on. */
  rowProps: DataTableRowState;

  bufferSelection?: GroupsStore["bufferSelection"];
  getGroupContextOptions?: GroupsStore["getGroupContextOptions"];
  getModel?: GroupsStore["getModel"];
  openGroupAction?: GroupsStore["openGroupAction"];
  selectRow?: GroupsStore["selectRow"];
  changeGroupSelection?: GroupsStore["changeGroupSelection"];
  changeGroupContextSelection?: GroupsStore["changeGroupContextSelection"];
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
};

/**
 * A Contacts group row on the DataTable: the old row's wrapper, which the
 * hotkeys and the selection area find by id, class and value, around the
 * ui-kit row.
 */
const GroupsDataTableRow = ({
  item,
  index,
  checked,
  rowProps,
  bufferSelection,
  getGroupContextOptions,
  getModel,
  openGroupAction,
  selectRow,
  changeGroupSelection,
  changeGroupContextSelection,
  withContentSelection,
}: TGroupsDataTableRowProps) => {
  const { t } = useTranslation(["People", "Common", "PeopleTranslations"]);
  const isActive = bufferSelection?.id === item.id;

  const rowValue = useMemo<TGroupsRowValue>(
    () => ({
      t,
      checked,
      onSelect: () => changeGroupSelection!(item, checked),
      onOpen: (e) => openGroupAction!(item.id, true, item.name, e),
    }),
    [t, checked, item, changeGroupSelection, openGroupAction],
  );

  const contextMenu = useMemo(
    () => ({
      options: getGroupContextOptions!(
        t,
        item,
      ) as unknown as ContextMenuModel[],
      getModel: () => getModel!(t, item),
      onOpen: (isRightClick: boolean) =>
        changeGroupContextSelection!(item, !isRightClick),
      title: t("Common:Actions"),
    }),
    [t, item, getGroupContextOptions, getModel, changeGroupContextSelection],
  );

  // The old row's click: not on the title's link, the checkbox, or a click
  // the keyboard made.
  const onClick = (e: React.MouseEvent) => {
    if (withContentSelection) return;
    const target = e.target as Element;
    if (
      target.tagName === "SPAN" ||
      target.tagName === "A" ||
      target.closest(".checkbox") ||
      target.closest(".table-container_row-checkbox") ||
      e.detail === 0
    )
      return;

    selectRow!(item);
  };

  return (
    <div
      // The hotkeys find the row by its id; the selection area reads `value`.
      id={String(item.id)}
      className={classNames(styles.wrapper, "group-item", String(item.id), {
        "table-row-selected": checked || isActive,
      })}
      {...({ value: `folder_${item.id}_false_index_${index}` } as object)}
      data-testid={`contacts_table_groups_row_${index}`}
    >
      <GroupsRowContext value={rowValue}>
        <DataTableRow
          {...rowProps}
          row={item}
          index={index}
          testId={`contacts_groups_row_${index}`}
          checked={checked}
          active={isActive}
          className={classNames(styles.groupsRow, "table-row")}
          onClick={onClick}
          contextMenu={contextMenu}
        />
      </GroupsRowContext>
    </div>
  );
};

export default inject(({ peopleStore }: TStore) => {
  const groupsStore = peopleStore.groupsStore!;

  return {
    bufferSelection: groupsStore.bufferSelection,
    getGroupContextOptions: groupsStore.getGroupContextOptions,
    getModel: groupsStore.getModel,
    openGroupAction: groupsStore.openGroupAction,
    changeGroupSelection: groupsStore.changeGroupSelection,
    changeGroupContextSelection: groupsStore.changeGroupContextSelection,
    selectRow: groupsStore.selectRow,
    withContentSelection:
      peopleStore.contactsHotkeysStore!.withContentSelection,
  };
})(observer(GroupsDataTableRow));
