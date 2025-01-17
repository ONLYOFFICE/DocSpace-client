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

import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ReactSVG } from "react-svg";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/shared/components/avatar";
import { Text } from "@docspace/shared/components/text";
import cloneDeep from "lodash/cloneDeep";
// import {
//   getUserType,
//   getUserTypeTranslation,
// } from "@docspace/shared/utils/common";
import { TTranslation } from "@docspace/shared/types";
import { TSelectorItem } from "@docspace/shared/components/selector";
// import { EmployeeType } from "@docspace/shared/enums";
import { ShareAccessRights } from "@docspace/shared/enums";
import { StyledInviteUserBody } from "../StyledInvitePanel";

type ItemProps = {
  t: TTranslation;
  item: TSelectorItem;
  setInviteItems: (items: TSelectorItem[]) => void;
  inviteItems: TSelectorItem[];
  // isDisabled: boolean;
};

const Item = ({
  t,
  item,
  setInviteItems,
  inviteItems,
  // isDisabled,
}: ItemProps) => {
  const { avatar, displayName, email, id, isGroup, name: groupName } = item;

  const name = isGroup
    ? groupName
    : avatar
      ? displayName !== ""
        ? displayName
        : email
      : email;
  const source = avatar || (isGroup ? "" : AtReactSvgUrl);

  // const type = getUserType(item);

  // let avatarRole = AvatarRole.user;
  // switch (type) {
  //   case EmployeeType.Owner:
  //     avatarRole = AvatarRole.owner;
  //     break;
  //   case EmployeeType.Admin:
  //     avatarRole = AvatarRole.admin;
  //     break;
  //   case EmployeeType.RoomAdmin:
  //     avatarRole = AvatarRole.manager;
  //     break;
  //   case EmployeeType.User:
  //     avatarRole = AvatarRole.collaborator;
  //     break;
  //   default:
  // }

  // const typeLabel = getUserTypeTranslation(type, t);

  const removeItem = () => {
    const itemIndex = inviteItems.findIndex(
      (inviteItem) => inviteItem.id === id,
    );

    let newItems = cloneDeep(inviteItems);

    if (newItems[itemIndex].access) {
      newItems[itemIndex].access = ShareAccessRights.None;
    } else {
      newItems = newItems.filter((inviteItem) => inviteItem.id !== id);
    }

    setInviteItems(newItems);
  };

  const isAvailable = false; // TODO: Templates
  const canDelete = !item.isOwner && !isAvailable;

  return (
    <>
      <Avatar
        size={AvatarSize.min}
        role={AvatarRole.none} // avatarRole
        source={source}
        isGroup={isGroup}
        userName={groupName}
        className="invite-input-avatar"
      />
      <StyledInviteUserBody>
        <div className="invite-input-item">
          <Text truncate noSelect className="invite-input-text">
            {name}
          </Text>
          <Text truncate noSelect className="invite-input-text_me">
            {item.isOwner && `(${t("Common:MeLabel")})`}
          </Text>
        </div>

        {/* {!isGroup && (
          <Text
            className="label"
            fontWeight={400}
            fontSize="12px"
            noSelect
            color="#A3A9AE"
            truncate
          >
            {`${typeLabel} | ${email}`}
          </Text>
        )} */}
      </StyledInviteUserBody>
      {canDelete && (
        <ReactSVG
          className="remove-icon"
          src={RemoveReactSvgUrl}
          onClick={removeItem}
        />
      )}
    </>
  );
};

export default Item;
