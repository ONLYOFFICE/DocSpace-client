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
 * AI Projects: a project is a room of type 12 under the "AI rooms" root
 * (`FolderType.AiHub`) that links Instructions rooms and Knowledge rooms and
 * shares them with a team. The project is an ordinary room of `files/rooms`
 * (list with `searchArea=AiHub&type=12`, create, read, update, delete); its
 * linked rooms are `files/rooms/{id}/sources` and the skills of those rooms
 * `files/rooms/{id}/skills`. The project's model is proxied by ASC.AI.Chat
 * (`ai/projects/{id}/model`) until Files serves it. This module composes the
 * `aiProject` block the page reads from the room, its sources and its model. The list answers the rooms
 * without the block (`aiProject.partial`): a project is read again when it
 * is opened or picked.
 *
 * Everything a project shares with a room (pin, mute, leave, owner change,
 * members, invitation links, history) goes through the room routes in
 * `api/rooms`, `api/files` and `api/settings`, as the room panels already do.
 */

const roomsUrl = "/files/rooms";
const modelUrl = (id: number) => `/ai/projects/${id}/model`;

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
/** Rooms of one type a project links at most (`AiHubService.MaxRoomsPerType`). */
export const AI_PROJECT_MAX_ROOMS_PER_TYPE = 20;

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

/**
 * A non-fatal problem of the last create or update, after the project itself
 * was saved. `roomUnavailable`: rooms the server refused to link or unlink;
 * `modelNotSaved`: the model the server refused to store.
 */
