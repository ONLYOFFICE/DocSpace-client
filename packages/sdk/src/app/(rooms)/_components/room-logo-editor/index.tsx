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

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { AvatarEditorDialog } from "@docspace/ui-kit/components/avatar-editor-dialog";
import { RoomLogoCoverDialog } from "@docspace/ui-kit/components/room-logo-cover-dialog";
import { FolderType } from "@docspace/shared/enums";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import Camera10ReactSvgUrl from "PUBLIC_DIR/images/icons/10/cover.camera.react.svg?url";

import {
  getRoomIconLogo,
  type RoomIconFields,
} from "@/app/(docspace)/_utils/getRoomIconLogo";

import { useRoomLogoEditor } from "./useRoomLogoEditor";

type RoomLogoEditableIconProps = {
  selection: TFolder;
  variant: "header" | "details";
  onUpdated?: () => void;
};

const RoomLogoEditableIcon = observer(
  ({ selection, variant, onUpdated }: RoomLogoEditableIconProps) => {
    const { t } = useTranslation(["Common"]);

    const roomItem = selection as TFolder & RoomIconFields;
    const security = (selection as unknown as TRoom).security;
    const isArchive = selection.rootFolderType === FolderType.Archive;
    const isTemplate = selection.rootFolderType === FolderType.RoomTemplates;
    const canEdit = Boolean(security?.EditRoom) && !isArchive;

    const isHeader = variant === "header";
    const roomIconLogo = getRoomIconLogo(roomItem);
    const hasRoomImage = Boolean(roomItem.hasRoomImage);
    const hasUploadedImage = Boolean(roomItem.roomLogo?.original);

    const editor = useRoomLogoEditor({
      roomId: Number(selection.id),
      hasImage: hasUploadedImage,
      onUpdated,
    });

    const badgeUrl =
      getRoomBadgeUrl(
        selection as Parameters<typeof getRoomBadgeUrl>[0],
        isHeader ? 12 : 24,
      ) ?? "";

    const badgeIconColor =
      (selection as unknown as TRoom).private === true
        ? globalColors.lightStatusPositive
        : undefined;

    const sharedProps = {
      logo: roomIconLogo,
      color: roomItem.roomIconColor,
      title: selection.title,
      showDefault: !hasRoomImage,
      isTemplate,
      isArchive,
      badgeUrl,
      badgeIconColor,
      imgClassName: "react-svg-icon",
      size: isHeader ? "32px" : "96px",
      radius: isHeader ? "6px" : "16px",
    };

    if (!canEdit) {
      return <RoomIcon {...sharedProps} />;
    }

    return (
      <>
        <RoomIcon
          {...sharedProps}
          model={editor.model}
          onChangeFile={editor.onChangeFile}
          {...(isHeader
            ? { hoverSrc: Camera10ReactSvgUrl }
            : { withEditing: true })}
          dataTestId={
            isHeader
              ? "info_panel_header_room_icon"
              : "info_panel_details_room_icon"
          }
        />

        <AvatarEditorDialog
          t={t}
          visible={editor.cropper.visible}
          title={t("Common:RoomCover")}
          image={editor.cropper.image}
          isLoading={editor.isSaving}
          onClose={editor.cropper.onClose}
          onSave={editor.cropper.onSave}
          onChangeImage={editor.cropper.onChangeImage}
          onChangeFile={editor.cropper.onChangeFile}
        />

        <RoomLogoCoverDialog
          t={t}
          visible={editor.coverDialog.visible}
          covers={editor.coverDialog.covers}
          title={selection.title}
          initialColor={
            roomItem.roomIconColor ? `#${roomItem.roomIconColor}` : undefined
          }
          initialCover={roomItem.roomLogo?.cover ?? null}
          onClose={editor.coverDialog.onClose}
          onApply={editor.coverDialog.onApply}
        />
      </>
    );
  },
);

export default RoomLogoEditableIcon;

