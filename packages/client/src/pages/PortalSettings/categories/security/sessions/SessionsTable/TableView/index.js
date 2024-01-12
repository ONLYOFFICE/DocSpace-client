import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/components/themes";
import styled, { css } from "styled-components";

import SessionsTableHeader from "./SessionsTableHeader";
import SessionsTableRow from "./SessionsTableRow";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";

import TableContainer from "@docspace/components/table-container/TableContainer";
import TableGroupMenu from "@docspace/components/table-container/TableGroupMenu";
import TableBody from "@docspace/components/table-container/TableBody";

const TABLE_VERSION = "5";
const COLUMNS_SIZE = `sessionsColumnsSize_ver-${TABLE_VERSION}`;
const INFO_PANEL_COLUMNS_SIZE = `infoPanelSessionsColumnsSize_ver-${TABLE_VERSION}`;

const marginCss = css`
  margin-top: -1px;
  border-top: ${(props) =>
    `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
`;

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

  ${marginCss}
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

  ${marginCss}
`;

const StyledTableContainer = styled(TableContainer)`
  margin: 0 0 24px;

  .table-group-menu {
    height: 69px;
    position: absolute;
    z-index: 201;
    top: -25px;
    left: 0px;
    width: 100%;

    .table-container_group-menu {
      border-image-slice: 0;
      border-image-source: none;
      border-bottom: ${(props) =>
        props.theme.filesSection.tableView.row.borderColor};
      box-shadow: rgba(4, 15, 27, 0.07) 0px 15px 20px;
      padding: 0px;
    }

    .table-container_group-menu-separator {
      margin: 0 16px;
    }
  }

  .table-container_header {
    position: absolute;
    padding: 0px 20px;
  }

  .header-container-text {
    color: #a3a9ae;
    font-size: ${(props) => props.theme.getCorrectFontSize("12px")};
  }

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
        margin-top: -1px;
        border-image-slice: 1;
        border-top: 1px solid;
      }
      .table-container_user-name-cell {
        ${userNameCss}
        border-left: 0; //for Safari macOS
        border-right: 0; //for Safari macOS

        border-image-source: ${(props) =>
          `linear-gradient(to right, ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
      }
      .table-container_row-context-menu-wrapper {
        ${contextCss}

        border-image-source: ${(props) =>
          `linear-gradient(to left, ${props.theme.filesSection.tableView.row.borderColorTransition} 17px, ${props.theme.filesSection.tableView.row.borderColor} 31px)`};
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

      .table-container_user-name-cell,
      .table-container_row-context-menu-wrapper {
        border-bottom: ${(props) =>
          `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      }
    }
  }
`;

StyledTableContainer.defaultProps = { theme: Base };

const TableView = ({
  t,
  sectionWidth,
  userId,
  sessionsData,
  // allSessions,
  // checkedSessions,
  // toggleSession,
  // toggleAllSessions,
  // isSessionChecked,
}) => {
  const [hideColumns, setHideColumns] = useState(false);
  const ref = useRef(null);

  // const handleAllToggles = (checked) => {
  //   toggleAllSessions(checked, allSessions);
  // };

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  const headerMenu = [
    {
      id: "sessions",
      key: "Sessions",
      label: t("Common:Sessions"),
      onClick: () => console.log("Sessions"),
      iconUrl: HistoryFinalizedReactSvgUrl,
    },
    {
      id: "logout",
      key: "Logout",
      label: t("Common:Logout"),
      onClick: () => console.log("Logout"),
      iconUrl: RemoveSvgUrl,
    },
    {
      id: "Disable",
      key: "Disable",
      label: t("Common:DisableUserButton"),
      onClick: () => console.log("Disable"),
      iconUrl: TrashReactSvgUrl,
    },
  ];

  // const isChecked = checkedSessions.length === allSessions.length;

  // const isIndeterminate =
  //   checkedSessions.length > 0 && checkedSessions.length !== allSessions.length;

  return (
    <StyledTableContainer forwardedRef={ref} useReactWindow>
      {/* {checkedSessions.length > 0 && (
        <div className="table-group-menu">
          <TableGroupMenu
            sectionWidth={sectionWidth}
            headerMenu={headerMenu}
            withoutInfoPanelToggler
            withComboBox={false}
            checkboxOptions={[]}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            onChange={handleAllToggles}
          />
        </div>
      )} */}
      <SessionsTableHeader
        t={t}
        userId={userId}
        sectionWidth={sectionWidth}
        setHideColumns={setHideColumns}
        containerRef={ref}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
      />
      <TableBody
        itemHeight={49}
        useReactWindow
        infoPanelVisible={false}
        columnStorageName={columnStorageName}
        columnInfoPanelStorageName={columnInfoPanelStorageName}
        filesLength={sessionsData.length}
        hasMoreFiles={false}
        itemCount={sessionsData.length}
        fetchMoreFiles={() => {}}
      >
        {sessionsData.map((item) => (
          <SessionsTableRow
            t={t}
            key={item.userId}
            item={item}
            userId={userId}
            hideColumns={hideColumns}
            displayName={item.displayName}
            status={item.status}
            browser={item.browser}
            platform={item.platform}
            country={item.country}
            city={item.city}
            ip={item.ip}
          />
        ))}
      </TableBody>
    </StyledTableContainer>
  );
};

export default inject(({ auth, setup }) => {
  const { id: userId } = auth.userStore.user;
  const {
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  } = setup;

  return {
    userId,
    allSessions,
    checkedSessions,
    toggleSession,
    toggleAllSessions,
    isSessionChecked,
  };
})(observer(TableView));
