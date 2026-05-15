/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { decode } from "he";

import {
  Avatar,
  AvatarRole,
  AvatarSize,
} from "@docspace/ui-kit/components/avatar";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TCreatedBy } from "@docspace/shared/types";

import styles from "./change-room-owner.module.scss";

type ChangeRoomOwnerProps = {
  currentUserId?: string;
  roomOwner: TCreatedBy;
  onOwnerChange?: () => void;
  currentColorScheme?: SettingsStore["currentColorScheme"];
  canChangeOwner: boolean;
  isAgent?: boolean;
};

const ChangeRoomOwner = ({
  currentUserId,
  roomOwner,
  onOwnerChange,
  currentColorScheme,
  canChangeOwner,
  isAgent,
}: ChangeRoomOwnerProps) => {
  const { t } = useTranslation(["Common"]);

  const userName = useMemo(
    () => decode(roomOwner.displayName),
    [roomOwner.displayName],
  );

  return (
    <div>
      <Text className="change-owner-label" fontWeight={600} fontSize="13px">
        {isAgent ? t("Common:AgentOwner") : t("Files:RoomOwner")}
      </Text>

      <div className={styles.changeOwnerDisplayWrapper}>
        <div className={styles.changeOwnerDisplay}>
          <Avatar
            className="change-owner-display-avatar"
            size={AvatarSize.base}
            role={AvatarRole.none}
            isDefaultSource={roomOwner.hasAvatar}
            source={
              roomOwner.hasAvatar ? roomOwner.avatar : roomOwner.avatarSmall
            }
            userName={userName}
          />
          <div className={styles.changeOwnerDisplayName}>
            <Text fontWeight={600} fontSize="13px">
              {userName}
            </Text>
            {roomOwner.id === currentUserId ? (
              <Text className={styles.meLabel}>({t("Common:MeLabel")})</Text>
            ) : null}
          </div>
        </div>

        {canChangeOwner ? (
          <Link
            className={styles.changeOwnerLink}
            isHovered
            type={LinkType.action}
            fontWeight={600}
            fontSize="13px"
            color={currentColorScheme?.main?.accent ?? undefined}
            onClick={onOwnerChange}
          >
            {t("Common:ChangeButton")}
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ settingsStore, userStore }: TStore) => ({
  currentUserId: userStore.user?.id,
  currentColorScheme: settingsStore.currentColorScheme,
}))(observer(ChangeRoomOwner));
