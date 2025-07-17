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

import { frameCallEvent } from "@docspace/shared/utils/common";
import { RoomsType } from "@docspace/shared/enums";
import { getPrimaryLink } from "@docspace/shared/api/rooms";
import RoomSelector from "@docspace/shared/selectors/Room";
import type { TGetRooms } from "@docspace/shared/api/rooms/types";
import type { TSelectorItem } from "@docspace/shared/components/selector";

import { getRoomsIcon } from "@/utils";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useSDKConfig } from "@/providers/SDKConfigProvider";

const IS_TEST = process.env.NEXT_PUBLIC_E2E_TEST;

export type RoomSelectorClientProps = {
  baseConfig: {
    acceptLabel?: string;
    cancel?: boolean;
    cancelLabel?: string;
    header?: boolean;
    roomType?: RoomsType | RoomsType[] | null;
    search?: boolean;
  };
  pageCount: number;
  roomList: TGetRooms;
};

export default function RoomSelectorClient({
  baseConfig,
  pageCount,
  roomList,
}: RoomSelectorClientProps) {
  useSDKConfig();

  useDocumentTitle("RoomSelector");

  const onSubmit = useCallback(async ([selectedItem]: TSelectorItem[]) => {
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
      const response = (await getPrimaryLink(selectedItem.id)) as {
        sharedTo: {
          id: string;
          title: string;
          requestToken: string;
          primary: boolean;
        };
      };
      const {
        sharedTo: { id, title, requestToken, primary },
      } = response;
      enrichedData.requestTokens = [{ id, primary, title, requestToken }];
    }

    frameCallEvent({ event: "onSelectCallback", data: [enrichedData] });

    if (IS_TEST) {
      // DON`T REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
      console.log(
        JSON.stringify({ onSelectCallback: "onSelectCallback", enrichedData }),
      );
    }
  }, []);

  const onClose = useCallback(() => {
    frameCallEvent({ event: "onCloseCallback" });

    if (IS_TEST) {
      // DON`T REMOVE CONSOLE LOG, IT IS REQUIRED FOR TESTING
      console.log("onCloseCallback");
    }
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

  const searchProps = baseConfig?.search
    ? { withSearch: baseConfig?.search }
    : {};

  const { folders, total } = roomList;

  return (
    <RoomSelector
      {...cancelButtonProps}
      {...headerProps}
      {...roomTypeProps}
      {...searchProps}
      initHasNextPage={total > pageCount}
      initItems={folders}
      initTotal={total}
      isMultiSelect={false}
      onSubmit={onSubmit}
      submitButtonLabel={baseConfig?.acceptLabel}
      withInit
    />
  );
}
