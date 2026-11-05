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

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";

import { useCallback, useMemo } from "react";
import { inject, observer } from "mobx-react";
import classNames from "classnames";

import type { TEnhancedMigrationUser } from "@docspace/shared/api/settings/types";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import {
  TableGroupMenu,
  TGroupMenuItem,
} from "@onlyoffice/apps-ui-kit/components/table-group-menu";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";

import styles from "../../../../StyledDataImport.module.scss";
import {
  TypeSelectTableViewProps,
  InjectedTypeSelectTableViewProps,
} from "../../../../types";

import { NOT_TOGGLING, getUsersTypeColumns } from "./usersTypeColumns";

const COLUMN_WIDTHS = "nextcloudFourthColumnsWidths_ver-1";

const checkedAccountType = "result";

const getRowKey = (user: TEnhancedMigrationUser) => user.key;

/** The accounts to import with their types, on the DataTable. */
const TableView = (props: TypeSelectTableViewProps) => {
  const {
    t,
    accountsData,
    typeOptions,
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    setSearchValue,
    filteredUsers,
    changeUserType,
  } = props as InjectedTypeSelectTableViewProps;
  const theme = useTheme();

  const checkedKeys = useMemo(
    () => new Set(checkedUsers.result.map((user) => user.key)),
    [checkedUsers.result],
  );

  const isIndeterminate =
    checkedUsers.result.length > 0 &&
    checkedUsers.result.length !== filteredUsers.length;

  const toggleAll = (isChecked: boolean) =>
    toggleAllAccounts(isChecked, filteredUsers, checkedAccountType);

  const onClearFilter = () => {
    setSearchValue("");
  };

  const headerMenu: TGroupMenuItem[] = [
    {
      id: "change-type",
      label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
      disabled: false,
      withDropDown: true,
      options: typeOptions as ContextMenuModel[],
      iconUrl: ChangeTypeReactSvgUrl,
      onClick: () => {},
      title: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
    },
  ];

  const columns = useMemo(
    () =>
      getUsersTypeColumns(t, {
        typeOptions,
        isChecked: (user) => checkedKeys.has(user.key),
        onToggle: (user) => toggleAccount(user, checkedAccountType),
        onTypeChange: (user, type) => changeUserType(user.key, type),
      }),
    [t, typeOptions, checkedKeys, toggleAccount, changeUserType],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const getRowProps = useCallback(
    (user: TEnhancedMigrationUser): DataTableRowState => ({
      checked: checkedKeys.has(user.key),
      className: styles.styledTableRowType,
      onClick: (e) => {
        if ((e.target as Element).closest(NOT_TOGGLING)) return;
        toggleAccount(user, checkedAccountType);
      },
    }),
    [checkedKeys, toggleAccount],
  );

  return (
    <div
      className={classNames(
        styles.styledTableContainer,
        styles.userSelectTableContainer,
      )}
    >
      {checkedUsers.result.length > 0 ? (
        // Over the table's header while accounts are selected.
        <div className="table-group-menu">
          <TableGroupMenu
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.result.length === filteredUsers.length}
            onChange={toggleAll}
          />
        </div>
      ) : null}
      {accountsData.length > 0 ? (
        <DataTable<TEnhancedMigrationUser>
          ariaLabel={t("Common:People")}
          columns={columns}
          rows={accountsData}
          getRowKey={getRowKey}
          getRowProps={getRowProps}
          widthStorage={widthStorage}
          className={sectionTableStyles.settingsTable}
        />
      ) : (
        <EmptyScreenContainer
          imageSrc={
            theme.isBase ? EmptyScreenPersonSvgUrl : EmptyScreenPersonSvgDarkUrl
          }
          imageAlt={t("Common:NotFoundUsers")}
          headerText={t("Common:NotFoundUsers")}
          descriptionText={t("Common:NotFoundUsersDescription")}
          buttons={
            <div className="buttons-box">
              <IconButton
                className="clear-icon"
                isFill
                size={12}
                onClick={onClearFilter}
                iconName={ClearEmptyFilterSvgUrl}
              />
              <Link
                type={LinkType.action}
                isHovered
                fontWeight="600"
                onClick={onClearFilter}
              >
                {t("Common:ClearFilter")}
              </Link>
            </div>
          }
        />
      )}
    </div>
  );
};

export default inject<TStore>(({ userStore, importAccountsStore }) => {
  const userId = userStore.user?.id;
  const {
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    setSearchValue,
    filteredUsers,
    changeUserType,
  } = importAccountsStore;

  return {
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    setSearchValue,
    filteredUsers,
    changeUserType,
  };
})(observer(TableView));
