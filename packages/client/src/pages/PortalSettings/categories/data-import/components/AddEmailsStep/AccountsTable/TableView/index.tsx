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

import { useCallback, useMemo, useRef, useState } from "react";
import { inject, observer } from "mobx-react";

import type { TEnhancedMigrationUser } from "@docspace/shared/api/settings/types";
import { useTheme } from "@onlyoffice/apps-ui-kit/context/ThemeContext";
import { EmptyScreenContainer } from "@onlyoffice/apps-ui-kit/components/empty-screen-container";
import { IconButton } from "@onlyoffice/apps-ui-kit/components/icon-button";
import { Link, LinkType } from "@onlyoffice/apps-ui-kit/components/link";
import {
  DataTable,
  createLocalStorageWidths,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";

import sectionTableStyles from "SRC_DIR/components/DataTable/DataTable.module.scss";
import { useStickyHeaderTop } from "SRC_DIR/components/DataTable/useStickyHeaderTop";

import type { TSelectAll } from "../../../../sub-components/SelectAllHeader";
import styles from "../../../../StyledDataImport.module.scss";
import { TableViewProps, AddEmailTableProps } from "../../../../types";

import { getAddEmailsColumns } from "./addEmailsColumns";
import { EMAIL_CELL_CONTENT } from "./EmailCell";

const COLUMN_WIDTHS = "nextcloudThirdColumnsWidths_ver-1";

const checkedAccountType = "withoutEmail";

const getRowKey = (user: TEnhancedMigrationUser) => user.key;

/** The accounts without an email, to give one and select, on the DataTable. */
const TableView = (props: TableViewProps) => {
  const {
    t,
    accountsData,
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    users,
    setSearchValue,
    changeEmail,
  } = props as AddEmailTableProps;
  const theme = useTheme();
  const [openedEmailKey, setOpenedEmailKey] = useState<string>("");
  // The emails saved here: the step's page of accounts is a copy the store's
  // update does not reach.
  const [savedEmails, setSavedEmails] = useState<Record<string, string>>({});

  const getEmail = useCallback(
    (user: TEnhancedMigrationUser) => savedEmails[user.key] ?? user.email ?? "",
    [savedEmails],
  );

  const checkedKeys = useMemo(
    () => new Set(checkedUsers.withoutEmail.map((user) => user.key)),
    [checkedUsers.withoutEmail],
  );

  const selectAll: TSelectAll = useMemo(() => {
    const usersWithFilledEmails = users.withoutEmail.filter(
      (user) => user.email && user.email.length > 0,
    );
    const checkedCount = checkedUsers.withoutEmail.length;

    return {
      checked:
        usersWithFilledEmails.length > 0 &&
        checkedCount === usersWithFilledEmails.length,
      indeterminate:
        checkedCount > 0 && checkedCount !== usersWithFilledEmails.length,
      onChange: (checked) =>
        toggleAllAccounts(checked, usersWithFilledEmails, checkedAccountType),
    };
  }, [users.withoutEmail, checkedUsers.withoutEmail, toggleAllAccounts]);

  // The old row's toggle, for its click and its checkbox alike: not without
  // an email, nor from the email or its editor.
  const onToggle = useCallback(
    (user: TEnhancedMigrationUser, e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!getEmail(user)) return;
      if ((e.target as Element).closest(EMAIL_CELL_CONTENT)) return;
      toggleAccount(user, checkedAccountType);
    },
    [getEmail, toggleAccount],
  );

  const onSaveEmail = useCallback(
    (user: TEnhancedMigrationUser, email: string) => {
      setSavedEmails((prev) => ({ ...prev, [user.key]: email }));
      changeEmail(user.key, email);
      setOpenedEmailKey("");
      if (!checkedKeys.has(user.key)) toggleAccount(user, checkedAccountType);
    },
    [changeEmail, checkedKeys, toggleAccount],
  );

  const columns = useMemo(
    () =>
      getAddEmailsColumns(t, {
        selectAll,
        isChecked: (user) => checkedKeys.has(user.key),
        getEmail,
        onToggle,
        openedEmailKey,
        setOpenedEmailKey,
        onSaveEmail,
      }),
    [
      t,
      selectAll,
      checkedKeys,
      getEmail,
      onToggle,
      openedEmailKey,
      onSaveEmail,
    ],
  );

  const widthStorage = useMemo(
    () => createLocalStorageWidths(`${COLUMN_WIDTHS}=${userId}`),
    [userId],
  );

  const getRowProps = useCallback(
    (user: TEnhancedMigrationUser): DataTableRowState => ({
      checked: checkedKeys.has(user.key),
      className: styles.styledTableRowEmail,
      onClick: (e) => onToggle(user, e),
    }),
    [checkedKeys, onToggle],
  );

  const onClearFilter = () => {
    setSearchValue("");
  };

  const tableRef = useRef<HTMLDivElement>(null);
  useStickyHeaderTop(tableRef, { belowPinned: true });

  return (
    <div className={styles.styledTableContainer}>
      {accountsData.length > 0 ? (
        <DataTable<TEnhancedMigrationUser>
          ref={tableRef}
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
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    setSearchValue,
    changeEmail,
  } = importAccountsStore;

  return {
    userId,
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    setSearchValue,
    changeEmail,
  };
})(observer(TableView));
