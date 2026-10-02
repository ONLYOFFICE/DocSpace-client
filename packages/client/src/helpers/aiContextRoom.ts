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

import { RoomsType } from "@docspace/shared/enums";

import { isTourDemoId } from "SRC_DIR/api/tourDemo/data";

/** The kinds of room whose root may hold a `.ai` folder (server `ResolveFolderTypeAsync`). */
const ROOM_TYPES_WITH_AI_FOLDER = new Set<RoomsType>([
  RoomsType.CustomRoom,
  RoomsType.PublicRoom,
  RoomsType.VirtualDataRoom,
  RoomsType.EditingRoom,
]);

export type AiContextRoom = { id: string; name: string };

type PathEntry = {
  id: number | string;
  title: string;
  isRoom: boolean;
  roomType?: RoomsType;
};

type SelectedLocation = {
  id: number | string | null;
  title: string;
  isRoom: boolean;
  roomType: RoomsType | null;
  navigationPath: PathEntry[];
};

/**
 * The room the AI chat may connect as context at the current location: the
 * room itself when the user stands in its root, or the room entry of the
 * navigation path from any of its subfolders. `null` outside rooms, in a
 * room kind that cannot hold a `.ai` folder (an AI agent room, a form
 * room), and in a tour stand-in space the server has never heard of.
 * Whether the room does hold the folder is checked when the chat opens.
 */
export const getAiContextRoom = (
  location: SelectedLocation,
): AiContextRoom | null => {
  const room = location.isRoom
    ? {
        id: location.id,
        title: location.title,
        roomType: location.roomType ?? undefined,
      }
    : location.navigationPath.find((entry) => entry.isRoom);

  if (!room || room.id === null || room.id === undefined) return null;
  if (
    room.roomType === undefined ||
    !ROOM_TYPES_WITH_AI_FOLDER.has(room.roomType)
  ) {
    return null;
  }
  if (isTourDemoId(room.id)) return null;

  return { id: String(room.id), name: room.title };
};
