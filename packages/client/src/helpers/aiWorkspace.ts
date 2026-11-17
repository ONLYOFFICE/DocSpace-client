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

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea, RoomsType } from "@docspace/shared/enums";

/**
 * The AI Chat section's lists are one rooms list (`/ai-rooms`) narrowed to a
 * room type by the `type` query: the Agents (AI projects) on its root, the
 * Skill sets (Instructions rooms) and Knowledge bases (Knowledge rooms)
 * entries. What the list holds decides its title and what "New room" creates
 * there.
 */

/**
 * The item is an agent (an AI project room). The server marks no room as
 * one: `isAIProject` is set only on a project read through the projects API
 * (`aiProjectToRoom`), so a room of the Files list, or the agent's own page,
 * is told by its room type.
 */
export const isAgent = (item: unknown): boolean => {
  if (typeof item !== "object" || item === null) return false;
  const { isAIProject, roomType } = item as {
    isAIProject?: unknown;
    roomType?: unknown;
  };
  return isAIProject === true || roomType === RoomsType.AiProjectRoom;
};

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

/** The list's title: the name of the sidebar entry that opens it. */
export const getAiWorkspaceTitle = (
  t: (key: string) => string,
  search: string,
): string => {
  switch (getAiWorkspaceListType(search)) {
    case RoomsType.InstructionsRoom:
      return t("Common:SkillSets");
    case RoomsType.KnowledgeRoom:
      return t("Common:AIProjectKnowledgeRooms");
    default:
      return t("Common:Agents");
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

/**
 * "New room" of the list creates nothing: the Knowledge bases list while
 * vectorization is off, as a Knowledge room cannot be created then (the
 * server refuses it, and the type list greys it out).
 */
export const isAiWorkspaceCreateRefused = (
  search: string,
  vectorizationEnabled: boolean,
): boolean =>
  !vectorizationEnabled &&
  getAiWorkspaceListType(search) === RoomsType.KnowledgeRoom;

const TAB_PARAM = "tab";
const TEMPLATES_TAB = "templates";

/**
 * The list has a Templates tab: only the Agents do. Skill sets and Knowledge
 * bases are plain lists, without tabs.
 */
export const hasAiWorkspaceTemplates = (search: string): boolean =>
  getAiWorkspaceListType(search) === RoomsType.AiProjectRoom;

/**
 * The list is on its Templates tab: the shipped agent templates. A `tab`
 * query on a list without the tab is ignored, so the list itself is shown.
 */
export const isAiWorkspaceTemplates = (search: string): boolean =>
  hasAiWorkspaceTemplates(search) &&
  new URLSearchParams(search).get(TAB_PARAM) === TEMPLATES_TAB;

/**
 * The URL of a list, or of the Agents' Templates tab. Both are the section's
 * list narrowed to the type, so the title, the sidebar entry and the header
 * hold; the Templates tab is marked by a query of its own and draws the
 * catalog in place of the list. Only the Agents have it: for another type
 * the list's own URL is returned.
 */
export const getAiWorkspaceTabUrl = (
  isTemplates: boolean,
  type: RoomsType,
  userId?: string,
): string => {
  const filter = RoomsFilter.getDefault(userId, RoomSearchArea.AiHub);
  filter.searchArea = RoomSearchArea.AiHub;
  filter.type = [String(type)];
  const tab =
    isTemplates && type === RoomsType.AiProjectRoom
      ? `&${TAB_PARAM}=${TEMPLATES_TAB}`
      : "";
  return `/ai-rooms/filter?${filter.toUrlParams(userId, false)}${tab}`;
};
