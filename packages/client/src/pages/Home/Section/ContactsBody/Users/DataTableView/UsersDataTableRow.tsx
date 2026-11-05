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

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import {
  DataTableRow,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import type { TOption } from "@onlyoffice/apps-ui-kit/components/combobox";
import type { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";
import type { EmployeeType } from "@docspace/shared/enums";

import withContent from "SRC_DIR/HOCs/withPeopleContent";

import type { TableRowProps, TableRowStores } from "./UsersDataTableView.types";

import { UsersRowContext, type TUsersRowValue } from "./UsersRowContext";
import styles from "./UsersDataTableView.module.scss";

type TUsersDataTableRowProps = TableRowProps & {
  index: number;
  /** What `getRowProps` gave the row, which `renderRow` passes on. */
  rowProps: DataTableRowState;
};

/**
 * A Contacts user row on the DataTable: the old row's wrapper, which the
 * hotkeys and the selection area find by id and class, around the ui-kit row,
 * whose cells read what `withPeopleContent` computed from the row's context.
 */
const UsersDataTableRow = ({
  item,
  index,
  itemIndex,
  rowProps,
  getContextModel,
  element,
  checkedProps,
  onContentRowSelect,
  onContentRowClick,
  onEmailClick,
  onUserContextClick,
  getUsersChangeTypeOptions,
  changeUserType,
  isActive,
  canChangeUserType,
  value,
  standalone,
  onOpenGroup,
  contactsTab,
  inProgress,
  withContentSelection,
  isMe,
}: TUsersDataTableRowProps) => {
  const { t } = useTranslation(["People", "Common", "Settings"]);

  const checked = !!checkedProps?.checked;
  const isGuests = contactsTab === "guests";
  const isInsideGroup = contactsTab === "inside_group";

  const onTypeChange = useCallback(
    (option: TOption) => {
      if (!option.action || option.key === item.role) return;
      changeUserType(option.action as EmployeeType, [item]);
    },
    [item, changeUserType],
  );

  const onOpenGroupClick = useCallback(
    ({ action, title }: TOption) =>
      onOpenGroup!(action as string, !isInsideGroup, title),
    [onOpenGroup, isInsideGroup],
  );

  const canChange = canChangeUserType(item);

  const rowValue = useMemo<TUsersRowValue>(
    () => ({
      item,
      index,
      t,
      element,
      checked,
      inProgress: !!inProgress,
      onContentRowSelect,
      onEmailClick,
      onOpenGroup: onOpenGroupClick,
      typeOptions: canChange ? getUsersChangeTypeOptions!(t, item) : null,
      onTypeChange,
      isMe: !!isMe?.(item.id),
      isPaidUser: !standalone && !item.isVisitor && !item.isCollaborator,
    }),
    [
      item,
      index,
      t,
      element,
      checked,
      inProgress,
      onContentRowSelect,
      onEmailClick,
      onOpenGroupClick,
      canChange,
      getUsersChangeTypeOptions,
      onTypeChange,
      isMe,
      standalone,
    ],
  );

  const contextMenu = useMemo(
    () => ({
      options: item.options as unknown as ContextMenuModel[],
      getModel: getContextModel,
      onOpen: (isRightClick: boolean) =>
        onUserContextClick(item, !isRightClick),
      title: t("Common:Actions"),
    }),
    [item, getContextModel, onUserContextClick, t],
  );

  const onClick = (e: React.MouseEvent) => {
    if (withContentSelection) return;
    onContentRowClick?.(e, item);
  };

  return (
    <div
      // The hotkeys find the row by its id and the class of the same name;
      // the selection area reads `value`.
      id={String(item.id)}
      className={classNames(styles.wrapper, "user-item", String(item.id), {
        "table-row-selected": checked || isActive,
      })}
      {...({ value } as object)}
    >
      <UsersRowContext value={rowValue}>
        <DataTableRow
          {...rowProps}
          row={item}
          index={index}
          testId={
            isGuests
              ? `contacts_guests_row_${itemIndex}`
              : `contacts_users_row_${itemIndex}`
          }
          checked={checked}
          active={!!isActive}
          className={classNames(styles.usersRow, "table-row")}
          onClick={onClick}
          contextMenu={contextMenu}
        />
      </UsersRowContext>
    </div>
  );
};

export default inject(({ peopleStore, userStore }: TableRowStores) => ({
  getUsersChangeTypeOptions:
    peopleStore.contextOptionsStore!.getUsersChangeTypeOptions,
  withContentSelection: peopleStore.contactsHotkeysStore!.withContentSelection,
  isMe: userStore.isMe,
}))(withContent(observer(UsersDataTableRow)));
