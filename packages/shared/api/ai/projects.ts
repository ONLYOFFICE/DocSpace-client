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

import { RoomsType } from "@onlyoffice/apps-ui-kit/enums";

import { VectorizationStatus } from "../../enums";
import { request } from "../client";
import type { TOperation } from "../files/types";

/**
 * AI Projects: a project is a room of type 12 that binds a model,
 * Instructions rooms and Knowledge rooms and shares them with a team.
 * Served by ASC.AI.Chat under `/api/2.0/ai/projects`, which delegates each
 * call to the .NET AI service as it does for agents, so a project comes back
 * as a room (`FolderDto`) with its `aiProject` block.
 *
 * Like the agents API, this module holds only what is specific to a project:
 * the list with its filters, read, create, update, delete, and the skills and
 * knowledge listings. Everything a project shares with a room (pin, mute,
 * leave, owner change, logo removal, members, invitation links, history) goes through the room routes in `api/rooms`, `api/files` and
 * `api/settings`, as the room panels already do.
 */

const baseUrl = "/ai/projects";

/** `FileShare` on the server, limited to what a project uses: a Member is the room's Read. */
export const AiProjectAccess = {
  None: 0,
  Owner: 1,
  Member: 2,
  ProjectManager: 9,
} as const;
export type TAiProjectAccess =
  (typeof AiProjectAccess)[keyof typeof AiProjectAccess];

export const INSTRUCTIONS_ROOM_TYPE = RoomsType.InstructionsRoom;
export const KNOWLEDGE_ROOM_TYPE = RoomsType.KnowledgeRoom;
export const AI_PROJECT_ROOM_TYPE = RoomsType.AiProjectRoom;

export type TAiProjectUser = {
  id: string;
  displayName: string;
  email?: string;
  avatarSmall?: string;
  hasAvatar?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRoomAdmin?: boolean;
  isCollaborator?: boolean;
  isVisitor?: boolean;
};

export type TAiProjectProfile = {
  id: string;
  name: string | null;
  provider: string | null;
  available: boolean;
};

export type TAiProjectSource = {
  id: number;
  /** "" when the room is not available (the server sends `null`). */
  title: string;
  roomType: number;
  /** `false` when the room was deleted, changed type or the caller cannot read it. */
  available: boolean;
  /** The room is in the Archive: it stays usable, read-only. */
  archived: boolean;
  logo?: TAiProjectLogo;
  skillsCount?: number;
  indexedFiles?: number;
  totalFiles?: number;
  /** Knowledge: files whose vectorization failed. */
  failedFiles?: number;
};

/** A room logo: its colour (with `#`) and the built-in cover drawn in it, or uploaded sizes. */
export type TAiProjectLogo = {
  color: string;
  /** The built-in cover drawn in `color`, as the rooms carry it; absent for initials. */
  cover?: TAiProjectCover | null;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
};

/** A built-in room cover: its id and the SVG it is drawn from. */
export type TAiProjectCover = { id: string; data: string };

/** A non-fatal problem of the last create or update. */
export type TAiProjectWarning = {
  code: "grantSkipped" | "ownerLostAccess" | "roomUnavailable";
  roomId: number | null;
  subjectId: string | null;
  /** Localised on the server. */
  message: string;
};

export type TAiProjectSettings = {
  profile: TAiProjectProfile | null;
  instructionsRooms: TAiProjectSource[];
  knowledgeRooms: TAiProjectSource[];
  canEditSettings: boolean;
  /** Present only right after a change that skipped something. */
  warnings?: TAiProjectWarning[];
};

/** The room security flags a project reads, plus `Leave`, which the client derives. */
export type TAiProjectSecurity = {
  Read: boolean;
  Rename: boolean;
  EditRoom: boolean;
  EditAccess: boolean;
  ChangeOwner: boolean;
  Delete: boolean;
  Pin: boolean;
  Mute: boolean;
  Leave: boolean;
};

export type TAiProject = {
  id: number;
  title: string;
  roomType: number;
  created: string;
  updated: string;
  createdBy: TAiProjectUser | null;
  updatedBy: TAiProjectUser | null;
  /** The room tags, by name, as a room carries them. */
  tags: string[];
  pinned: boolean;
  mute: boolean;
  inRoom: boolean;
  access: TAiProjectAccess;
  logo: TAiProjectLogo;
  security: TAiProjectSecurity;
  aiProject: TAiProjectSettings;
};

export type TAiProjectsPage = {
  folders: TAiProject[];
  /** The projects root; its id is the socket channel `DIR-{id}` of the list. */
  current?: { id: number };
  startIndex: number;
  count: number;
  total: number;
};

export type TAiProjectSettingsRequest = {
  profileId?: string | null;
  instructionsRoomIds?: number[];
  knowledgeRoomIds?: number[];
};

