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

import { inject, observer } from "mobx-react";
import styled, { css } from "styled-components";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/shared/components/context-menu-button";

import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";
import { IAllSessions } from "SRC_DIR/pages/PortalSettings/categories/security/sessions/SecuritySessions.types";

import { LastSessionBlockProps } from "./UserSessionsPanel.types";
import { decode } from "he";

const StyledUserInfoBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px 20px;

  .username {
    font-size: 16px;
    font-weight: 700;
  }

  span {
    font-size: 13px;
    color: ${(props) => props.theme.profile.activeSessions.tableCellColor};
    font-weight: 600;
  }

  .avatar {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 16px;
          `
        : css`
            margin-right: 16px;
          `}
  }
`;

const StyledLastSessionBlock = styled.div`
  padding: 0px 20px;

  .subtitle {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .session-info-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px 0px;
  }

  .session-info-row {
    display: contents;
  }

  .session-info-label {
    padding: 4px;
    font-size: 13px;

    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 24px;
            padding-right: 0px;
          `
        : css`
            margin-right: 24px;
            padding-left: 0px;
          `}
  }

  .session-info-value {
    justify-self: start;
    font-weight: 600;
    padding: 4px;
    font-size: 13px;
    width: 100%;
    ::first-letter {
      text-transform: uppercase;
    }
  }

  .online {
    font-weight: 600;
    padding: 4px;
    font-size: 13px;
    width: 100%;
    color: ${(props) => props.theme.profile.activeSessions.textOnlineColor};
    ::first-letter {
      text-transform: uppercase;
    }
  }
`;

const LastSessionBlock = (props: LastSessionBlockProps) => {
  const {
    t,
    isMe,
    items = {} as IAllSessions,
    setDisplayName = () => {},
    setDisableDialogVisible = () => {},
    setLogoutAllDialogVisible = () => {},
    getFromDateAgo = () => {},
    currentUser,
    userSessions,
  } = props;

  // const {
  //   id,
  //   avatar,
  //   isAdmin,
  //   isOwner,
  //   isRoomAdmin,
  //   isCollaborator,
  //   connections,
  //   sessions,
  // } = items;

  const { userId, displayName, avatar } = currentUser;

  const fromDateAgo = getFromDateAgo(userId);

  const isOnline = fromDateAgo === "online";
  // const { platform, browser, ip, city, country } =
  //   (connections[0] || sessions[0]) ?? {};

  const { platform, browser, ip, city, country } =
    userSessions[0] || currentUser.session;

  // const getUserType = (): string => {
  //   if (isOwner) return t("Common:Owner");
  //   if (isAdmin)
  //     return t("Common:PortalAdmin", { productName: t("Common:ProductName") });
  //   if (isRoomAdmin) return t("Common:RoomAdmin");
  //   if (isCollaborator) return t("Common:PowerUser");
  //   return t("Common:User");
  // };

  // const role = isOwner
  //   ? AvatarRole.owner
  //   : isAdmin
  //     ? AvatarRole.admin
  //     : AvatarRole.none;

  const onClickLogout = () => {
    setLogoutAllDialogVisible(true);
    setDisplayName(displayName);
  };

  const onClickDisable = () => {
    setDisableDialogVisible(true);
  };

  const contextOptions = () => {
    return [
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
  };

  return (
    <>
      <StyledUserInfoBlock>
        <Box displayProp="flex" alignItems="center" justifyContent="center">
          <Avatar
            className="avatar"
            // role={role}
            size={AvatarSize.big}
            userName={displayName}
            source={avatar}
          />
          <Box displayProp="flex" flexDirection="column">
            <Text className="username">{decode(displayName)}</Text>
            {/*<span>{getUserType()}</span>*/}
          </Box>
        </Box>

        <ContextMenuButton
          id="user-session-info"
          displayType={ContextMenuButtonDisplayType.dropdown}
          className="context-button"
          data={[]}
          getData={contextOptions}
        />
      </StyledUserInfoBlock>

      <StyledLastSessionBlock>
        <Text className="subtitle">{t("Profile:LastSession")}</Text>
        <Box className="session-info-wrapper">
          <div className="session-info-row">
            <Text className="session-info-label">{t("Common:Active")}</Text>
            <Text className={isOnline ? "online" : "session-info-value"}>
              {t(`Common:${fromDateAgo}`)}
            </Text>
          </div>
          <div className="session-info-row">
            <Text className="session-info-label">{t("Common:Platform")}</Text>
            <Text className="session-info-value">{platform}</Text>
          </div>
          <div className="session-info-row">
            <Text className="session-info-label">{t("Common:Browser")}</Text>
            <Text className="session-info-value">
              {browser?.split(".")[0] ?? ""}
            </Text>
          </div>
          <div className="session-info-row">
            <Text className="session-info-label">{t("Common:Location")}</Text>
            <Text className="session-info-value" truncate>
              {(country || city) && (
                <>
                  {country}
                  {country && city && ", "}
                  {`${city} `}
                </>
              )}
              {ip}
            </Text>
          </div>
        </Box>
      </StyledLastSessionBlock>
    </>
  );
};

export default inject<TStore>(({ setup, activeSessionsStore }) => {
  const { setDisableDialogVisible, setLogoutAllDialogVisible } = setup;

  const {
    getItems,
    isMe,
    getFromDateAgo,
    setDisplayName,
    currentUser,
    userSessions,
  } = activeSessionsStore;

  return {
    isMe,
    items: getItems,
    getFromDateAgo,
    setDisplayName,
    setDisableDialogVisible,
    setLogoutAllDialogVisible,
    currentUser,
    userSessions,
  };
})(observer(LastSessionBlock));
