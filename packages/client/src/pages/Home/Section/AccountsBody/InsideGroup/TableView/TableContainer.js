// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";
import { useNavigate, useLocation } from "react-router-dom";

import useViewEffect from "SRC_DIR/Hooks/useViewEffect";

import { Base } from "@docspace/shared/themes";
import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";

import TableRow from "./TableRow";
import TableHeader from "./TableHeader";
import EmptyScreen from "../../EmptyScreen";
import { TableVersions } from "SRC_DIR/helpers/constants";

const COLUMNS_SIZE = `insideGroupColumnsSize_ver-${TableVersions.InsideGroup}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelInsideGroupPeopleColumnsSize_ver-${TableVersions.InsideGroup}`;

const userNameCss = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-right: -24px;
          padding-right: 24px;
        `
      : css`
          margin-left: -24px;
          padding-left: 24px;
        `}
`;

const contextCss = css`
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          margin-left: -20px;
          padding-left: 20px;
        `
      : css`
          margin-right: -20px;
          padding-right: 20px;
        `}
`;

const StyledTableContainer = styled(TableContainer)`
  :has(
      .table-container_body
        .table-list-item:first-child:first-child
        > .table-row-selected
    ) {
    .table-container_header {
      border-image-slice: 1;
      border-image-source: ${(props) =>
        props.theme.tableContainer.header.lengthenBorderImageSource};
    }
  }

  .table-row-selected {
    .table-container_user-name-cell {
      ${userNameCss}
    }

    .table-container_row-context-menu-wrapper {
      ${contextCss}
    }
  }

  .table-row-selected + .table-row-selected {
    .table-row {
      .table-container_user-name-cell,
      .table-container_row-context-menu-wrapper {
        border-image-slice: 1;
      }
      .table-container_user-name-cell {
        ${userNameCss}
        border-inline: 0; //for Safari macOS

        border-image-source: ${(props) => `linear-gradient(to right, 
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
      .table-container_row-context-menu-wrapper {
        ${contextCss}

        border-image-source: ${(props) => `linear-gradient(to left,
          ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
    }
  }

  .user-item:not(.table-row-selected) + .table-row-selected {
    .table-row {
      .table-container_user-name-cell {
        ${userNameCss}
      }

      .table-container_row-context-menu-wrapper {
        ${contextCss}
      }
    }
  }

  .table-container_user-name-cell {
    .additional-badges {
      margin-inline-end: 12px;
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const Table = ({
  peopleList,
  sectionWidth,
  accountsViewAs,
  setViewAs,
  theme,
  isAdmin,
  isOwner,
  changeType,
  userId,
  infoPanelVisible,

  withPaging,
  canChangeUserType,
  currentDeviceType,
  typeAccountsInsideGroupColumnIsEnabled,
  groupAccountsInsideGroupColumnIsEnabled,
  emailAccountsInsideGroupColumnIsEnabled,

  insideGroupIsLoading,
  fetchMoreInsideGroupUsers,
  insideGroupFilterTotal,
  insideGroupIsFiltered,
  hasMoreInsideGroupUsers,
}) => {
  const ref = useRef(null);
  const [hideColumns, setHideColumns] = React.useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useViewEffect({
    view: accountsViewAs,
    setView: setViewAs,
    currentDeviceType,
  });

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const isEmptyPage = !insideGroupIsLoading && peopleList.length === 0;

  return isEmptyPage ? (
    <EmptyScreen isEmptyGroup={!insideGroupIsFiltered} />
  ) : (
    <StyledTableContainer useReactWindow={!withPaging} forwardedRef={ref}>
      <TableHeader
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        sectionWidth={sectionWidth}
        containerRef={ref}
        setHideColumns={setHideColumns}
        navigate={navigate}
        location={location}
      />
      <TableBody
        infoPanelVisible={infoPanelVisible}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        columnStorageName={columnStorageName}
        fetchMoreFiles={fetchMoreInsideGroupUsers}
        hasMoreFiles={hasMoreInsideGroupUsers}
        itemCount={insideGroupFilterTotal}
        filesLength={peopleList.length}
        itemHeight={48}
        useReactWindow={!withPaging}
      >
        {peopleList.map((item, index) => (
          <TableRow
            theme={theme}
            key={item.id}
            item={item}
            isAdmin={isAdmin}
            isOwner={isOwner}
            changeUserType={changeType}
            userId={userId}
            canChangeUserType={canChangeUserType}
            hideColumns={hideColumns}
            itemIndex={index}
            typeAccountsInsideGroupColumnIsEnabled={
              typeAccountsInsideGroupColumnIsEnabled
            }
            groupAccountsInsideGroupColumnIsEnabled={
              groupAccountsInsideGroupColumnIsEnabled
            }
            emailAccountsInsideGroupColumnIsEnabled={
              emailAccountsInsideGroupColumnIsEnabled
            }
            infoPanelVisible={infoPanelVisible}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(
  ({
    peopleStore,
    settingsStore,
    accessRightsStore,
    infoPanelStore,
    userStore,
    tableStore,
  }) => {
    const {
      usersStore,
      filterStore,
      viewAs: accountsViewAs,
      setViewAs,
      changeType,
    } = peopleStore;
    const { theme, withPaging, currentDeviceType } = settingsStore;
    const { peopleList } = usersStore;

    const { isVisible: infoPanelVisible } = infoPanelStore;
    const { isAdmin, isOwner, id: userId } = userStore.user;

    const { canChangeUserType } = accessRightsStore;
    const {
      typeAccountsInsideGroupColumnIsEnabled,
      groupAccountsInsideGroupColumnIsEnabled,
      emailAccountsInsideGroupColumnIsEnabled,
    } = tableStore;

    const {
      insideGroupIsLoading,
      insideGroupFilterTotal,
      insideGroupIsFiltered,
      hasMoreInsideGroupUsers,
      fetchMoreInsideGroupUsers,
    } = peopleStore.groupsStore;

    return {
      peopleList,
      accountsViewAs,
      setViewAs,
      theme,
      isAdmin,
      isOwner,
      changeType,
      userId,
      infoPanelVisible,
      withPaging,

      canChangeUserType,
      currentDeviceType,
      typeAccountsInsideGroupColumnIsEnabled,
      groupAccountsInsideGroupColumnIsEnabled,
      emailAccountsInsideGroupColumnIsEnabled,

      insideGroupIsLoading,
      fetchMoreInsideGroupUsers,
      insideGroupFilterTotal,
      insideGroupIsFiltered,
      hasMoreInsideGroupUsers,
    };
  },
)(observer(Table));
