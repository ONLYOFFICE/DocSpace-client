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

import EmptyScreenPersonSvgUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.light.svg?url";
import EmptyScreenPersonSvgDarkUrl from "PUBLIC_DIR/images/emptyFilter/empty.filter.people.dark.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";

import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTheme } from "styled-components";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link, LinkType } from "@docspace/shared/components/link";
import { TableBody } from "@docspace/shared/components/table";

import UsersTableHeader from "./UsersTableHeader";
import UsersTableRow from "./UsersTableRow";
import { StyledTableContainer } from "../../../../StyledDataImport";

import { TableViewProps, AddEmailTableProps } from "../../../../types";

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudThirdColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "withoutEmail";

const TableView = (props: TableViewProps) => {
  const {
    t,
    sectionWidth,
    accountsData,
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    users,
    setSearchValue,
  } = props as AddEmailTableProps;
  const theme = useTheme();
  const [openedEmailKey, setOpenedEmailKey] = useState<string>("");
  const tableRef = useRef<HTMLDivElement | null>(null);

  const usersWithFilledEmails = users.withoutEmail.filter(
    (user) => user.email && user.email.length > 0,
  );

  const toggleAll = (e?: React.ChangeEvent<HTMLInputElement>) =>
    toggleAllAccounts(
      e?.target.checked ?? false,
      usersWithFilledEmails,
      checkedAccountType,
    );

  const onClearFilter = () => {
    setSearchValue("");
  };

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isIndeterminate =
    checkedUsers.withoutEmail.length > 0 &&
    checkedUsers.withoutEmail.length !== usersWithFilledEmails.length;

  return (
    <StyledTableContainer
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      {accountsData.length > 0 ? (
        <>
          <UsersTableHeader
            t={t}
            sectionWidth={sectionWidth}
            tableRef={tableRef}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            isIndeterminate={isIndeterminate}
            isChecked={
              usersWithFilledEmails.length > 0
                ? checkedUsers.withoutEmail.length ===
                  usersWithFilledEmails.length
                : false
            }
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
                id={data.key}
                email={data.email || ""}
                displayName={data.displayName}
                isChecked={isAccountChecked(data.key, checkedAccountType)}
                toggleAccount={() => toggleAccount(data, checkedAccountType)}
                isEmailOpen={openedEmailKey === data.key}
                setOpenedEmailKey={setOpenedEmailKey}
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
    </StyledTableContainer>
  );
};

export default inject<TStore>(({ userStore, importAccountsStore }) => {
  const userId = userStore.user?.id;
  const {
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  } = importAccountsStore;

  return {
    userId,
    users,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
  };
})(observer(TableView));
