import { useState, useRef } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import styled, { css } from "styled-components";

import SessionsTableHeader from "./SessionsTableHeader";
import SessionsTableRow from "./SessionsTableRow";

import { TableContainer } from "@docspace/shared/components/table";
import { TableBody } from "@docspace/shared/components/table";

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

const TableView = ({ t, sectionWidth, userId, sessionsData }) => {
  const [hideColumns, setHideColumns] = useState(false);
  const ref = useRef(null);

  const columnStorageName = `${COLUMNS_SIZE}=${userId}`;
  const columnInfoPanelStorageName = `${INFO_PANEL_COLUMNS_SIZE}=${userId}`;

  return (
    <StyledTableContainer forwardedRef={ref} useReactWindow>
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
