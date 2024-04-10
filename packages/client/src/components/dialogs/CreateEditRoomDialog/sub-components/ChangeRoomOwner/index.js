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
          size="min"
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
        color={currentColorScheme.main?.accent}
        onClick={onOwnerChange}
      >
        {t("Common:ChangeButton")}
      </Link>
    </Styled.ChangeRoomOwner>
  );
};

export default inject(({ settingsStore, userStore }) => ({
  currentUserId: userStore.user.id,
  currentColorScheme: settingsStore.currentColorScheme,
}))(withTranslation(["Common"])(ChangeRoomOwner));
