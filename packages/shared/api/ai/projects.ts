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

import { request } from "../client";
import { getRoomCovers } from "../rooms";

/**
 * AI Projects: a project is a room of type 12 that binds a model,
 * Instructions rooms and Knowledge rooms and shares them with a team.
 * Served by ASC.AI.Chat under `/api/2.0/ai/projects` (mock-backed for now,
 * the same shapes the Files API will answer with).
 */

const baseUrl = "/ai/projects";

/** `FileShare` on the server, limited to what a project uses. */
export const AiProjectAccess = {
  None: 0,
  Owner: 1,
  Viewer: 2,
  ProjectManager: 9,
  Member: 11,
} as const;
export type TAiProjectAccess =
  (typeof AiProjectAccess)[keyof typeof AiProjectAccess];

export const INSTRUCTIONS_ROOM_TYPE = RoomsType.InstructionsRoom;
export const KNOWLEDGE_ROOM_TYPE = RoomsType.KnowledgeRoom;
export const AI_PROJECT_ROOM_TYPE = RoomsType.AiProjectRoom;

export type TAiProjectUser = {
  id: string;
  displayName: string;
  email: string;
  avatarSmall: string;
  hasAvatar: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isRoomAdmin: boolean;
  isCollaborator: boolean;
  isVisitor: boolean;
  /** 1 active, 2 pending. */
  status: number;
  avatarColor: string;
};

export type TAiProjectPickableUser = TAiProjectUser & {
  employeeType: number;
  canOwnProject: boolean;
};

export type TAiProjectProfile = {
  id: string;
  name: string | null;
  provider: string | null;
  available: boolean;
};

export type TAiProjectSource = {
  id: number;
  title: string;
  roomType: number;
  logo?: TAiProjectLogo;
  skillsCount?: number;
  indexedFiles?: number;
  totalFiles?: number;
};

export type TAiProjectLinkableRoom = TAiProjectSource & {
  createdBy: TAiProjectUser | null;
};

/** A room logo: its colour and the built-in cover drawn in it, or uploaded sizes. */
export type TAiProjectLogo = {
  color: string;
  /** The built-in cover drawn in `color`, as the rooms carry it; absent for initials. */
  cover?: TAiProjectCover | null;
  small?: string;
  medium?: string;
  large?: string;
};

/** A built-in room cover: its id and the SVG it is drawn from. */
export type TAiProjectCover = { id: string; data: string };

export type TAiProjectSettings = {
  profile: TAiProjectProfile | null;
  instructionsRooms: TAiProjectSource[];
  knowledgeRooms: TAiProjectSource[];
  canEditSettings: boolean;
};

export type TAiProjectSecurity = {
  Read: boolean;
  Rename: boolean;
  EditRoom: boolean;
  EditAccess: boolean;
  ChangeOwner: boolean;
  Delete: boolean;
  Pin: boolean;
  Leave: boolean;
};

export type TAiProject = {
  id: number;
  title: string;
  roomType: number;
  created: string;
  updated: string;
  createdBy: TAiProjectUser | null;
  pinned: boolean;
  inRoom: boolean;
  access: TAiProjectAccess;
  logo: TAiProjectLogo;
  security: TAiProjectSecurity;
  aiProject: TAiProjectSettings;
};

export type TAiProjectsPage = {
  folders: TAiProject[];
  startIndex: number;
  count: number;
  total: number;
};

export type TAiProjectInviteLink = {
  id: string;
  title: string;
  shareLink: string;
  requestToken: string;
};

export type TAiProjectMember = {
  access: TAiProjectAccess;
  sharedTo: TAiProjectUser;
  isOwner: boolean;
  canEditAccess: boolean;
  subjectType: number;
};

export type TAiProjectLink = Omit<TAiProjectMember, "sharedTo"> & {
  sharedTo: TAiProjectInviteLink;
};

export type TAiProjectSettingsRequest = {
  profileId?: string | null;
  instructionsRoomIds?: number[];
  knowledgeRoomIds?: number[];
};

export type TAiProjectRequest = {
  title?: string;
  /** As for a room: `color` (#rrggbb) and the id of a built-in cover, "" for the initials. */
  logo?: { color?: string; cover?: string };
  aiProject?: TAiProjectSettingsRequest;
};

export type TAiProjectInvitation = {
  id?: string;
  email?: string;
  access: TAiProjectAccess;
};

export type TAiProjectSkill = {
  id: number;
  title: string;
  name: string;
  description: string;
};

export type TAiProjectSkillsRoom = {
  id: number;
  title: string;
  logo?: TAiProjectLogo;
  skills: TAiProjectSkill[];
};

export type TAiProjectKnowledgeFile = {
  id: number;
  title: string;
  fileExst: string;
  indexed: boolean;
};

export type TAiProjectKnowledgeRoom = {
  id: number;
  title: string;
  logo?: TAiProjectLogo;
  totalFiles: number;
  indexedFiles: number;
  files: TAiProjectKnowledgeFile[];
};

export type TAiProjectsQuery = {
  filterValue?: string;
  sortBy?: "DateAndTime" | "AZ" | "DateAndTimeCreation";
  sortOrder?: "ascending" | "descending";
  /** Keeps the projects the caller holds this role in; `0` or omitted: any. */
  role?: TAiProjectAccess;
  hasInstructions?: boolean;
  hasKnowledge?: boolean;
  startIndex?: number;
  count?: number;
};

