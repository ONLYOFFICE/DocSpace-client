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

"use client";

import React, { useEffect, useCallback } from "react";

import { TGetRooms } from "@docspace/shared/api/rooms/types";
import { TSelectorItem } from "@docspace/shared/components/selector";
import RoomSelectorComponent from "@docspace/shared/selectors/Room";
import {
  frameCallCommand,
  frameCallEvent,
} from "@docspace/shared/utils/common";

import { RoomsType } from "@docspace/shared/enums";

import useSDK from "@/hooks/useSDK";

type RoomSelectorProps = {
  roomList: TGetRooms;
  pageCount: number;
  baseConfig: {
    header?: boolean;
    cancel?: boolean;
    cancelLabel?: string;
    acceptLabel?: string;
    search?: boolean;
    roomType?: RoomsType | RoomsType[] | null;
  };
};

export default function RoomSelector({
  roomList,
  pageCount,
  baseConfig,
}: RoomSelectorProps) {
  const { sdkConfig } = useSDK();

  const onSubmit = useCallback(async (items: TSelectorItem[]) => {
    const enrichedData = items[0];

    /*       enrichedData.icon =
        enrichedData.icon === ""
          ? await getRoomsIcon(enrichedData.roomType, false, 32)
          : enrichedData.iconOriginal; */

    const isSharedRoom =
      enrichedData.roomType === RoomsType.PublicRoom ||
      ((enrichedData.roomType === RoomsType.CustomRoom ||
        enrichedData.roomType === RoomsType.FormRoom) &&
        enrichedData.shared);

    /*       if (isSharedRoom) {
        const { sharedTo } = await getPrimaryLink(enrichedData.id);
        const { id, title, requestToken, primary } = sharedTo;
        enrichedData.requestTokens = [{ id, primary, title, requestToken }];
      } */

    frameCallEvent({ event: "onSelectCallback", data: [enrichedData] });
  }, []);

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
  }, []);

  const cancelButtonProps = baseConfig?.cancel
    ? {
        withCancelButton: true as const,
        cancelButtonLabel: baseConfig?.cancelLabel as string,
        onCancel: onClose,
      }
    : {};

  const headerProps = baseConfig?.header
    ? {
        withHeader: true as const,
        headerProps: {
          headerLabel: "",
          isCloseable: false,
          onCloseClick: onClose,
        },
      }
    : { withPadding: false };

  const { folders, total } = roomList;

  return (
    <RoomSelectorComponent
      {...cancelButtonProps}
      {...headerProps}
      onSubmit={onSubmit}
      isMultiSelect={false}
      withPadding={false}
      withSearch={baseConfig?.search}
      submitButtonLabel={baseConfig?.acceptLabel}
      roomType={baseConfig?.roomType}
      withInit
      initItems={folders}
      initTotal={total}
      initHasNextPage={total > pageCount}
    />
  );
}
