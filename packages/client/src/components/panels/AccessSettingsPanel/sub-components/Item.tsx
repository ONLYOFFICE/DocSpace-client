// (c) Copyright Ascensio System SIA 2009-2026
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

import { memo, useCallback, useMemo } from "react";
import AtReactSvgUrl from "PUBLIC_DIR/images/@.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import { ReactSVG } from "react-svg";
import { TTranslation } from "@docspace/shared/types";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { TSelectorItem } from "@docspace/ui-kit/components/selector";
import { ShareAccessRights } from "@docspace/shared/enums";
import { Encoder } from "@docspace/ui-kit/utils/encoder";
import { getUserTypeName } from "@docspace/shared/utils/common";

import styles from "../AccessSettingsPanel.module.scss";

type ItemProps = {
  t: TTranslation;
  item: TSelectorItem;
  setInviteItems: (items: TSelectorItem[]) => void;
  inviteItems: TSelectorItem[];
  isDisabled: boolean;
  index?: number;
  currentUserId?: string;
};

const Item = memo(
  ({
    t,
    item,
    setInviteItems,
    inviteItems,
    isDisabled,
    index,
    currentUserId,
  }: ItemProps) => {
    const { avatar, displayName, email, id, isGroup, name: groupName } = item;

    const name = useMemo(
      () =>
        isGroup
          ? groupName
          : avatar
            ? displayName !== ""
              ? displayName
              : email
            : email,
      [isGroup, groupName, avatar, displayName, email],
    );

    const source = useMemo(
      () => avatar || (isGroup ? "" : AtReactSvgUrl),
      [avatar, isGroup],
    );

    const removeItem = useCallback(() => {
      const itemIndex = inviteItems.findIndex(
        (inviteItem) => inviteItem.id === id,
      );

      if (itemIndex === -1) return;

      const targetItem = inviteItems[itemIndex];

      if (targetItem.templateAccess) {
        // TODO:
        const newItems = inviteItems.map((inviteItem, i) =>
          i === itemIndex
            ? { ...inviteItem, templateAccess: ShareAccessRights.None }
            : inviteItem,
        );
        setInviteItems(newItems);
      } else {
        setInviteItems(
          inviteItems.filter((inviteItem) => inviteItem.id !== id),
        );
      }
    }, [inviteItems, id, setInviteItems]);

    const canDelete = !item.templateIsOwner && !isDisabled; // TODO:

    const accessLabel = useMemo(
      () =>
        getUserTypeName(
          !!item.isOwner,
          !!item.isAdmin,
          !!item.isRoomAdmin,
          !!item.isCollaborator,
          t,
        ),
      [item.isOwner, item.isAdmin, item.isRoomAdmin, item.isCollaborator, t],
    );

    return (
      <>
        <Avatar
          size={AvatarSize.min}
          role={AvatarRole.none}
          source={source}
          isGroup={isGroup}
          userName={groupName}
          className="invite-input-avatar"
          data-testid={`access_settings_avatar_${index ?? id}`}
        />
        <div className={styles.inviteUserBody}>
          <div className={styles.inviteInputItem}>
            <Text
              fontSize="14px"
              fontWeight="600"
              truncate
              className="invite-input-text"
            >
              {Encoder.htmlDecode(name ?? "")}
            </Text>
            <Text
              fontSize="14px"
              fontWeight="600"
              truncate
              className={styles.inviteInputTextMe}
            >
              {currentUserId === item.id ? `(${t("Common:MeLabel")})` : null}
            </Text>
          </div>
          <div className={styles.accessLabelContainer}>
            <Text
              fontSize="12px"
              fontWeight={400}
              className={styles.accessLabel}
            >
              {accessLabel} | {item.email}
            </Text>
          </div>
        </div>
        {canDelete ? (
          <ReactSVG
            className={styles.removeIcon}
            src={RemoveReactSvgUrl}
            onClick={removeItem}
            data-testid={`access_settings_remove_button_${index ?? id}`}
          />
        ) : null}
      </>
    );
  },
);

Item.displayName = "Item";

export default Item;
