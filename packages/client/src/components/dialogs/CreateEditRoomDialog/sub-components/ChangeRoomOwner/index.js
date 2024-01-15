import { inject } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Avatar } from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import * as Styled from "./index.styled";

const ChangeRoomOwner = ({
  t,
  currentUserId,
  roomOwner,
  onOwnerChange,
  currentColorScheme,
}) => {
  const userName = roomOwner.displayName ?? roomOwner.label;

  return (
    <Styled.ChangeRoomOwner>
      <Text className="change-owner-label" fontWeight={600} fontSize="13px">
        {t("Files:RoomOwner")}
      </Text>

      <div className="change-owner-display">
        <Avatar
          className={"change-owner-display-avatar"}
          size="base"
          role={""}
          isDefaultSource={roomOwner.hasAvatar}
          source={roomOwner.avatarSmall ?? roomOwner.avatar}
          userName={userName}
        />
        <div className="change-owner-display-name">
          <Text fontWeight={600} fontSize="13px">
            {userName}
          </Text>
          {roomOwner.id === currentUserId && (
            <Text className="me-label">({t("Common:MeLabel")})</Text>
          )}
        </div>
      </div>

      <Link
        className="change-owner-link"
        isHovered
        type="action"
        fontWeight={600}
        fontSize="13px"
        color={currentColorScheme.main.accent}
        onClick={onOwnerChange}
      >
        {t("Common:ChangeButton")}
      </Link>
    </Styled.ChangeRoomOwner>
  );
};

export default inject(({ auth, dialogsStore }) => ({
  currentUserId: auth.userStore.user.id,
  currentColorScheme: auth.settingsStore.currentColorScheme,
}))(withTranslation(["Common"])(ChangeRoomOwner));
