// (c) Copyright Ascensio System SIA 2009-2025
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
import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { decode } from "he";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TCreatedBy } from "@docspace/shared/types";

import * as Styled from "./index.styled";

type ChangeRoomOwnerProps = {
  currentUserId?: string;
  roomOwner: TCreatedBy;
  onOwnerChange: () => void;
  currentColorScheme?: SettingsStore["currentColorScheme"];
  canChangeOwner: boolean;
};

const ChangeRoomOwner = ({
  currentUserId,
  roomOwner,
  onOwnerChange,
  currentColorScheme,
  canChangeOwner,
}: ChangeRoomOwnerProps) => {
  const { t } = useTranslation(["Common"]);

  const userName = useMemo(
    () => decode(roomOwner.displayName),
    [roomOwner.displayName],
  );

  return (
    <Styled.ChangeRoomOwner>
      <Text className="change-owner-label" fontWeight={600} fontSize="13px">
        {t("Files:RoomOwner")}
      </Text>

      <div className="change-owner-display-wrapper">
        <div className="change-owner-display">
          <Avatar
            className="change-owner-display-avatar"
            size={AvatarSize.base}
            role={AvatarRole.none}
            isDefaultSource={roomOwner.hasAvatar}
            source={roomOwner.avatarSmall ?? roomOwner.avatar}
            userName={userName}
          />
          <div className="change-owner-display-name">
            <Text fontWeight={600} fontSize="13px">
              {userName}
            </Text>
            {roomOwner.id === currentUserId ? (
              <Text className="me-label">({t("Common:MeLabel")})</Text>
            ) : null}
          </div>
        </div>

        {canChangeOwner ? (
          <Link
            className="change-owner-link"
            isHovered
            type={LinkType.action}
            fontWeight={600}
            fontSize="13px"
            color={currentColorScheme?.main?.accent}
            onClick={onOwnerChange}
          >
            {t("Common:ChangeButton")}
          </Link>
        ) : null}
      </div>
    </Styled.ChangeRoomOwner>
  );
};

export default inject(({ settingsStore, userStore }: TStore) => ({
  currentUserId: userStore.user?.id,
  currentColorScheme: settingsStore.currentColorScheme,
}))(observer(ChangeRoomOwner));
