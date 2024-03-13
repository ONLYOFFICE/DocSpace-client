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
  openGroupAction,
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

  return !!peopleList?.length ? (
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
        fetchMoreFiles={() => {}}
        hasMoreFiles={false}
        itemCount={peopleList.length}
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
            openGroupAction={openGroupAction}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  ) : (
    <EmptyScreen />
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

    const { openGroupAction } = peopleStore.groupsStore;

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

      openGroupAction,
    };
  },
)(observer(Table));
