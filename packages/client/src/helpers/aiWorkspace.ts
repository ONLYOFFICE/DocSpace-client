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

/**
 * The AI Workspace section is one rooms list (`/ai-rooms`) narrowed to a
 * room type by the `type` query: the agents (AI projects) on its root, the
 * Skills (Instructions rooms) and Knowledge (Knowledge rooms) entries. What
 * the list holds decides its title and what "New room" creates there.
 */

const LIST_TYPES = new Set<number>([
  RoomsType.AiProjectRoom,
  RoomsType.InstructionsRoom,
  RoomsType.KnowledgeRoom,
]);

/** The one room type the list is narrowed to; the agents when none or several are asked for. */
export const getAiWorkspaceListType = (search: string): RoomsType => {
  const types = new URLSearchParams(search).getAll("type");
  const type = types.length === 1 ? Number(types[0]) : NaN;
  return LIST_TYPES.has(type) ? (type as RoomsType) : RoomsType.AiProjectRoom;
};

/** The list's title: the section's own name for the agents, the entry's name otherwise. */
export const getAiWorkspaceTitle = (
  t: (key: string) => string,
  search: string,
): string => {
  switch (getAiWorkspaceListType(search)) {
    case RoomsType.InstructionsRoom:
      return t("Common:Skills");
    case RoomsType.KnowledgeRoom:
      return t("Common:AiWorkspaceKnowledge");
    default:
      return t("Common:AiWorkspace");
  }
};

export type TAiWorkspaceCreatePayload =
  | { startRoomType: RoomsType }
  | { isAiProjectCreate: true };

/**
 * What "New room" creates in the list: the entry's room type, with the type
 * chooser locked, or an agent through the project form on the root.
 */
export const getAiWorkspaceCreatePayload = (
  search: string,
): TAiWorkspaceCreatePayload => {
  const type = getAiWorkspaceListType(search);
  return type === RoomsType.AiProjectRoom
    ? { isAiProjectCreate: true }
    : { startRoomType: type };
};
