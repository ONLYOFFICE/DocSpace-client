import { useState, useEffect, useCallback } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import styled, { css } from "styled-components";
import moment from "moment-timezone";
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
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .divider {
    display: inline-block;
    height: 12px;
    width: 2px;
    background-color: ${(props) =>
      props.theme.profile.activeSessions.dividerColor};
    margin: -2px 5px;
  }

  .online {
    font-weight: 600;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

StyledTableRow.defaultProps = { theme: Base };

const SessionsTableRow = (props) => {
  const {
    t,
    item,
    element,
    onContentRowSelect,
    onContentRowClick,
    isActive,
    hideColumns,
    displayName,
    sessionStatus,
    connections,
    sessions,
    locale,
    checkedProps,
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setUserLastSession,
    setConnections,
    setUserSessionPanelVisible,
    setDisplayName,
    setStatus,
    isOneUserSelection,
  } = props;

  const [fromDateAgo, setFromDateAgo] = useState("");

  const { platform, browser, ip, city, country, status, date } = sessions;

  const isChecked = checkedProps?.checked;
  const isOnline = sessionStatus === "online";
  const isOffline = status === "offline";

  useEffect(() => {
    const updateStatus = () => {
      const showOnline = isOnline && sessionStatus;
      const showOffline = isOffline ? convertDate(date, locale) : null;
      setFromDateAgo(isOnline ? showOnline : showOffline);
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, [date, sessionStatus, status, locale]);

  const convertDate = (dateString, locale) => {
    const parsedDate = moment(new Date(dateString).toISOString());
    const now = moment();
    const daysDiff = now.diff(parsedDate, "days");
    moment.locale(locale);

    if (daysDiff < 1) return parsedDate.fromNow();
    if (daysDiff === 1) return t("Common:Yesterday");
    if (daysDiff < 7) return parsedDate.fromNow();
    return parsedDate.format(locale);
  };

  const onClickSessions = () => {
    setStatus(fromDateAgo);
    setUserLastSession(item);
    setConnections(connections);
    setUserSessionPanelVisible(true);
  };

  const onClickLogout = () => {
    setLogoutAllDialogVisible(true);
    setDisplayName(displayName);
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

  const onChange = (e) => {
    onContentRowSelect && onContentRowSelect(e.target.checked, item);
  };

  const onRowContextClick = useCallback(() => {
    if (isOneUserSelection) return; // only one row must be selected
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
          <Text className={isOnline ? "online" : "session-info"} truncate>
            {t(`Common:${fromDateAgo}`)}
          </Text>
        </TableCell>

        <TableCell>
          <Text className="session-info" truncate>
            {platform},&nbsp;
          </Text>
          <Text className="session-info" truncate>
            {browser?.split(".")[0] ?? ""}
          </Text>
        </TableCell>

        <TableCell>
          <Text className="session-info" truncate>
            {(country || city) && (
              <>
                {country}
                {country && city && ", "}
                {city}
                <span className="divider"></span>
              </>
            )}
            {ip}
          </Text>
        </TableCell>
      </StyledTableRow>
    </Wrapper>
  );
};

export default inject(
  ({ setup, dialogsStore, settingsStore, userStore, peopleStore }) => {
    const { setUserSessionPanelVisible } = dialogsStore;
    const { setLogoutAllDialogVisible, setDisableDialogVisible } = setup;
    const { culture } = settingsStore;
    const { user } = userStore;
    const locale = (user && user.cultureName) || culture || "en";

    const {
      setUserLastSession,
      setConnections,
      setDisplayName,
      setStatus,
      isOneUserSelection,
    } = peopleStore.selectionStore;

    return {
      locale,
      setLogoutAllDialogVisible,
      setDisableDialogVisible,
      setUserLastSession,
      setConnections,
      setUserSessionPanelVisible,
      setDisplayName,
      setStatus,
      isOneUserSelection,
    };
  },
)(withContent(observer(SessionsTableRow)));
