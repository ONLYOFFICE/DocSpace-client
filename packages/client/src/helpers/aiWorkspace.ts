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
 * entries. What the list holds decides its title, what its create button
 * creates there and what the button reads.
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

/** The list a room of the AI Chat section is listed in: its room type; `null` for another room. */
export const getAiRoomListType = (
  roomType: RoomsType | number | null | undefined,
): RoomsType | null =>
  roomType != null && LIST_TYPES.has(roomType) ? (roomType as RoomsType) : null;

/** The name of the list of a room type: the sidebar entry that opens it. */
export const getAiListTitle = (
  t: (key: string) => string,
  type: RoomsType | null,
): string => {
  switch (type) {
    case RoomsType.InstructionsRoom:
      return t("Common:SkillSets");
    case RoomsType.KnowledgeRoom:
      return t("Common:AIProjectKnowledgeRooms");
    default:
      return t("Common:Agents");
  }
};

/**
 * What the Info panel says while nothing of the list is selected: that the
 * details of its agents, skill sets or knowledge bases are shown there.
 */
export const getAiWorkspaceInfoPanelHint = (
  t: (key: string) => string,
  search: string,
): string => {
  switch (getAiWorkspaceListType(search)) {
    case RoomsType.InstructionsRoom:
      return t("InfoPanel:SkillSetsEmptyScreenText");
    case RoomsType.KnowledgeRoom:
      return t("InfoPanel:KnowledgeBasesEmptyScreenText");
    default:
      return t("Common:AIAgentsEmptyScreenTent");
  }
};

export type TAiListEmptyTexts = {
  title: string;
  description: string;
  userTitle: string;
  userDescription: string;
  createDescription: string;
};

/**
 * What an empty list says. Each list names what it holds - agents, skill
 * sets or knowledge bases - and never the three of them at once: the list
 * creates only its own kind.
 */
export const getAiListEmptyTexts = (
  t: (key: string) => string,
  type: RoomsType,
): TAiListEmptyTexts => {
  switch (type) {
    case RoomsType.InstructionsRoom:
      return {
        title: t("EmptyView:SkillSetsEmptyTitle"),
        description: t("EmptyView:SkillSetsEmptyDescription"),
        userTitle: t("EmptyView:SkillSetsEmptyUserTitle"),
        userDescription: t("EmptyView:SkillSetsEmptyUserDescription"),
        createDescription: t("EmptyView:SkillSetsCreateDescription"),
      };
    case RoomsType.KnowledgeRoom:
      return {
        title: t("EmptyView:KnowledgeBasesEmptyTitle"),
        description: t("EmptyView:KnowledgeBasesEmptyDescription"),
        userTitle: t("EmptyView:KnowledgeBasesEmptyUserTitle"),
        userDescription: t("EmptyView:KnowledgeBasesEmptyUserDescription"),
        createDescription: t("EmptyView:KnowledgeBasesCreateDescription"),
      };
    default:
      return {
        title: t("EmptyView:AgentsEmptyTitle"),
        description: t("EmptyView:AgentsEmptyDescription"),
        userTitle: t("EmptyView:AgentsEmptyUserTitle"),
        userDescription: t("EmptyView:AgentsEmptyUserDescription"),
        createDescription: t("EmptyView:AgentsCreateDescription"),
      };
  }
};

/**
 * What a search or a filter that found nothing says in the AI Chat section:
 * its lists name what they hold, and a skill set or a knowledge base names
 * what is inside it. `null` anywhere else.
 */
export const getAiEmptyFilterDescription = (
  t: (key: string) => string,
  {
    isAiHubFolder,
    listType,
    roomType,
  }: {
    isAiHubFolder: boolean;
    listType: RoomsType;
    roomType?: RoomsType | number | null;
  },
): string | null => {
  if (isAiHubFolder) {
    if (listType === RoomsType.InstructionsRoom)
      return t("Common:EmptyFilterSkillSetsDescription");
    if (listType === RoomsType.KnowledgeRoom)
      return t("Common:EmptyFilterKnowledgeBasesDescription");
    return t("Common:EmptyFilterAIAgentsDescription");
  }
  if (roomType === RoomsType.InstructionsRoom)
    return t("Common:EmptyFilterSkillsDescription");
  if (roomType === RoomsType.KnowledgeRoom)
    return t("Common:EmptyFilterKnowledgeFilesDescription");
  return null;
};

