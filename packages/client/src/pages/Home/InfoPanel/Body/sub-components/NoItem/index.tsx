// (c) Copyright Ascensio System SIA 2009-2025
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

import type { TRoom } from "@docspace/shared/api/rooms/types";
import { WithFlag } from "@docspace/shared/types";

import NoGalleryItem from "./NoGalleryItem";
import NoRoomItem from "./NoRoomItem";
import NoFileOrFolderItem from "./NoFileOrFolderItem";
import NoContactsItem from "./NoContactsItem";
import ExpiredItem from "./ExpiredItem";
import LockedItem from "./LockedItem";

type SharedRoom = WithFlag<
  "isLockedSharedRoom",
  {
    isLockedSharedRoom: true;
    infoPanelSelection: TRoom;
  }
>;

type NoItemsProps = {
  isUsers?: boolean;
  isGroups?: boolean;
  isGuests?: boolean;
  isGallery?: boolean;
  isRooms?: boolean;
  isFiles?: boolean;
  isTemplatesRoom?: boolean;
} & SharedRoom;

const NoItem = ({
  isUsers,
  isGroups,
  isGuests,
  isGallery,
  isRooms,
  isFiles,
  isTemplatesRoom,
  isLockedSharedRoom,
  infoPanelSelection,
}: NoItemsProps) => {
  const prevNoItemsRef = React.useRef({
    isUsers,
    isGroups,
    isGuests,
    isGallery,
    isRooms,
    isFiles,
    isTemplatesRoom,
    isLockedSharedRoom,
  });

  if (
    isUsers ||
    isGroups ||
    isGuests ||
    isGallery ||
    isRooms ||
    isFiles ||
    isTemplatesRoom ||
    isLockedSharedRoom
  ) {
    prevNoItemsRef.current = {
      isUsers,
      isGroups,
      isGuests,
      isGallery,
      isRooms,
      isFiles,
      isTemplatesRoom,
      isLockedSharedRoom,
    };
  }

  if (infoPanelSelection?.expired && infoPanelSelection?.external)
    return <ExpiredItem />;

  if (prevNoItemsRef.current.isLockedSharedRoom)
    return <LockedItem item={infoPanelSelection!} />;

  if (
    prevNoItemsRef.current.isGroups ||
    prevNoItemsRef.current.isUsers ||
    prevNoItemsRef.current.isGuests
  )
    return <NoContactsItem isGuests={isGuests} isGroups={isGroups} />;
  if (prevNoItemsRef.current.isGallery) return <NoGalleryItem />;

  if (prevNoItemsRef.current.isFiles) return <NoFileOrFolderItem />;
  if (prevNoItemsRef.current.isTemplatesRoom) return <NoGalleryItem />;
  if (prevNoItemsRef.current.isRooms) return <NoRoomItem />;

  return null;
};
export default NoItem;
