import { Avatar } from "@docspace/shared/components/avatar";
import { Box } from "@docspace/shared/components/box";
import { Text } from "@docspace/shared/components/text";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
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

const UserInfoBlock = (props) => {
  const {
    t,
    userData,
    setLogoutAllDialogVisible,
    setDisableDialogVisible,
    setDisplayName,
  } = props;

  const { avatar, displayName, isAdmin, isOwner, isRoomAdmin, isCollaborator } =
    userData;

  const getUserType = () => {
    if (isOwner) return t("Common:Owner");
    if (isAdmin) return t("Common:DocspaceAdmin");
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
  );
};

export default UserInfoBlock;