/** The list's title: the name of the sidebar entry that opens it. */
export const getAiWorkspaceTitle = (
  t: (key: string) => string,
  search: string,
): string => getAiListTitle(t, getAiWorkspaceListType(search));

/**
 * The label of the list's create button: "New agent" on the Agents, "New"
 * on Skill sets and Knowledge bases.
 */
export const getAiWorkspaceCreateLabel = (
  t: (key: string) => string,
  search: string,
): string =>
  getAiWorkspaceListType(search) === RoomsType.AiProjectRoom
    ? t("Common:NewAgent")
    : t("Common:New");

export type TAiWorkspaceCreatePayload =
  | { startRoomType: RoomsType }
  | { isAiProjectCreate: true };

/**
 * What the create button creates in the list: the entry's room type, with
 * the type chooser locked, or an agent through the project form on the root.
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
 * The create button of the list creates nothing: the Knowledge bases list while
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

/**
 * The URL of the list a room of the section belongs to: the Agents for an
 * agent, the Skill sets or the Knowledge bases for those rooms, and the
 * Agents for anything else. A room that is left, deleted or stepped out of
 * returns here: the section's list with no type draws the Rooms body under
 * the Agents title.
 */
export const getAiWorkspaceListUrlOf = (
  roomType: unknown,
  userId?: string,
): string => {
  const type = Number(roomType);
  return getAiWorkspaceTabUrl(
    false,
    LIST_TYPES.has(type) ? (type as RoomsType) : RoomsType.AiProjectRoom,
    userId,
  );
};

/** The tags of a filter as a list: none, one or several. */
const toTagList = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  return typeof tags === "string" && tags ? [tags] : [];
};

/**
 * The categories of the agents: their tags, each once, in the order they
 * first appear. An agent's category is a tag of its room, so the rooms
 * filter that the list uses narrows it by one.
 */
export const getAgentCategories = (
  agents: readonly { roomType?: unknown; tags?: readonly string[] | null }[],
): string[] =>
  Array.from(
    new Set(
      agents
        .filter(isAgent)
        .flatMap((agent) => agent.tags ?? [])
        .filter(Boolean),
    ),
  );

/**
 * The list is narrowed beyond its room type - by search, tags, owner or
 * another filter - so the agents it holds are not all the user can see.
 */
export const isAgentListNarrowed = (filter: RoomsFilter): boolean =>
  Boolean(
    filter.filterValue ||
      filter.subjectId ||
      filter.subjectOwnerId ||
      filter.provider ||
      filter.quotaFilter ||
      toTagList(filter.tags).length ||
      filter.withoutTags === true ||
      filter.withoutTags === "true" ||
      filter.hasMetadataFilter(),
  );

/**
 * The category the list is narrowed to: its one tag, or `null` ("All") with
 * none. `undefined` when it is narrowed to several tags or to agents without
 * tags, which no single category stands for.
 */
export const getAgentCategory = (
  filter: Pick<RoomsFilter, "tags" | "withoutTags">,
): string | null | undefined => {
  if (filter.withoutTags === true || filter.withoutTags === "true")
    return undefined;
  const tags = toTagList(filter.tags);
  if (!tags.length) return null;
  return tags.length === 1 ? tags[0] : undefined;
};

/**
 * The address of the agents' list narrowed to a category (all agents for
 * `null`). The rest of its filter - the search, the sort - stays, and the
 * list starts again from its first page.
 */
export const getAgentCategoryUrl = (
  filter: RoomsFilter,
  category: string | null,
  userId?: string,
): string => {
  const next = filter.clone();
  next.page = 0;
  next.tags = category === null ? null : [category];
  next.withoutTags = false;
  return `/ai-rooms/filter?${next.toUrlParams(userId)}`;
};

/**
 * Every agent the user can see, as far as the categories need: the agents'
 * list with nothing but its room type, on a first page of 100.
 */
export const getVisibleAgentsFilter = (): RoomsFilter => {
  const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AiHub);
  filter.pageCount = 100;
  return filter;
};
