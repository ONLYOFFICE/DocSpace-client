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

import type { InternalAxiosRequestConfig } from "axios";

import { interceptRoute } from "../client";
import {
  changeAiProjectOwner,
  deleteAiProject,
  getAiProject,
  getAiProjectLinks,
  getAiProjectMembers,
  leaveAiProject,
  pinAiProject,
  setAiProjectLink,
  setAiProjectMembers,
  updateAiProject,
} from "./projects";
import type { TAiProject, TAiProjectInvitation, TAiProjectRequest } from "./projects";

/**
 * Ids the mock service hands out start here, so a request for one of them
 * can be told apart from a request for a real room of the portal.
 */
export const AI_PROJECT_MOCK_ID_BASE = 900000;

export const isAiProjectId = (id: number | string | undefined) =>
  Number(id) >= AI_PROJECT_MOCK_ID_BASE;

/**
 * A project as the room components read it (`TRoom`): the mock already
 * answers in the Files API's folder shape, this adds the flags the client
 * derives from the entry kind.
 */
export const aiProjectToRoom = (project: TAiProject) => ({
  ...project,
  // A room's logo colour comes without the "#" the project keeps: the
  // room icons prepend their own.
  logo: { ...project.logo, color: project.logo.color.replace("#", "") },
  isRoom: true,
  isFolder: true,
  isAIProject: true,
  tags: [],
  mute: false,
  private: false,
  shared: false,
  canShare: project.security.EditAccess,
  fileEntryType: 1,
  filesCount: 0,
  foldersCount: 0,
});

type TBody = Record<string, unknown>;

const parseBody = (config: InternalAxiosRequestConfig): TBody => {
  const { data } = config;
  if (typeof data === "string") {
    try {
      return JSON.parse(data) as TBody;
    } catch {
      return {};
    }
  }
  return typeof data === "object" && data !== null ? (data as TBody) : {};
};

const parseUrl = (config: InternalAxiosRequestConfig) => {
  const raw = config.url ?? "";
  const [path, search = ""] = raw.split("?");
  return { path: path ?? "", query: new URLSearchParams(search) };
};

const ROOM_PATH = /^\/?files\/(?:rooms|folder)\/(\d+)(?:\/(.*))?$/;
const FOLDER_CONTENT_PATH = /^\/?files\/(\d+)$/;
const OWNER_PATH = /^\/?files\/owner$/;

const envelope = (response: unknown, extra: TBody = {}) => ({
  response,
  ...extra,
  status: 0,
  statusCode: 200,
});

/**
 * Serves the Files API routes the room dialogs and panels call for a
 * project (invite panel, members in the info panel, leave, change owner,
 * pin, rename) from the AI projects service, so those components work
 * unchanged while projects are mock-backed. Active while the projects page
 * is mounted; a request for a real room is left alone.
 */
export const interceptAiProjectRoutes = (currentUserId: string) => {
  const match = (config: InternalAxiosRequestConfig) => {
    const { path } = parseUrl(config);
    const room = path.match(ROOM_PATH);
    if (room) return isAiProjectId(room[1]);
    const content = path.match(FOLDER_CONTENT_PATH);
    if (content) return isAiProjectId(content[1]);
    if (OWNER_PATH.test(path)) {
      const ids = parseBody(config).folderIds;
      return Array.isArray(ids) && ids.length > 0 && isAiProjectId(ids[0] as number);
    }
    return false;
  };

  const fulfill = async (config: InternalAxiosRequestConfig) => {
    const { path, query } = parseUrl(config);
    const method = (config.method ?? "get").toLowerCase();
    const body = parseBody(config);

    if (OWNER_PATH.test(path)) {
      const id = Number((body.folderIds as number[])[0]);
      const project = await changeAiProjectOwner(id, String(body.userId), true);
      return envelope([aiProjectToRoom(project)]);
    }

    const content = path.match(FOLDER_CONTENT_PATH);
    if (content) {
      const project = await getAiProject(Number(content[1]));
      const current = aiProjectToRoom(project);
      return envelope({
        files: [],
        folders: [],
        current,
        pathParts: [{ id: project.id, title: project.title }],
        startIndex: 0,
        count: 0,
        total: 0,
        new: 0,
      });
    }

    const room = path.match(ROOM_PATH);
    if (!room) return envelope(null);
    const id = Number(room[1]);
    const sub = room[2] ?? "";

    if (sub === "" && method === "get") {
      return envelope(aiProjectToRoom(await getAiProject(id)));
    }
    if (sub === "" && method === "put") {
      const title = typeof body.title === "string" ? body.title : undefined;
      const logo =
        typeof body.logo === "object" && body.logo ? (body.logo as TAiProjectRequest["logo"]) : undefined;
      return envelope(aiProjectToRoom(await updateAiProject(id, { title, logo })));
    }
    if (sub === "" && method === "delete") {
      await deleteAiProject(id);
      return envelope([]);
    }
    if (sub === "pin" || sub === "unpin") {
      return envelope(aiProjectToRoom(await pinAiProject(id, sub === "pin")));
    }
    if (sub === "path") {
      const project = await getAiProject(id);
      return envelope([{ id: project.id, title: project.title }]);
    }
    if (sub.startsWith("share") && method === "get") {
      // filterType 1 lists the invitation links, anything else the members.
      if (query.get("filterType") === "1") {
        const links = await getAiProjectLinks(id);
        return envelope(links, { total: links.length, count: links.length });
      }
      const needle = (query.get("filterValue") ?? "").toLowerCase();
      const members = (await getAiProjectMembers(id))
        .filter((m) => !needle || m.sharedTo.displayName.toLowerCase().includes(needle))
        .map((m) => ({ ...m, sharedTo: { ...m.sharedTo, avatar: m.sharedTo.avatarSmall } }));
      return envelope(members, { total: members.length, count: members.length });
    }
    if (sub.startsWith("share") && method === "put") {
      const invitations = (Array.isArray(body.invitations) ? body.invitations : []) as TAiProjectInvitation[];
      const self = invitations.length === 1 ? invitations[0] : undefined;
      if (self && self.id === currentUserId && self.access === 0) {
        await leaveAiProject(id);
        return envelope({ members: [], warning: null });
      }
      const result = await setAiProjectMembers(
        id,
        invitations,
        body.notify === true,
        typeof body.message === "string" ? body.message : "",
      );
      return envelope(result);
    }
    if (sub === "links" || sub === "link") {
      if (method === "put") {
        // The invite panel sends `access: 0` to switch the link off.
        const enabled = body.access !== 0;
        const title = typeof body.title === "string" ? body.title : undefined;
        return envelope(await setAiProjectLink(id, enabled, title));
      }
      const links = await getAiProjectLinks(id);
      return envelope(sub === "link" ? (links[0] ?? null) : links, { total: links.length });
    }
    if (sub.startsWith("log") || sub === "tags" || sub === "logo") {
      // History is not kept for a project; tags and logos are not its
      // feature. Answer what a no-op would, so the panels stay quiet.
      if (sub.startsWith("log")) return envelope([], { total: 0, count: 0 });
      return envelope(aiProjectToRoom(await getAiProject(id)));
    }
    return envelope(null);
  };

  return interceptRoute({ match, fulfill });
};
