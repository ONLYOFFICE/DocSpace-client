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

import { useCallback, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { Base } from "@docspace/shared/themes";
import styled, { css } from "styled-components";
import withContent from "SRC_DIR/HOCs/withPeopleContent";

import { TableCell, TableRow } from "@docspace/shared/components/table";
import { Text } from "@docspace/shared/components/text";
import { Checkbox } from "@docspace/shared/components/checkbox";

import HistoryFinalizedReactSvgUrl from "PUBLIC_DIR/images/history-finalized.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";

import { SessionsTableRowProps } from "../../SecuritySessions.types";
import { decode } from "he";
import { Avatar, AvatarSize } from "@docspace/shared/components/avatar";

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

const SessionsTableRow = (props: SessionsTableRowProps) => {
  const {
    t,
    item,
    onContentRowSelect,
    onContentRowClick,
    onUserContextClick,
    hideColumns,
    isMe,
    locale,
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setUserSessionPanelVisible,
    setItems,
    setDisplayName,
    convertDate,
    getFromDateAgo,
    setFromDateAgo,
    setCurrentPortalSession,
    selectRow,
    selectCheckbox,
    singleContextMenuAction,
    multipleContextMenuAction,
    isChecked,
    isActive,
  } = props;

  // const { platform, browser, ip, city, country, date } = connections[0] ?? {};
  const { userId, displayName, avatar, session } = item;
  const { platform, browser, ip, city, country, date, status } = session;

  const fromDateAgo = getFromDateAgo(userId);
  const isOnline = status === "online";

  useEffect(() => {
    const updateStatus = () => {
      let statusToShow;
      if (isOnline && status) {
        statusToShow = status;
      } else if (!isOnline && date) {
        statusToShow = convertDate(t, date, locale);
      } else {
        statusToShow = null;
      }
      setFromDateAgo(userId, statusToShow);
    };

    updateStatus();
    const intervalId = setInterval(updateStatus, 60000);

    return () => clearInterval(intervalId);
  }, [t, date, status, locale, userId, isOnline, convertDate, setFromDateAgo]);

  const onClickSessions = () => {
    setCurrentPortalSession(item);
    setItems(item);
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
      disabled: isMe,
    },
    {
      key: "Disable",
      label: t("Common:DisableUserButton"),
      icon: RemoveSvgUrl,
      onClick: onClickDisable,
      disabled: isMe,
    },
  ];

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectCheckbox(e.target.checked, item);
  };

  const onRowContextClick = (rightMouseButtonClick?: boolean) => {
    if (rightMouseButtonClick) {
      multipleContextMenuAction(item);
    } else {
      singleContextMenuAction(item);
    }
  };

  const onRowClick = (e: React.MouseEvent) => {
    if (
      e.target instanceof Element &&
      (e.target?.tagName === "A" ||
        e.target?.closest(".checkbox") ||
        e.target?.closest(".table-container_row-checkbox") ||
        e.detail === 0)
    ) {
      return;
    }

    selectRow(item);
  };

  return (
    <Wrapper
      className={`user-item ${
        isChecked || isActive ? "table-row-selected" : ""
      }`}
    >
      <StyledTableRow
        key={userId}
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
            className="table-container_row-checkbox-wrapper"
            checked={isChecked}
            hasAccess
          >
            <div className="table-container_element">
              <Avatar
                size={AvatarSize.min}
                // role={role}
                userName={displayName}
                source={avatar}
              />
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              isChecked={isChecked}
              onChange={onChange}
            />
          </TableCell>
          <Text className="table-cell_username" fontWeight="600">
            {decode(displayName)}
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
                <span className="divider" />
              </>
            )}
            {ip}
          </Text>
        </TableCell>
      </StyledTableRow>
    </Wrapper>
  );
};

export default inject<TStore>(
  ({ setup, dialogsStore, settingsStore, userStore, activeSessionsStore }) => {
    const { setUserSessionPanelVisible } = dialogsStore;
    const { setLogoutAllDialogVisible, setDisableDialogVisible } = setup;
    const { culture } = settingsStore;
    const { user } = userStore;
    const locale = (user && user.cultureName) || culture || "en";

    const {
      isMe,
      setItems,
      setDisplayName,
      convertDate,
      getFromDateAgo,
      setFromDateAgo,
      setCurrentPortalSession,
      selectRow,
      selectCheckbox,
      singleContextMenuAction,
      multipleContextMenuAction,
    } = activeSessionsStore;

    return {
      isMe,
      locale,
      setLogoutAllDialogVisible,
      setDisableDialogVisible,
      setUserSessionPanelVisible,
      setItems,
      setDisplayName,
      convertDate,
      getFromDateAgo,
      setFromDateAgo,
      setCurrentPortalSession,
      selectRow,
      selectCheckbox,
      singleContextMenuAction,
      multipleContextMenuAction,
    };
  },
)(observer(SessionsTableRow));
