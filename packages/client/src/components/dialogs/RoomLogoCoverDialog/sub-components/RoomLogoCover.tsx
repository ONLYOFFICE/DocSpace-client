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
import React, { useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { RoomLogoCover as UIKitRoomLogoCover } from "@docspace/ui-kit/components/room-logo-cover-dialog";
import { getRoomTitle } from "@docspace/ui-kit/components";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import type { ICover } from "@docspace/ui-kit/types";

import type { TRoom } from "@docspace/shared/api/rooms/types";

import { ILogo, RoomLogoCoverProps } from "../RoomLogoCoverDialog.types";

const RoomLogoCover = ({
  isBaseTheme,
  title,
  covers,
  logoColor,
  logoCover,
  coverColor,
  coverId,
  withSelection,
  setRoomCoverDialogProps,
  roomCoverDialogProps,
  forwardedRef,
  scrollHeight,
  currentColorScheme,
  openColorPicker,
  setOpenColorPicker,
  generalScroll,
}: RoomLogoCoverProps) => {
  const { t } = useTranslation(["Common", "CreateEditRoomDialog"]);

  const roomTitle = React.useMemo(
    () => getRoomTitle(title ?? ""),
    [title],
  );

  const syncToStore = (color: string, cover: ICover | null) => {
    setRoomCoverDialogProps({
      ...roomCoverDialogProps,
      icon: cover ? (cover as unknown as ILogo) : roomTitle,
      color,
      withoutIcon: !cover,
      customColor: globalColors.logoColors.includes(color)
        ? roomCoverDialogProps.customColor
        : color,
    });
  };

  return (
    <UIKitRoomLogoCover
      t={t}
      covers={covers ?? []}
      title={title ?? ""}
      logoColor={logoColor}
      logoCover={logoCover}
      coverColor={coverColor}
      coverId={coverId}
      withSelection={withSelection}
      openColorPicker={openColorPicker}
      isBaseTheme={isBaseTheme}
      currentColorScheme={currentColorScheme}
      forwardedRef={forwardedRef as React.RefObject<HTMLDivElement | null> | undefined}
      scrollHeight={
        typeof scrollHeight === "string" ? scrollHeight : undefined
      }
      generalScroll={generalScroll}
      onInit={syncToStore}
      onChange={syncToStore}
      setOpenColorPicker={setOpenColorPicker}
    />
  );
};

export default inject<TStore>(({ settingsStore, dialogsStore }) => {
  const { theme, currentColorScheme } = settingsStore;

  const {
    coverSelection,
    cover: storeCover,
    covers,
    createRoomDialogProps,
    editRoomDialogProps,
    setRoomCoverDialogProps,
    roomCoverDialogProps,
  } = dialogsStore;

  const room: TRoom = coverSelection as unknown as TRoom;

  const logoRaw = createRoomDialogProps.visible ? null : room?.logo;
  const logo = room?.isTemplate ? room?.logo : logoRaw;
  const title =
    createRoomDialogProps.visible || editRoomDialogProps.visible
      ? roomCoverDialogProps.title
      : room?.title;

  const cover = storeCover ?? {
    color: logo?.color,
    cover: logo?.cover?.id,
  };

  return {
    isBaseTheme: theme?.isBase,
    title,
    covers,
    logoColor: logo?.color,
    logoCover: logo?.cover as unknown as ICover,
    coverColor: cover?.color,
    coverId: cover?.cover,
    withSelection: roomCoverDialogProps.withSelection,
    setRoomCoverDialogProps,
    roomCoverDialogProps,
    currentColorScheme,
  };
})(observer(RoomLogoCover));
