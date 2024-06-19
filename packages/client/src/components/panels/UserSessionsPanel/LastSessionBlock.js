import { observer, inject } from "mobx-react";
import { Avatar } from "@docspace/shared/components/avatar";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { PRODUCT_NAME } from "@docspace/shared/constants";
import styled, { css } from "styled-components";

import LogoutReactSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import RemoveSvgUrl from "PUBLIC_DIR/images/remove.session.svg?url";

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

const LastSessionBlock = (props) => {
  const {
    t,
    status,
    userLastSession,
    setDisplayName,
    setDisableDialogVisible,
    setLogoutAllDialogVisible,
  } = props;

  const {
    avatar,
    displayName,
    sessions,
    isAdmin,
    isOwner,
    isRoomAdmin,
    isCollaborator,
  } = userLastSession;

  const { platform, browser, ip, city, country } = sessions;

  const isOnline = status === "online";

  const getUserType = () => {
    if (isOwner) return t("Common:Owner");
    if (isAdmin) return t("Common:PortalAdmin", { productName: PRODUCT_NAME });
    if (isRoomAdmin) return t("Common:RoomAdmin");
    if (isCollaborator) return t("Common:PowerUser");
    return t("Common:User");
  };

  const role = isOwner ? "owner" : isAdmin ? "admin" : null;

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
      },
      {
        key: "Disable",
        label: t("Common:DisableUserButton"),
        icon: RemoveSvgUrl,
        onClick: onClickDisable,
      },
    ];
  };

  return (
    <>
      <StyledUserInfoBlock>
        <Box displayProp="flex" alignItems="center" justifyContent="center">
          <Avatar
            className="avatar"
            role={role}
            size="big"
            userName={displayName}
            source={avatar}
          />
          <Box displayProp="flex" flexDirection="column">
            <Text className="username">{displayName}</Text>
            <span>{getUserType()}</span>
          </Box>
        </Box>

        <ContextMenuButton
          id="user-session-info"
          className="context-button"
          getData={contextOptions}
        />
      </StyledUserInfoBlock>

      <StyledLastSessionBlock>
        <Text className="subtitle">{t("Profile:LastSession")}</Text>
        <Box className="session-info-wrapper">
          <div className="session-info-row">
            <Text className="session-info-label">{t("Common:Active")}</Text>
            <Text className={isOnline ? "online" : "session-info-value"}>
              {t(`Common:${status}`)}
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

export default inject(({ setup, peopleStore }) => {
  const { setDisableDialogVisible, setLogoutAllDialogVisible } = setup;

  const { status, userLastSession, setDisplayName } =
    peopleStore.selectionStore;

  return {
    status,
    userLastSession,
    setDisplayName,
    setDisableDialogVisible,
    setLogoutAllDialogVisible,
  };
})(observer(LastSessionBlock));
