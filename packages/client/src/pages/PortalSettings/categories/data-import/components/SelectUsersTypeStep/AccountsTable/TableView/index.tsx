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

import { useRef } from "react";
import { inject, observer } from "mobx-react";
import { globalColors } from "@docspace/shared/themes";
import styled from "styled-components";

import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Link, LinkType } from "@docspace/shared/components/link";
import {
  TableGroupMenu,
  TableBody,
  TGroupMenuItem,
} from "@docspace/shared/components/table";

import ChangeTypeReactSvgUrl from "PUBLIC_DIR/images/change.type.react.svg?url";
import EmptyScreenUserReactSvgUrl from "PUBLIC_DIR/images/empty_screen_user.react.svg?url";
import ClearEmptyFilterSvgUrl from "PUBLIC_DIR/images/clear.empty.filter.svg?url";
import { injectDefaultTheme } from "@docspace/shared/utils";
import { StyledTableContainer } from "../../../../StyledDataImport";
import UsersTableRow from "./UsersTableRow";
import UsersTableHeader from "./UsersTableHeader";
import {
  TypeSelectTableViewProps,
  InjectedTypeSelectTableViewProps,
} from "../../../../types";

const UserSelectTableContainer = styled(StyledTableContainer).attrs(
  injectDefaultTheme,
)`
  .table-group-menu {
    height: 69px;
    position: sticky;
    z-index: 201;
    width: calc(100% + 40px);
    margin-top: -33px;
    margin-inline-start: -20px;
    top: 0;

    margin-bottom: -36px;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.client.settings.migration.workspaceBorder};
      box-shadow: ${globalColors.menuShadow} 0px 15px 20px;
      padding: 0px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }

    .table-container_header {
      position: absolute;
      padding-block: 0;
      padding-inline: 28px 15px;
    }
  }

  .buttons-box {
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
`;

const TABLE_VERSION = "6";
const COLUMNS_SIZE = `nextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelNextcloudFourthColumnsSize_ver-${TABLE_VERSION}`;

const checkedAccountType = "result";

const TableView = (props: TypeSelectTableViewProps) => {
  const {
    t,
    sectionWidth,
    accountsData,
    typeOptions,
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    filteredUsers,
  } = props as InjectedTypeSelectTableViewProps;
  const tableRef = useRef<HTMLDivElement>(null);
  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

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

  return (
    <UserSelectTableContainer
      forwardedRef={tableRef as React.RefObject<HTMLDivElement>}
      useReactWindow
    >
      {checkedUsers.result.length > 0 ? (
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
        <>
          <UsersTableHeader
            t={t}
            sectionWidth={sectionWidth}
            userId={userId}
            tableRef={tableRef}
            columnStorageName={columnStorageName}
            columnInfoPanelStorageName={columnInfoPanelStorageName}
            isIndeterminate={isIndeterminate}
            isChecked={checkedUsers.result.length === filteredUsers.length}
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
                key={data.key}
                id={data.key}
                type={data.userType}
                displayName={data.displayName}
                email={data.email}
                typeOptions={typeOptions}
                isChecked={isAccountChecked(data.key, checkedAccountType)}
                toggleAccount={() => toggleAccount(data, checkedAccountType)}
              />
            ))}
          </TableBody>
        </>
      ) : (
        <EmptyScreenContainer
          imageSrc={EmptyScreenUserReactSvgUrl}
          imageAlt="Empty Screen user image"
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
    </UserSelectTableContainer>
  );
};

export default inject<TStore>(({ userStore, importAccountsStore }) => {
  const userId = userStore.user?.id;
  const {
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    filteredUsers,
  } = importAccountsStore;

  return {
    userId,
    checkedUsers,
    toggleAccount,
    toggleAllAccounts,
    isAccountChecked,
    setSearchValue,
    filteredUsers,
  };
})(observer(TableView));