const toParams = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const s = params.toString();
  return s ? `?${s}` : "";
};

// A list the service sends with `total` reaches us as `{ items, total }`
// (the HTTP client unwraps it so); one without it as the bare array.
const listOf = <T>(res: unknown): T[] =>
  Array.isArray(res) ? (res as T[]) : ((res as { items?: T[] } | undefined)?.items ?? []);

// The mock service keeps only the id of a project's cover. The SVG comes
// from the same list a room's cover is drawn from (`GET files/rooms/covers`),
// fetched once and kept for the session.
let coversPromise: Promise<Map<string, string>> | null = null;

const getCoverData = () => {
  coversPromise ??= (getRoomCovers() as Promise<TAiProjectCover[]>)
    .then((covers) => new Map(covers.map((cover) => [cover.id, cover.data])))
    .catch((e) => {
      coversPromise = null;
      throw e;
    });
  return coversPromise;
};

/** The logo with its cover SVG filled in, when it has a cover without one. */
const withLogoCover = async <T extends { logo?: TAiProjectLogo }>(item: T): Promise<T> => {
  const cover = item.logo?.cover;
  if (!item.logo || !cover || cover.data) return item;
  const data = (await getCoverData()).get(cover.id);
  if (!data) return item;
  return { ...item, logo: { ...item.logo, cover: { id: cover.id, data } } };
};

/** The project and its linked rooms with their cover SVGs filled in. */
const withCover = async (project: TAiProject): Promise<TAiProject> => {
  const [filled, instructionsRooms, knowledgeRooms] = await Promise.all([
    withLogoCover(project),
    Promise.all(project.aiProject.instructionsRooms.map(withLogoCover)),
    Promise.all(project.aiProject.knowledgeRooms.map(withLogoCover)),
  ]);
  return { ...filled, aiProject: { ...filled.aiProject, instructionsRooms, knowledgeRooms } };
};

export const getAiProjects = async (
  query: TAiProjectsQuery = {},
  signal?: AbortSignal,
) => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}${toParams(query)}`,
    signal,
  });
  const page = res as TAiProjectsPage;
  return { ...page, folders: await Promise.all(page.folders.map(withCover)) };
};

export const getAiProject = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}` });
  return withCover(res as TAiProject);
};

export const createAiProject = async (data: TAiProjectRequest) => {
  const res = await request({ method: "POST", url: baseUrl, data });
  return withCover(res as TAiProject);
};

export const updateAiProject = async (id: number, data: TAiProjectRequest) => {
  const res = await request({ method: "PUT", url: `${baseUrl}/${id}`, data });
  return withCover(res as TAiProject);
};

export const deleteAiProject = async (id: number) => {
  await request({ method: "DELETE", url: `${baseUrl}/${id}` });
};

export const pinAiProject = async (id: number, pinned: boolean) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/${id}/${pinned ? "pin" : "unpin"}`,
  });
  return withCover(res as TAiProject);
};

export const getAiProjectMembers = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}/share` });
  return listOf<TAiProjectMember>(res);
};

export const setAiProjectMembers = async (
  id: number,
  invitations: TAiProjectInvitation[],
  notify = false,
  message = "",
) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/${id}/share`,
    data: { invitations, notify, message },
  });
  return res as { members: TAiProjectMember[]; warning: string | null };
};

export const leaveAiProject = async (id: number) => {
  await request({ method: "PUT", url: `${baseUrl}/${id}/leave` });
};

export const changeAiProjectOwner = async (
  id: number,
  userId: string,
  keepAsManager: boolean,
) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/${id}/owner`,
    data: { userId, keepAsManager },
  });
  return withCover(res as TAiProject);
};

export const getAiProjectLinks = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}/links` });
  return res as TAiProjectLink[];
};

export const setAiProjectLink = async (
  id: number,
  enabled: boolean,
  title?: string,
) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/${id}/links`,
    data: { enabled, title },
  });
  return res as TAiProjectLink | null;
};

export const getAiProjectSkills = async (id: number) => {
  const res = await request({ method: "GET", url: `${baseUrl}/${id}/skills` });
  return Promise.all((res as { rooms: TAiProjectSkillsRoom[] }).rooms.map(withLogoCover));
};

export const getAiProjectKnowledge = async (id: number) => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}/${id}/knowledge`,
  });
  return Promise.all((res as { rooms: TAiProjectKnowledgeRoom[] }).rooms.map(withLogoCover));
};

export const getAiProjectLinkableRooms = async (
  type: typeof INSTRUCTIONS_ROOM_TYPE | typeof KNOWLEDGE_ROOM_TYPE,
  filterValue = "",
) => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}/rooms${toParams({ type, filterValue })}`,
  });
  return res as TAiProjectLinkableRoom[];
};

export const getAiProjectUsers = async (filterValue = "") => {
  const res = await request({
    method: "GET",
    url: `${baseUrl}/users${toParams({ filterValue })}`,
  });
  return listOf<TAiProjectPickableUser>(res);
};

export const getAiProjectProfiles = async () => {
  const res = await request({ method: "GET", url: `${baseUrl}/profiles` });
  return listOf<TAiProjectProfile>(res);
};
