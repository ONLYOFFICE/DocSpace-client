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
import type { TTranslation } from "@docspace/shared/types";

import { isAgent } from "SRC_DIR/helpers/aiWorkspace";

/**
 * The rows of the AI section's lists and of the rooms opened from them, as
 * the compact view tells them apart: an agent, a skill set and a knowledge
 * base of the lists, a skill of an open skill set and a file of an open
 * knowledge base.
 */
export type TAiRowKind =
  | "agent"
  | "skillSet"
  | "knowledgeBase"
  | "skill"
  | "knowledgeFile";

type TAiRowItem = {
  isRoom?: boolean;
  isFolder?: boolean;
  roomType?: RoomsType | number | null;
  isAIProject?: boolean;
  filesCount?: number;
  contentLength?: string;
};

/**
 * What kind of AI row the item is, told as the table tells which columns to
 * show: by the list it is in (the AI section's root, or an open skill set or
 * knowledge base) and by its room type. `null` for any other row.
 */
export const getAiRowKind = (
  item: TAiRowItem,
  {
    isAiSectionFolder,
    isSkillSet,
    isKnowledgeBase,
  }: {
    /** The list is the AI section's root: the agents, skill sets or knowledge bases. */
    isAiSectionFolder?: boolean;
    /** The list is an open skill set. */
    isSkillSet?: boolean;
    /** The list is an open knowledge base. */
    isKnowledgeBase?: boolean;
  },
): TAiRowKind | null => {
  if (isAiSectionFolder) {
    if (!item.isRoom) return null;
    if (isAgent(item)) return "agent";
    if (item.roomType === RoomsType.InstructionsRoom) return "skillSet";
    if (item.roomType === RoomsType.KnowledgeRoom) return "knowledgeBase";
    return null;
  }
  if (item.isRoom || item.isFolder) return null;
  if (isKnowledgeBase) return "knowledgeFile";
  if (isSkillSet) return "skill";
  return null;
};

/**
 * The secondary values of an AI row in the compact view, in the order of the
 * table's columns: an agent's owner and last modification; a skill set's
 * skills count, owner and last modification; a knowledge base's owner and
 * last modification (its indexing state is marked beside its name); a
 * skill's description and last modification; a knowledge base file's size,
 * who added it and when. A value not known is left out.
 */
export const getAiRowInfo = (
  kind: TAiRowKind,
  {
    t,
    item,
    fileOwner,
    updatedDate,
    createdDate,
    skillDescription,
  }: {
    t: TTranslation;
    item: TAiRowItem;
    fileOwner?: string;
    updatedDate?: string;
    createdDate?: string;
    skillDescription?: string;
  },
): string[] => {
  const values = (() => {
    switch (kind) {
      case "skillSet":
        return [
          `${t("Common:Skills")}: ${item.filesCount ?? 0}`,
          fileOwner,
          updatedDate,
        ];
      case "skill":
        return [skillDescription, updatedDate];
      case "knowledgeFile":
        return [item.contentLength, fileOwner, createdDate];
      default:
        return [fileOwner, updatedDate];
    }
  })();
  return values.filter((value): value is string => !!value);
};
