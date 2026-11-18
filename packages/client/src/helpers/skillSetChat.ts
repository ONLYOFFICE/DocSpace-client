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
import {
  getSkillNameByTitle,
  isSkillFile,
  type TSkillFolder,
} from "@docspace/shared/utils/skillFile";

/** A skill set as "Use in chat" connects it: the room's id and its name. */
/** A skill set to connect, and for a skill's row the name the skill is called by. */
export type TChatSkillSet = { id: number | string; title: string; skill?: string };

type TUseInChatItem = {
  id: number | string;
  title: string;
  isRoom?: boolean;
  isFolder?: boolean;
  roomType?: RoomsType | number | null;
  fileExst?: string;
  folderId?: number | string;
};

/**
 * The skill set a row's "Use in chat" connects to the chat: a skill set of
 * the Skill sets list itself, or, for a skill of the open set, that set.
 * Any other row has none and offers no "Use in chat".
 */
export const getUseInChatSkillSet = (
  item: TUseInChatItem,
  openFolder?: (TSkillFolder & { title?: string }) | null,
): TChatSkillSet | null => {
  if (item.isRoom)
    return item.roomType === RoomsType.InstructionsRoom
      ? { id: item.id, title: item.title }
      : null;
  if (item.isFolder || !openFolder) return null;
  const isOpenSet =
    openFolder.roomType === RoomsType.InstructionsRoom &&
    openFolder.id != null &&
    String(item.folderId) === String(openFolder.id);
  if (!isOpenSet || !isSkillFile(item, openFolder)) return null;
  return {
    id: openFolder.id!,
    title: openFolder.title ?? "",
    skill: getSkillNameByTitle(item.title),
  };
};
