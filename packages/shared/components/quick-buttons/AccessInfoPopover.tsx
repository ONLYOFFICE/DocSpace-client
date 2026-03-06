/*
 * (c) Copyright Ascensio System SIA 2009-2026
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { useState, useEffect, useCallback } from "react";
import type { TFunction } from "i18next";

import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";

import { DropDown } from "@docspace/ui-kit/components/drop-down";
import { DropDownItem } from "@docspace/ui-kit/components/drop-down-item";
import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { Scrollbar } from "@docspace/ui-kit/components/scrollbar";

import { getFakeFileSharedUsers } from "../../api/files";

import styles from "./AccessInfoPopover.module.scss";

type TSharedUser = {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
};

type TAccessInfoType = "everyone" | "partial" | "restricted";

type AccessInfoPopoverProps = {
  t: TFunction;
  itemId?: string | number;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onOpenAccessSettings: () => void;
  accessInfoType?: TAccessInfoType;
};

export const AccessInfoPopover = ({
  t,
  itemId,
  isOpen,
  anchorRef,
  onClose,
  onOpenAccessSettings,
  accessInfoType = "restricted",
}: AccessInfoPopoverProps) => {
  const [users, setUsers] = useState<TSharedUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!itemId) return;

    setIsLoading(true);
    try {
      const response = await getFakeFileSharedUsers(itemId);
      if (response?.items) {
        const mappedUsers = response.items.map((item) => ({
          id: item.sharedTo.id,
          displayName: item.sharedTo.displayName,
          email: item.sharedTo.email,
          avatar: item.sharedTo.avatar,
          isOwner: item.isOwner,
          isAdmin: item.sharedTo.isAdmin,
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Failed to fetch shared users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [itemId]);

  useEffect(() => {
    if (isOpen && accessInfoType !== "everyone") {
      fetchUsers();
    }
  }, [isOpen, fetchUsers, accessInfoType]);

  const handleAccessSettingsClick = () => {
    onClose();
    onOpenAccessSettings();
  };

  const handleClickOutside = useCallback(
    (e: Event) => {
      const target = e.target as HTMLElement;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    },
    [onClose, anchorRef],
  );

  return (
    <DropDown
      open={isOpen}
      forwardedRef={anchorRef}
      clickOutsideAction={handleClickOutside}
      directionX="right"
      directionY="bottom"
      withDynamicScrollbar
      className={styles.accessInfoPopover}
      withBackdrop
    >
      {accessInfoType === "everyone" ? (
        <div className={styles.everyoneContent}>
          <Text
            className={styles.everyoneText}
            fontSize="12px"
            fontWeight={400}
          >
            {t("Common:FileAvailableToEveryone")}
          </Text>
          <Link
            type={LinkType.action}
            className={styles.accessSettingsLink}
            onClick={handleAccessSettingsClick}
            isHovered
          >
            {t("Files:AccessSettings")}
          </Link>
        </div>
      ) : isLoading ? (
        <div className={styles.loaderContainer}>
          <Loader type={LoaderTypes.track} />
        </div>
      ) : (
        <>
          <Scrollbar
            translateContentSizesToHolder
            style={{ maxHeight: "432px" }}
          >
            {users.map((user) => (
              <DropDownItem key={user.id} className={styles.userItem} noHover>
                <Avatar
                  size={AvatarSize.min}
                  role={user.isAdmin ? AvatarRole.admin : AvatarRole.user}
                  source={user.avatar}
                  userName={user.displayName}
                />
                <Text
                  className={styles.userName}
                  fontSize="13px"
                  fontWeight={600}
                  truncate
                >
                  {user.displayName}
                </Text>
              </DropDownItem>
            ))}
          </Scrollbar>
          <DropDownItem
            className={styles.accessSettingsItem}
            icon={SettingsIcon}
            label={t("Files:AccessSettings")}
            onClick={handleAccessSettingsClick}
          />
        </>
      )}
    </DropDown>
  );
};
