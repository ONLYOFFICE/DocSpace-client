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

import React from "react";
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
