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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { FolderType } from "@docspace/shared/enums";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import type { TFolder } from "@docspace/shared/api/files/types";

import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import {
  getRoomIconLogo,
  type RoomIconFields,
} from "@/app/(docspace)/_utils/getRoomIconLogo";

import Search from "./Search";
import styles from "./RoomHeader.module.scss";

type RoomHeaderProps = {
  selection: TFolder;
  isMembersView?: boolean;
  hasEditAccess?: boolean;
  setSearchValue?: (value: string) => void;
  onInvite?: () => void;
};

const RoomHeader = ({
  selection,
  isMembersView = false,
  hasEditAccess = false,
  setSearchValue,
  onInvite,
}: RoomHeaderProps) => {
  const { t } = useTranslation(["Common"]);

  const [showSearch, setShowSearch] = React.useState(false);

  React.useEffect(() => {
    setShowSearch(false);
  }, [selection.id]);

  const roomItem = selection as TFolder & RoomIconFields;
  const roomIconLogo = getRoomIconLogo(roomItem);
  const isTemplate = selection.rootFolderType === FolderType.RoomTemplates;
  const isPrivateRoom =
    (selection as TFolder & { private?: boolean }).private === true;
  const badgeUrl =
    getRoomBadgeUrl(
      selection as Parameters<typeof getRoomBadgeUrl>[0],
    ) ?? "";
  const badgeIconColor = isPrivateRoom
    ? globalColors.lightStatusPositive
    : undefined;

  const onSearchClose = () => {
    setShowSearch(false);
    setSearchValue?.("");
  };

  return (
    <div className={styles.roomHeader}>
      <RoomIcon
        logo={roomIconLogo}
        color={roomItem.roomIconColor}
        title={selection.title}
        showDefault={!roomItem.hasRoomImage}
        isTemplate={isTemplate}
        badgeUrl={badgeUrl}
        badgeIconColor={badgeIconColor}
        size="32px"
      />
      <Text className={styles.roomTitle} fontWeight={600} truncate>
        {selection.title}
      </Text>
      <div className={styles.roomActions}>
        {isMembersView ? (
          <IconButton
            iconName={SearchIconReactSvgUrl}
            size={16}
            title={t("Common:Search")}
            onClick={() => setShowSearch(true)}
          />
        ) : null}
        {isMembersView && hasEditAccess ? (
          <IconButton
            iconName={PersonPlusReactSvgUrl}
            size={16}
            isFill
            title={t("Common:InviteContacts")}
            onClick={onInvite}
          />
        ) : null}
        <IconButton
          iconName={VerticalDotsReactSvgUrl}
          size={16}
          title={t("Common:Actions")}
          onClick={() => {}}
        />
      </div>

      {isMembersView && showSearch && setSearchValue ? (
        <Search setSearchValue={setSearchValue} onClose={onSearchClose} />
      ) : null}
    </div>
  );
};

export default RoomHeader;
