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

import React from "react";

import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { WithFlag } from "@docspace/shared/types";

import NoGalleryItem from "./NoGalleryItem";
import NoRoomItem from "./NoRoomItem";
import NoFileOrFolderItem from "./NoFileOrFolderItem";
import NoContactsItem from "./NoContactsItem";
import ExpiredItem from "./ExpiredItem";
import LockedItem from "./LockedItem";
import NoAgentItem from "./NoAgentItem";

type SharedRoom = WithFlag<
  "isLockedSharedRoom",
  {
    isLockedSharedRoom: true;
  }
>;

type NoItemsProps = {
  isUsers?: boolean;
  isGroups?: boolean;
  isGuests?: boolean;
  isGallery?: boolean;
  isRooms?: boolean;
  isAgents?: boolean;
  isFiles?: boolean;
  isTemplatesRoom?: boolean;
  infoPanelSelection?: TRoom | TFile | TFolder | null;
} & SharedRoom;

const NoItem = ({
  isUsers,
  isGroups,
  isGuests,
  isGallery,
  isRooms,
  isFiles,
  isTemplatesRoom,
  isAgents,
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
    isAgents,
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
    isAgents ||
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
      isAgents,
      isLockedSharedRoom,
    };
  }

  if (infoPanelSelection?.isLinkExpired && infoPanelSelection?.external)
    return <ExpiredItem infoPanelSelection={infoPanelSelection} />;

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
  if (prevNoItemsRef.current.isAgents) return <NoAgentItem />;

  return null;
};
export default NoItem;
