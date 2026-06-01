// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import { useTranslation } from "react-i18next";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Text } from "@docspace/ui-kit/components/text";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { FolderType } from "@docspace/shared/enums";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import type { TFolder } from "@docspace/shared/api/files/types";

import PersonPlusReactSvgUrl from "PUBLIC_DIR/images/person+.react.svg?url";
import SearchIconReactSvgUrl from "PUBLIC_DIR/images/search.react.svg?url";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";

import {
  getRoomIconLogo,
  type RoomIconFields,
} from "@/app/(docspace)/_utils/getRoomIconLogo";

import Search from "./Search";
import styles from "../Members.module.scss";

type RoomHeaderProps = {
  selection: TFolder;
  hasEditAccess: boolean;
  showSearch: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
  setSearchValue: (value: string) => void;
  onInvite: () => void;
};

const RoomHeader = ({
  selection,
  hasEditAccess,
  showSearch,
  onSearchOpen,
  onSearchClose,
  setSearchValue,
  onInvite,
}: RoomHeaderProps) => {
  const { t } = useTranslation(["Common"]);

  const roomItem = selection as TFolder & RoomIconFields;
  const roomIconLogo = getRoomIconLogo(roomItem);
  const isTemplate = selection.rootFolderType === FolderType.RoomTemplates;
  const badgeUrl = getRoomBadgeUrl(selection as Parameters<typeof getRoomBadgeUrl>[0]) ?? "";

  return (
    <div className={styles.roomHeader}>
      <RoomIcon
        logo={roomIconLogo}
        color={roomItem.roomIconColor}
        title={selection.title}
        showDefault={!roomItem.hasRoomImage}
        isTemplate={isTemplate}
        badgeUrl={badgeUrl}
        size="32px"
      />
      <Text className={styles.roomTitle} fontWeight={600} truncate>
        {selection.title}
      </Text>
      <div className={styles.roomActions}>
        <IconButton
          iconName={SearchIconReactSvgUrl}
          size={16}
          title={t("Common:Search")}
          onClick={onSearchOpen}
        />
        {hasEditAccess ? (
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

      {showSearch ? (
        <Search setSearchValue={setSearchValue} onClose={onSearchClose} />
      ) : null}
    </div>
  );
};

export default RoomHeader;