export type TAiProjectWarning = {
  code: "roomUnavailable" | "modelNotSaved";
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
  /**
   * The room came without its block (the list answers none): the rooms are
   * unknown until the project is read on its own.
   */
  partial?: true;
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
  /**
   * The rooms the form shows, as it read them: a room linked by this save is
   * taken from here instead of reading the sources back.
   */
  rooms?: TAiProjectSource[];
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

/**
 * A linked Instructions room as `GET files/rooms/{id}/skills` lists it. The
 * server reads the skills through the project, so every linked room is
 * listed and none is marked unavailable.
 */
export type TAiProjectSkillsRoom = Omit<TAiProjectLinkedRoom, "available"> & {
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
  /** Keeps the projects this user or group is in, as `files/rooms` reads it; `excludeSubject` inverts it. */
  subjectId?: string;
  excludeSubject?: boolean;
  /** Keeps the projects this user owns; combines with `subjectId`, as in the rooms list. */
  subjectOwnerId?: string;
  /** Keeps the projects carrying any of these tags; sent as a JSON array. */
  tags?: string[];
  /** Keeps the projects without tags. */
  withoutTags?: boolean;
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
 * in the project but its owner may leave) and, while the room comes without
 * its settings block, an empty one marked `partial`.
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
      ...(settings ? {} : { partial: true as const }),
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

// The room fields `files/rooms` takes; the `aiProject` block goes to the
// sources and model routes.
const toRoomFields = ({ title, tags, logo }: TAiProjectRequest) => {
  const body: Record<string, unknown> = {};
  if (title !== undefined) body.title = title;
  if (tags !== undefined) body.tags = tags;
  if (logo?.color !== undefined) body.color = logo.color.replace("#", "");
  if (logo?.cover !== undefined) body.cover = logo.cover;
  if (logo?.image !== undefined) body.logo = logo.image;
  return body;
};

/* --------------------------------- Calls --------------------------------- */

/** `FilterType.FilesOnly`. */
const FILTER_FILES_ONLY = 1;
/** Page size of the Files API; a larger `count` answers 400. */
const FILES_PAGE_SIZE = 100;
/** Files of a Knowledge room read at most; the listing reports `truncated` past it. */
const KNOWLEDGE_FILES_LIMIT = 1000;
/** Knowledge rooms read at a time. */
const READ_CONCURRENCY = 4;

/** A linked room as `GET files/rooms/{id}/sources` answers it. */
type TSourceDto = { id: number; title: string; logo?: Partial<TAiProjectLogo> | null };
type TSourcesDto = { instructionsRooms: TSourceDto[]; knowledgeRooms: TSourceDto[] };

const getSources = async (id: number) =>
  (await request({ method: "GET", url: `${roomsUrl}/${id}/sources` })) as TSourcesDto;

/** The project's model; `null` when it runs on the portal default. */
const getModel = async (id: number) =>
  ((await request({ method: "GET", url: modelUrl(id) })) as { profile: TAiProjectProfile | null })
    .profile;

/**
 * The project room with the `aiProject` block composed from its sources and
 * its model (`null`: the portal default); every room the server lists is
 * active and readable.
 */
const withSources = (
  room: TAiProjectRoomDto,
  sources: TSourcesDto,
  profile: TAiProjectProfile | null,
  warnings: TAiProjectWarning[] = [],
): TAiProjectRoomDto => {
  const toSource = (roomType: number) => (source: TSourceDto) => ({
    id: source.id,
    title: source.title,
    roomType,
    available: true,
    archived: false,
    logo: source.logo ?? null,
  });
  return {
    ...room,
    aiProject: {
      profile,
      instructionsRooms: sources.instructionsRooms.map(toSource(INSTRUCTIONS_ROOM_TYPE)),
      knowledgeRooms: sources.knowledgeRooms.map(toSource(KNOWLEDGE_ROOM_TYPE)),
      canEditSettings: !!room.security?.EditRoom,
      ...(warnings.length ? { warnings } : {}),
    },
  };
};

const errorMessage = (e: unknown) => {
  const response = (e as { response?: { data?: { error?: { message?: string } | string } } })
    ?.response?.data?.error;
  return (typeof response === "string" ? response : response?.message) || String((e as Error)?.message ?? e);
};

/**
 * Brings the project's sources to the lists asked for: rooms not linked yet
 * are linked, linked rooms left out of a sent list are unlinked, a list not
 * sent keeps its rooms. A refused call does not fail the save, as the
 * project itself is already written: it comes back as a warning.
 */
const syncSources = async (
  id: number,
  settings: TAiProjectSettingsRequest | undefined,
  current: TSourcesDto,
) => {
  const toAdd: number[] = [];
  const toRemove: number[] = [];
  const diff = (wanted: number[] | undefined, linked: TSourceDto[]) => {
    if (!wanted) return;
    const linkedIds = linked.map((room) => room.id);
    toAdd.push(...wanted.filter((roomId) => !linkedIds.includes(roomId)));
    toRemove.push(...linkedIds.filter((roomId) => !wanted.includes(roomId)));
  };
  diff(settings?.instructionsRoomIds, current.instructionsRooms);
  diff(settings?.knowledgeRoomIds, current.knowledgeRooms);

  const warnings: TAiProjectWarning[] = [];
  const attempt = async (method: "POST" | "DELETE", roomIds: number[]) => {
    if (!roomIds.length) return false;
    try {
      await request({ method, url: `${roomsUrl}/${id}/sources`, data: { roomIds } });
      return true;
    } catch (e) {
      warnings.push({
        code: "roomUnavailable",
        roomId: roomIds.length === 1 ? roomIds[0] : null,
        subjectId: null,
        message: errorMessage(e),
      });
      return false;
    }
  };
  const removed = (await attempt("DELETE", toRemove)) ? toRemove : [];
  const added = (await attempt("POST", toAdd)) ? toAdd : [];
  return { warnings, removed, added };
};

/**
 * The sources after a sync: the linked rooms without the unlinked ones, then
 * the newly linked ones as the form read them. Read back from the server
 * only when a newly linked room is not among those.
 */
const syncedSources = async (
  id: number,
  linked: TSourcesDto,
  removed: number[],
  added: number[],
  known: TAiProjectSource[] = [],
): Promise<TSourcesDto> => {
  if (!removed.length && !added.length) return linked;
  const byId = new Map(known.map((room) => [room.id, room]));
  if (added.some((roomId) => !byId.has(roomId))) return getSources(id);
  const next = (rooms: TSourceDto[], roomType: number) => [
    ...rooms.filter((room) => !removed.includes(room.id)),
    ...added
      .map((roomId) => byId.get(roomId)!)
      .filter((room) => room.roomType === roomType)
      .map(({ id: roomId, title, logo }) => ({ id: roomId, title, logo: logo ?? null })),
  ];
  return {
    instructionsRooms: next(linked.instructionsRooms, INSTRUCTIONS_ROOM_TYPE),
    knowledgeRooms: next(linked.knowledgeRooms, KNOWLEDGE_ROOM_TYPE),
  };
};

/**
 * Stores the model sent (`null`: the portal default) and answers the one the
 * project keeps; a refused write does not fail the save and comes back as a
 * warning. `undefined` keeps the model without a write.
 */
const saveModel = async (id: number, profileId: string | null | undefined) => {
  const warnings: TAiProjectWarning[] = [];
  try {
    if (profileId !== undefined) {
      const res = (await request({ method: "PUT", url: modelUrl(id), data: { profileId } })) as {
        profile: TAiProjectProfile | null;
      };
      return { profile: res.profile, warnings };
    }
  } catch (e) {
    warnings.push({ code: "modelNotSaved", roomId: null, subjectId: null, message: errorMessage(e) });
  }
  // The model kept: a project the model route cannot read runs on the default.
  return { profile: await getModel(id).catch(() => null), warnings };
};

export const getAiProjects = async (
  query: TAiProjectsQuery = {},
  signal?: AbortSignal,
) => {
  const res = await request({
    method: "GET",
    url: `${roomsUrl}${toParams({ ...query, searchArea: "AiHub", type: AI_PROJECT_ROOM_TYPE })}`,
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
  const res = await request({ method: "DELETE", url: `${roomsUrl}/${id}/logo` });
  return toAiProject(res as TAiProjectRoomDto);
};

export const getAiProject = async (id: number) => {
  const [room, sources, profile] = await Promise.all([
    request({ method: "GET", url: `${roomsUrl}/${id}` }),
    getSources(id),
    // A model that cannot be read leaves the project on the portal default.
    getModel(id).catch(() => null),
  ]);
  return toAiProject(withSources(room as TAiProjectRoomDto, sources, profile));
};

export const createAiProject = async (data: TAiProjectRequest) => {
  const room = (await request({
    method: "POST",
    url: roomsUrl,
    data: { ...toRoomFields(data), roomType: AI_PROJECT_ROOM_TYPE },
  })) as TAiProjectRoomDto;
  const none: TSourcesDto = { instructionsRooms: [], knowledgeRooms: [] };
  const { warnings, removed, added } = await syncSources(room.id, data.aiProject, none);
  const sources = await syncedSources(room.id, none, removed, added, data.aiProject?.rooms);
  // A new project runs on the default until a model is chosen.
  const model = data.aiProject?.profileId
    ? await saveModel(room.id, data.aiProject.profileId)
    : { profile: null, warnings: [] };
  return toAiProject(withSources(room, sources, model.profile, [...warnings, ...model.warnings]));
};

/** The room fields of an edit that differ from the opened project; an uploaded picture always goes. */
const changedRoomFields = (fields: Record<string, unknown>, current: TAiProject) => {
  const changed = { ...fields };
  if (changed.title === current.title) delete changed.title;
  const tags = changed.tags as string[] | undefined;
  if (tags && tags.length === current.tags.length && tags.every((tag) => current.tags.includes(tag)))
    delete changed.tags;
  const sameColor = changed.color === current.logo.color.replace("#", "");
  const sameCover = changed.cover === (current.logo.cover?.id ?? "");
  // A room takes its colour and cover together.
  if (sameColor && sameCover) {
    delete changed.color;
    delete changed.cover;
  }
  return changed;
};

/**
 * Saves the edit form. `current` is the project as the form opened it: its
 * linked rooms are the base of the sources diff and its model is not
 * written again when the form keeps it, so a save sends only what changed.
 * The sources are not read back: what was linked and unlinked is applied
 * to them (see `syncedSources`).
 */
export const updateAiProject = async (id: number, data: TAiProjectRequest, current?: TAiProject) => {
  const fields = current ? changedRoomFields(toRoomFields(data), current) : toRoomFields(data);
  const toSourceDto = ({ id: roomId, title, logo }: TAiProjectSource): TSourceDto => ({
    id: roomId,
    title,
    logo: logo ?? null,
  });
  const known: TSourcesDto | null = current
    ? {
        instructionsRooms: current.aiProject.instructionsRooms.map(toSourceDto),
        knowledgeRooms: current.aiProject.knowledgeRooms.map(toSourceDto),
      }
    : null;
  // With nothing of the room itself changed, it is neither written nor read:
  // the opened project stands for it.
  const keepRoom = !!current && !Object.keys(fields).length;
  const [room, linked] = await Promise.all([
    keepRoom
      ? null
      : request(
          Object.keys(fields).length
            ? { method: "PUT", url: `${roomsUrl}/${id}`, data: fields }
            : { method: "GET", url: `${roomsUrl}/${id}` },
        ),
    known ?? getSources(id),
  ]);
  const { warnings, removed, added } = await syncSources(id, data.aiProject, linked);
  const sources = await syncedSources(id, linked, removed, added, data.aiProject?.rooms);
  const profileId = data.aiProject?.profileId;
  const model =
    current && (profileId === undefined || profileId === (current.aiProject.profile?.id ?? null))
      ? { profile: current.aiProject.profile, warnings: [] as TAiProjectWarning[] }
      : await saveModel(id, profileId);
  const allWarnings = [...warnings, ...model.warnings];
  if (current && !room) {
    const { aiProject } = toAiProject(
      withSources({ id, security: current.security } as TAiProjectRoomDto, sources, model.profile, allWarnings),
    );
    return { ...current, aiProject };
  }
  return toAiProject(withSources(room as TAiProjectRoomDto, sources, model.profile, allWarnings));
};

/** Starts the delete; the answer is the file operation to follow. */
export const deleteAiProject = async (id: number) => {
  const res = await request({
    method: "DELETE",
    url: `${roomsUrl}/${id}`,
    data: { deleteAfter: false },
  });
  return res as TOperation;
};

export const getAiProjectSkills = async (id: number) => {
  const res = await request({ method: "GET", url: `${roomsUrl}/${id}/skills` });
  return (res as { rooms: TAiProjectSkillsRoom[] }).rooms.map((room) => ({
    ...room,
    logo: room.logo ? toLogo(room.logo) : null,
  }));
};

type TKnowledgeFileDto = {
  id: number;
  title: string;
  fileExst?: string;
  vectorizationStatus?: VectorizationStatus | null;
  security?: { Vectorization?: boolean };
};

// The files of a Knowledge room (`GET files/{roomId}`, files only), page by
// page up to the limit, with their vectorization state and the room's total.
const getKnowledgeFiles = async (roomId: number) => {
  const files: TAiProjectKnowledgeFile[] = [];
  let total = 0;
  for (let startIndex = 0; startIndex < KNOWLEDGE_FILES_LIMIT; startIndex += FILES_PAGE_SIZE) {
    const page = (await request({
      method: "GET",
      url: `/files/${roomId}${toParams({ filterType: FILTER_FILES_ONLY, count: FILES_PAGE_SIZE, startIndex })}`,
    })) as { files?: TKnowledgeFileDto[]; total?: number };
    const pageFiles = page.files ?? [];
    for (const file of pageFiles) {
      const status = file.vectorizationStatus ?? null;
      files.push({
        id: file.id,
        title: file.title,
        fileExst: file.fileExst ?? file.title.slice(file.title.lastIndexOf(".")),
        indexed: status === VectorizationStatus.Completed,
        vectorizationStatus: status,
        security: { Vectorization: !!file.security?.Vectorization },
      });
    }
    total = page.total ?? startIndex + pageFiles.length;
    if (startIndex + FILES_PAGE_SIZE >= total || pageFiles.length === 0) break;
  }
  return { files, total };
};

/**
 * The linked Knowledge rooms with their files (at most 1000 a room,
 * `truncated` past it), their vectorization state and counters. A room that
 * cannot be read comes back with `available: false` and no files.
 */
export const getAiProjectKnowledge = async (id: number) => {
  const { knowledgeRooms } = await getSources(id);
  const rooms: TAiProjectKnowledgeRoom[] = new Array(knowledgeRooms.length);
  let next = 0;
  const worker = async () => {
    while (next < knowledgeRooms.length) {
      const index = next;
      next += 1;
      const room = knowledgeRooms[index];
      const base = { id: room.id, title: room.title, logo: room.logo ? toLogo(room.logo) : null };
      try {
        const { files, total } = await getKnowledgeFiles(room.id);
        rooms[index] = {
          ...base,
          available: true,
          totalFiles: total,
          indexedFiles: files.filter((file) => file.indexed).length,
          failedFiles: files.filter(
            (file) => file.vectorizationStatus === VectorizationStatus.Failed,
          ).length,
          truncated: total > files.length,
          files,
        };
      } catch {
        rooms[index] = {
          ...base,
          available: false,
          totalFiles: 0,
          indexedFiles: 0,
          failedFiles: 0,
          truncated: false,
          files: [],
        };
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(READ_CONCURRENCY, knowledgeRooms.length) }, worker),
  );
  return rooms;
};