/** An uploaded logo: the temporary file `files/logos` answered and the crop, as a room takes it. */
export type TAiProjectLogoUpload = {
  tmpFile: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TAiProjectRequest = {
  title?: string;
  /** The tag names, as a room's create and edit take them; sent when present. */
  tags?: string[];
  /**
   * `color` with or without `#`, the id of a built-in cover ("" for the
   * initials), and `image` for an uploaded picture, sent as the room's `logo`.
   */
  logo?: { color?: string; cover?: string; image?: TAiProjectLogoUpload };
  aiProject?: TAiProjectSettingsRequest;
};

export type TAiProjectSkill = {
  /** The id of the skill's Markdown file. */
  id: string;
  name: string;
  description: string;
};

/** A linked room as the skills and knowledge panels show it. */
type TAiProjectLinkedRoom = {
  id: number;
  /** `null` when the room is not available. */
  title: string | null;
  logo: TAiProjectLogo | null;
  /** `false` when the room is gone or the caller can no longer read it. */
  available: boolean;
};

export type TAiProjectSkillsRoom = TAiProjectLinkedRoom & {
  skills: TAiProjectSkill[];
};

export type TAiProjectKnowledgeFile = {
  id: number;
  title: string;
  fileExst: string;
  indexed: boolean;
  /** `VectorizationStatus` of the file; `null` when it was never queued. */
  vectorizationStatus?: VectorizationStatus | null;
  /** `Vectorization`: the caller may queue the file again after a failure. */
  security?: { Vectorization: boolean };
};

export type TAiProjectKnowledgeRoom = TAiProjectLinkedRoom & {
  totalFiles: number;
  indexedFiles: number;
  /** Files whose vectorization failed. */
  failedFiles?: number;
  /** The room holds more files than one listing reads. */
  truncated: boolean;
  files: TAiProjectKnowledgeFile[];
};

/** The sort keys of the rooms list a project takes. */
export type TAiProjectsSortBy = "DateAndTime" | "AZ" | "DateAndTimeCreation" | "Tags" | "Author";

export type TAiProjectsQuery = {
  filterValue?: string;
  sortBy?: TAiProjectsSortBy;
  sortOrder?: "ascending" | "descending";
  /** Keeps the projects the caller holds this role in; `0` or omitted: any. */
  role?: TAiProjectAccess;
  hasInstructions?: boolean;
  hasKnowledge?: boolean;
  /** Keeps the projects this user or group is in, as `files/rooms` reads it; `excludeSubject` inverts it. */
  subjectId?: string;
  excludeSubject?: boolean;
  /** Keeps the projects this user owns; combines with `subjectId`, as in the rooms list. */
  subjectOwnerId?: string;
  /** Keeps the projects carrying any of these tags; sent as a JSON array. */
  tags?: string[];
  /** Keeps the projects without tags. */
  withoutTags?: boolean;
  /** Keeps the projects that link this room, as an Instructions or a Knowledge room. */
  linkedRoomId?: number;
  startIndex?: number;
  count?: number;
};

const toParams = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      // A list goes as a JSON array (`tags=["a","b"]`), as the rooms filter sends it.
      params.set(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
};

/* ------------------------- Room <-> project shape ------------------------- */

/** A linked room as the server sends it inside the `aiProject` block. */
type TRoomSource = Omit<TAiProjectSource, "title" | "available" | "archived" | "logo"> & {
  title: string | null;
  available?: boolean;
  archived?: boolean;
  logo?: Partial<TAiProjectLogo> | null;
};

/** A project as a room route answers it: the room with its `aiProject` block. */
export type TAiProjectRoomDto = Omit<Partial<TAiProject>, "logo" | "security" | "aiProject"> & {
  id: number;
  logo?: Partial<TAiProjectLogo> | null;
  security?: Record<string, boolean>;
  aiProject?:
    | (Omit<TAiProjectSettings, "instructionsRooms" | "knowledgeRooms"> & {
        instructionsRooms?: TRoomSource[];
        knowledgeRooms?: TRoomSource[];
      })
    | null;
};

/** A room colour comes without the `#` the project components draw with. */
const withHash = (color: string | undefined) =>
  !color ? "" : color.startsWith("#") ? color : `#${color}`;

const toLogo = (logo: Partial<TAiProjectLogo> | null | undefined): TAiProjectLogo => ({
  ...logo,
  color: withHash(logo?.color),
});

/**
 * A project as the page reads it, from the room the Files API answers:
 * the logo colour with `#`, `Leave` derived (rooms have no such flag: anyone
 * in the project but its owner may leave) and an empty settings block while
 * the room comes without one.
 */
export const toAiProject = (folder: TAiProjectRoomDto): TAiProject => {
  const security = folder.security ?? {};
  const access = (folder.access ?? AiProjectAccess.None) as TAiProjectAccess;
  const inRoom = !!folder.inRoom;
  const settings = folder.aiProject;
  const toSource = (source: TRoomSource): TAiProjectSource => ({
    ...source,
    title: source.title ?? "",
    available: source.available ?? true,
    archived: !!source.archived,
    logo: source.logo ? toLogo(source.logo) : undefined,
  });
  return {
    id: folder.id,
    title: folder.title ?? "",
    roomType: folder.roomType ?? AI_PROJECT_ROOM_TYPE,
    created: folder.created ?? "",
    updated: folder.updated ?? "",
    createdBy: folder.createdBy ?? null,
    updatedBy: folder.updatedBy ?? folder.createdBy ?? null,
    tags: folder.tags ?? [],
    pinned: !!folder.pinned,
    mute: !!folder.mute,
    inRoom,
    access,
    logo: toLogo(folder.logo),
    security: {
      Read: !!security.Read,
      Rename: !!security.Rename,
      EditRoom: !!security.EditRoom,
      EditAccess: !!security.EditAccess,
      ChangeOwner: !!security.ChangeOwner,
      Delete: !!security.Delete,
      Pin: !!security.Pin,
      Mute: !!security.Mute,
      Leave: inRoom && access !== AiProjectAccess.Owner,
    },
    aiProject: {
      profile: settings?.profile ?? null,
      instructionsRooms: (settings?.instructionsRooms ?? []).map(toSource),
      knowledgeRooms: (settings?.knowledgeRooms ?? []).map(toSource),
      canEditSettings: settings?.canEditSettings ?? !!security.EditRoom,
      ...(settings?.warnings?.length ? { warnings: settings.warnings } : {}),
    },
  };
};

/**
 * The project as the room components read it (`TRoom`): the room's own
 * colour (no `#`) and the flags the client derives from the entry kind.
 */
export const aiProjectToRoom = (project: TAiProject) => ({
  ...project,
  logo: { ...project.logo, color: project.logo.color.replace("#", "") },
  isRoom: true,
  isFolder: true,
  isAIProject: true,
  private: false,
  shared: false,
  canShare: project.security.EditAccess,
  fileEntryType: 1,
  filesCount: 0,
  foldersCount: 0,
});

const toRoomFields = ({ title, tags, logo, aiProject }: TAiProjectRequest) => {
  const body: Record<string, unknown> = {};
  if (title !== undefined) body.title = title;
  if (tags !== undefined) body.tags = tags;
  if (logo?.color !== undefined) body.color = logo.color.replace("#", "");
  if (logo?.cover !== undefined) body.cover = logo.cover;
  if (logo?.image !== undefined) body.logo = logo.image;
  if (aiProject !== undefined) body.aiProject = aiProject;
  return body;
};

/* --------------------------------- Calls --------------------------------- */

export const getAiProjects = async (
  query: TAiProjectsQuery = {},
  signal?: AbortSignal,
) => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}${toParams(query)}`,
    signal,
  });
  // An envelope that reports `total` reaches here as `{ total, items }`.
  const page = (
    res && typeof res === "object" && "items" in res ? (res as { items: unknown }).items : res
  ) as Omit<TAiProjectsPage, "folders"> & { folders: TAiProjectRoomDto[] };
  return { ...page, folders: page.folders.map(toAiProject) } as TAiProjectsPage;
};

/** Drops the project's uploaded logo; it is drawn by its colour and cover again. */
export const deleteAiProjectLogo = async (id: number) => {
  const res = await request({ method: "DELETE", url: `${baseUrl}/${id}/logo` });
  return toAiProject(res as TAiProjectRoomDto);
};

export const getAiProject = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}` });
  return toAiProject(res as TAiProjectRoomDto);
};

export const createAiProject = async (data: TAiProjectRequest) => {
  const res = await request({ method: "POST", url: baseUrl, data: toRoomFields(data) });
  return toAiProject(res as TAiProjectRoomDto);
};

export const updateAiProject = async (id: number, data: TAiProjectRequest) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/${id}`,
    data: toRoomFields(data),
  });
  return toAiProject(res as TAiProjectRoomDto);
};

/** Starts the delete; the answer is the file operation to follow. */
export const deleteAiProject = async (id: number) => {
  const res = await request({
    method: "DELETE",
    url: `${baseUrl}/${id}`,
    data: { deleteAfter: false },
  });
  return res as TOperation;
};

export const getAiProjectSkills = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}/skills` });
  return (res as { rooms: TAiProjectSkillsRoom[] }).rooms.map((room) => ({
    ...room,
    logo: room.logo ? toLogo(room.logo) : null,
  }));
};

export const getAiProjectKnowledge = async (id: number) => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}/${id}/knowledge`,
  });
  return (res as { rooms: TAiProjectKnowledgeRoom[] }).rooms.map((room) => ({
    ...room,
    logo: room.logo ? toLogo(room.logo) : null,
  }));
};
