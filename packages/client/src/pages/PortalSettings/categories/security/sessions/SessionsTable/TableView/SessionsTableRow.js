import { inject, observer } from "mobx-react";
import { useCallback } from "react";
import { Base } from "@docspace/shared/themes";
import styled, { css } from "styled-components";
import withContent from "SRC_DIR/HOCs/withPeopleContent";

import { TableRow } from "@docspace/shared/components/table";
import { TableCell } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

const Wrapper = styled.div`
  display: contents;
`;

const StyledTableRow = styled(TableRow)`
  :hover {
    .table-container_cell {
      cursor: pointer;
      background: ${(props) =>
        `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
      border-top: ${(props) =>
        `1px solid ${props.theme.filesSection.tableView.row.borderColor}`};
      margin-top: -1px;
    }

    .table-container_user-name-cell {
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
    }
    .table-container_row-context-menu-wrapper {
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
    }
  }

  .table-container_cell {
    height: 48px;
    max-height: 48px;

    background: ${(props) =>
      (props.checked || props.isActive) &&
      `${props.theme.filesSection.tableView.row.backgroundActive} !important`};
  }

  .table-container_row-checkbox-wrapper {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
    min-width: 48px;

    .table-container_row-checkbox {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-right: -4px;
              padding: 16px 12px 16px 8px;
            `
          : css`
              margin-left: -4px;
              padding: 16px 8px 16px 12px;
            `}
    }
  }

  .table-cell_username {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 12px;
          `
        : css`
            margin-right: 12px;
          `}
  }

  .table-container_row-context-menu-wrapper {
    justify-content: flex-end;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 0px;
          `
        : css`
            padding-right: 0px;
          `}
  }

  .session-info {
    font-weight: 600;
    color: #a3a9ae;
  }

  .session-online {
    font-weight: 600;
    color: #35ad17;
  }
`;

StyledTableRow.defaultProps = { theme: Base };

const SessionsTableRow = (props) => {
  const {
    t,
    item,
    element,
    checkedProps,
    onContentRowSelect,
    onContentRowClick,
    isActive,
    hideColumns,
    displayName,
    status,
    browser,
    platform,
    country,
    city,
    ip,
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
  } = props;

  const onClickSessions = () => {
    console.log("view sessions");
  };

  const onClickLogout = () => {
    setLogoutAllDialogVisible(true);
    setSessionModalData({ displayName });
  };

  const onClickDisable = () => {
    setDisableDialogVisible(true);
  };

  const contextOptions = [
    {
      key: "ViewSessions",
      label: t("Settings:ViewSessions"),
      icon: HistoryFinalizedReactSvgUrl,
      onClick: onClickSessions,
    },
    {
      key: "LogoutAllSessions",
      label: t("Settings:LogoutAllSessions"),
      icon: LogoutReactSvgUrl,
      onClick: onClickLogout,
    },
    {
      key: "Separator",
      isSeparator: true,
    },
    {
      key: "Disable",
      label: t("Common:DisableUserButton"),
      icon: RemoveSvgUrl,
      onClick: onClickDisable,
    },
  ];

  const isChecked = checkedProps.checked;
  const isOnline = status === "Online";

  const onChange = (e) => {
    onContentRowSelect && onContentRowSelect(e.target.checked, item);
  };

  const onRowContextClick = useCallback(() => {
    onContentRowClick && onContentRowClick(!isChecked, item, false);
  }, [isChecked, item, onContentRowClick]);

  const onRowClick = (e) => {
    if (
      e.target.closest(".checkbox") ||
      e.target.closest(".table-container_row-checkbox") ||
      e.target.closest(".paid-badge") ||
      e.target.closest(".pending-badge") ||
      e.target.closest(".disabled-badge") ||
      e.detail === 0
    ) {
      return;
    }

    onContentRowClick && onContentRowClick(!isChecked, item);
  };

  return (
    <Wrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      }`}
    >
      <StyledTableRow
        key={item.id}
        className="table-row"
        checked={isChecked}
        isActive={isActive}
        onClick={onRowClick}
        fileContextClick={onRowContextClick}
        hideColumns={hideColumns}
        contextOptions={contextOptions}
      >
        <TableCell className="table-container_user-name-cell">
          <TableCell
            hasAccess={true}
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
          >
            <div className="table-container_element">{element}</div>
            <Checkbox
              className="table-container_row-checkbox"
              isChecked={isChecked}
              onChange={onChange}
            />
          </TableCell>
          <Text className="table-cell_username" fontWeight="600">
            {displayName}
          </Text>
        </TableCell>

        <TableCell>
          <Text
            className={isOnline ? "session-online" : "session-info"}
            truncate
          >
            {status}
          </Text>
        </TableCell>

        <TableCell>
          <Text className="session-info" truncate>
            {platform},&nbsp;
          </Text>
          <Text className="session-info" truncate>
            {browser}
          </Text>
        </TableCell>

        <TableCell>
          <Text className="session-info" truncate>
            {country},&nbsp;
          </Text>
          <Text className="session-info" truncate>
            {city}
          </Text>
        </TableCell>

        <TableCell>
          <Text className="session-info" truncate>
            {ip}
          </Text>
        </TableCell>
      </StyledTableRow>
    </Wrapper>
  );
};

export default inject(({ setup }) => {
  const {
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
  } = setup;

  return {
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setSessionModalData,
  };
})(withContent(observer(SessionsTableRow)));
