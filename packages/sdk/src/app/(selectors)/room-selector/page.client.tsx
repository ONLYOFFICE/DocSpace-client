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

import React, { useCallback } from "react";

import { TSelectorItem } from "@docspace/shared/components/selector";
import RoomSelectorComponent from "@docspace/shared/selectors/Room";
import { frameCallEvent } from "@docspace/shared/utils/common";

import { RoomsType } from "@docspace/shared/enums";

import useSDK from "@/hooks/useSDK";
import { getRoomsIcon } from "@/utils";
import { RoomSelectorProps } from "@/types";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function RoomSelector({
  roomList,
  pageCount,
  baseConfig,
}: RoomSelectorProps) {
  const { sdkConfig } = useSDK();
  useDocumentTitle("RoomSelector");

  const getPrimaryLink = async (roomId: string) => {
    const res = await fetch(`/api/2.0/files/rooms/${roomId}/link`).then((r) =>
      r.json(),
    );
    return res.response;
  };

  const onSubmit = useCallback(async ([selectedItem]: TSelectorItem[]) => {
    console.log("call");
    const enrichedData = {
      ...selectedItem,
      icon:
        selectedItem.icon === ""
          ? getRoomsIcon(selectedItem.roomType as RoomsType, false, 32)
          : selectedItem.iconOriginal,
    } as TSelectorItem & {
      requestTokens?: {
        id: string;
        primary: boolean;
        title: string;
        requestToken: string;
      }[];
    };

    const isSharedRoom =
      selectedItem.roomType === RoomsType.PublicRoom ||
      ((selectedItem.roomType === RoomsType.CustomRoom ||
        selectedItem.roomType === RoomsType.FormRoom) &&
        selectedItem.shared);

    if (isSharedRoom) {
      const {
        sharedTo: { id, title, requestToken, primary },
      } = await getPrimaryLink(selectedItem.id as string);
      enrichedData.requestTokens = [{ id, primary, title, requestToken }];
    }

    frameCallEvent({ event: "onSelectCallback", data: [enrichedData] });

    // DON`N REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
    console.log(
      JSON.stringify({ onSelectCallback: "onSelectCallback", enrichedData }),
    );
  }, []);

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });
    // DON`N REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
    console.log("onCloseCallback");
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

  const roomTypeProps = baseConfig?.roomType
    ? { roomType: baseConfig.roomType }
    : {};

  const { folders, total } = roomList;

  return (
    <RoomSelectorComponent
      {...cancelButtonProps}
      {...headerProps}
      {...roomTypeProps}
      onSubmit={onSubmit}
      isMultiSelect={false}
      withSearch={baseConfig?.search}
      submitButtonLabel={baseConfig?.acceptLabel}
      withInit
      initItems={folders}
      initTotal={total}
      initHasNextPage={total > pageCount}
    />
  );
}
