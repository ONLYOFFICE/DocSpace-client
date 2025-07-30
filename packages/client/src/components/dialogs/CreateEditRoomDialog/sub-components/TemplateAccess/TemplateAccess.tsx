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
import { TCreatedBy, TTranslation } from "@docspace/shared/types";
import { Text } from "@docspace/shared/components/text";
import { Link, LinkType } from "@docspace/shared/components/link";
import PublicRoomBar from "@docspace/shared/components/public-room-bar";
import { TSelectorItem } from "@docspace/shared/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import { Encoder } from "@docspace/shared/utils/encoder";
import * as Styled from "./TemplateAccess.styled";

const MAX_AVATARS_COUNT = 3;

type TemplateAccessType = {
  t: TTranslation;
  roomOwner: TCreatedBy;
  inviteItems: TSelectorItem[];
  onOpenAccessSettings: VoidFunction;
  isAvailable: boolean;
};

const TemplateAccess = ({
  t,
  roomOwner,
  inviteItems: listItems,
  onOpenAccessSettings,
  isAvailable = false,
}: TemplateAccessType) => {
  const inviteItems = [...listItems].filter(
    (l) => l.templateAccess !== ShareAccessRights.None,
  );

  const userName = Encoder.htmlDecode(roomOwner.displayName ?? "");

  const usersList = inviteItems.filter((i) => !i.isGroup && !i.templateIsOwner);

  const groupsList = inviteItems.filter((i) => i.isGroup);

  const avatarList = [];

  const itemsLength = inviteItems.length;

  const maxAvatarsCount =
    itemsLength >= MAX_AVATARS_COUNT ? MAX_AVATARS_COUNT : itemsLength;

  let index = 0;
  while (avatarList.length !== maxAvatarsCount) {
    const item = inviteItems[index];

    avatarList.push(
      <Avatar
        className="template-access_avatar"
        size={AvatarSize.min}
        role={AvatarRole.none}
        isDefaultSource={roomOwner.hasAvatar}
        source={
          (("avatarSmall" in item && item?.avatarSmall) || item.avatar) ?? ""
        }
        isGroup={item?.isGroup}
        userName={(("userName" in item && item?.userName) || item.name) ?? ""}
        key={index}
      />,
    );
    index++;
  }

  const getAccessLabel = () => {
    if (usersList.length) {
      if (groupsList.length) {
        return t("Files:MeAndMembersAndGroups", {
          membersCount: `${usersList.length}`,
          groupsCount: `${groupsList.length}`,
        });
      }
      return t("Files:MeAndMembers", { membersCount: `${usersList.length}` });
    }
    if (groupsList.length) {
      return t("Files:MeAndGroups", { groupsCount: `${groupsList.length}` });
    }

    return "";
  };

  const accessLabel = getAccessLabel();

  return (
    <Styled.TemplateAccess>
      <Text className="template-access_label" fontWeight={600} fontSize="13px">
        {`${t("Files:AccessToTemplate")}:`}
      </Text>

      {isAvailable ? (
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
            {itemsLength === 1 ? (
              <>
                <Avatar
                  size={AvatarSize.min}
                  role={AvatarRole.none}
                  isDefaultSource={roomOwner.hasAvatar}
                  source={roomOwner.avatarSmall}
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
                  {accessLabel}
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
