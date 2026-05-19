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

import { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";

import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { TableContainer, TableBody } from "@docspace/ui-kit/components/table";
import { TEnhancedMigrationUser } from "@docspace/shared/api/settings/types";

import UsersTableRow from "./UsersTableRow";
import UsersTableHeader from "./UsersTableHeader";
import styles from "../../../../StyledDataImport.module.scss";
import { SelectUserTableProps, TableViewProps } from "../../../../types";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudSecondColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "withEmail";

const TableView = (props: TableViewProps) => {
  const {
    t,
    withEmailUsers,
    userId,
    sectionWidth,
    accountsData,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = props as SelectUserTableProps;
  const theme = useTheme();
  const tableRef = useRef<HTMLDivElement>(null);

  const toggleAll = (e?: React.ChangeEvent<HTMLInputElement>) =>
    toggleAllAccounts(
      e?.target?.checked ?? false,
      withEmailUsers,
      checkedAccountType,
    );

  const handleToggle = (
    e: React.MouseEvent<Element> | React.ChangeEvent<HTMLInputElement>,
    user: TEnhancedMigrationUser,
  ) => {
    e.stopPropagation();
    toggleAccount(user, checkedAccountType);
  };

  const onClearFilter = () => {
    setSearchValue("");
  };

  const isIndeterminate =
    checkedUsers.withEmail.length > 0 &&
    checkedUsers.withEmail.length !== withEmailUsers.length;

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <TableContainer
      className={styles.styledTableContainer}
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      {accountsData.length > 0 ? (
        <>
          <UsersTableHeader
            t={t}
            sectionWidth={sectionWidth!}
            tableRef={tableRef}
            userId={userId}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.withEmail.length === withEmailUsers.length}
            toggleAll={toggleAll}
          />
          <TableBody
            itemHeight={49}
            useReactWindow
            infoPanelVisible={false}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            filesLength={accountsData.length}
            hasMoreFiles={false}
            itemCount={accountsData.length}
            fetchMoreFiles={async () => {}}
          >
            {accountsData.map((data) => (
              <UsersTableRow
                t={t}
                key={data.key}
                displayName={data.displayName}
                email={data.email}
                isDuplicate={data.isDuplicate}
                isChecked={isAccountChecked(data.key, checkedAccountType)}
                toggleAccount={(
                  e:
                    | React.MouseEvent<Element>
                    | React.ChangeEvent<HTMLInputElement>,
                ) => handleToggle(e, data)}
              />
            ))}
          </TableBody>
        </>
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
    </TableContainer>
  );
};

export default inject<TStore>(({ userStore, importAccountsStore }) => {
  const userId = userStore.user?.id;

  const {
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    userId,
    checkedUsers,
    withEmailUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(TableView));
