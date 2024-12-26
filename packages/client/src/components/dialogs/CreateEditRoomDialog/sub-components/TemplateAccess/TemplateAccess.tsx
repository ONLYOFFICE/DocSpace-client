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

import { withTranslation } from "react-i18next";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import * as Styled from "./TemplateAccess.styled";

const MAX_AVATARS_COUNT = 3;

const TemplateAccess = ({ t, roomOwner, onOpenAccessSettings }) => {
  const userName = roomOwner.displayName ?? roomOwner.label;

  const usersList = [{}, {}, {}];
  const groupsList = [{}, {}, {}];
  const avatarList = [];

  const usersLength = usersList.length;

  const maxAvatarsCount =
    usersLength >= MAX_AVATARS_COUNT ? MAX_AVATARS_COUNT : usersLength;

  let index = 0;
  while (avatarList.length !== maxAvatarsCount) {
    // const user = usersList[index];

    avatarList.push(
      <Avatar
        className="template-access_avatar"
        size={AvatarSize.min}
        role={AvatarRole.none}
        isDefaultSource={roomOwner.hasAvatar}
        source={roomOwner.avatarSmall ?? roomOwner.avatar}
        userName={userName}
        key={index}
      />,
    );
    index++;
  }

  const isAvailableToEveryone = false; // TODO: Templates

  return (
    <Styled.TemplateAccess>
      <Text className="template-access_label" fontWeight={600} fontSize="13px">
        {`${t("Files:AccessToTemplate")}:`}
      </Text>

      {isAvailableToEveryone ? (
        <PublicRoomBar
          headerText={t("Files:TemplateAvailable")}
          bodyText={
            <>
              <div className="template-access_description">
                {t("Files:TemplateAvailableDescription", {
                  productName: t("Common:ProductName"),
                })}
              </div>
              <Link
                className="template-access_link"
                isHovered
                type={LinkType.action}
                fontWeight={600}
                fontSize="13px"
                onClick={onOpenAccessSettings}
              >
                {t("Files:AccessSettings")}
              </Link>
            </>
          }
        />
      ) : (
        <div className="template-access_wrapper">
          <div className="template-access_avatar-container">
            {usersLength === 1 ? (
              <>
                <Avatar
                  size={AvatarSize.min}
                  role={AvatarRole.none}
                  isDefaultSource={roomOwner.hasAvatar}
                  source={roomOwner.avatarSmall ?? roomOwner.avatar}
                  userName={userName}
                />
                <div className="template-access_display-name">
                  <Text fontWeight={600} fontSize="13px">
                    {userName}
                  </Text>
                  <Text className="me-label">({t("Common:MeLabel")})</Text>
                </div>
              </>
            ) : (
              <>
                <div className="access-avatar-container">{avatarList}</div>
                <Text fontWeight={600} fontSize="14px">
                  {t("Common:MeLabel")}
                  {`and ${usersList.length} User and ${groupsList.length} Groups`}
                </Text>
              </>
            )}
          </div>

          <Link
            className="template-access_link"
            isHovered
            type={LinkType.action}
            fontWeight={600}
            fontSize="13px"
            onClick={onOpenAccessSettings}
          >
            {t("Files:AccessSettings")}
          </Link>
        </div>
      )}
    </Styled.TemplateAccess>
  );
};

export default withTranslation(["Common", "Files"])(TemplateAccess);
