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

import { http, HttpResponse } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

/** The "AI rooms" root the Instructions rooms sit under (`projects.ts`). */
const AI_HUB_ROOT_ID = 777500;

/**
 * The skills behind the composer's Skill sets, for the chat's lists ("+" >
 * Skill sets and the slash menu).
 *
 * A skill set is an Instructions room. Two reads reach it:
 *
 * - `GET ai/context/get-room-skills?cloud&roomId` - ASC.AI.Chat's skills of
 *   one connected room (`contextController.getRoomSkills`), read by the chat
 *   library's clouds store when the room is connected; a raw array of
 *   `{ id, name, description }`, 400 without a `roomId`, and an empty list
 *   for a room the Files API does not list as an Instructions room;
 * - `GET files/rooms/:id/ai?filterType=1` - the Files API's skills folder of
 *   the room (its own root), which ui-kit reads to tell whether a connected
 *   room still holds a skill (`AiApi.getRoomSkillsFolder`): a room it finds
 *   none in is disconnected from the chat.
 *
 * A skill's `name` is what the draft calls ("/contract-review"); the lists
 * show it as "Contract review".
 */

/** A skill of an Instructions room as ASC.AI.Chat answers it (`RoomSkill`). */
export type AiChatRoomSkillMock = {
  id: string;
  name: string;
  description: string;
};

/** The skill reads the handlers answered, for a spec to assert on. */
export type AiChatRoomSkillsLog = { roomId: string; cloud?: string }[];

/**
 * The skills of the given Instructions rooms, by room id.
 *
 * A room listed with no skills is still a skill set: its folder holds a
 * Markdown file (a README the AI service does not read as a skill), so the
 * chat keeps it connected and lists it as an empty group. Rooms not listed
 * are left to the other handlers.
 */
export const aiChatRoomSkillsHandlers = (
  port: string,
  skillsByRoom: Record<string, AiChatRoomSkillMock[]>,
  log?: AiChatRoomSkillsLog,
) => {
  const base = `${BASE_URL}:${port}/${API_PREFIX}`;
  const known = (id: unknown) => Array.isArray(skillsByRoom[String(id)]);

  return [
    http.get(`${base}/ai/context/get-room-skills`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      const roomId = params.get("roomId");
      if (!roomId) {
        return HttpResponse.json({ error: "roomId required" }, { status: 400 });
      }
      log?.push({ roomId, cloud: params.get("cloud") ?? undefined });
      return HttpResponse.json(known(roomId) ? skillsByRoom[roomId] : []);
    }),

    http.get(`${base}/files/rooms/:id/ai`, ({ params }) => {
      if (!known(params.id)) return undefined;
      const id = Number(params.id);
      const skills = skillsByRoom[String(params.id)];
      const files = (
        skills.length > 0
          ? skills.map((skill) => `${skill.name}.md`)
          : ["README.md"]
      ).map((title, index) => ({
        id: id * 100 + index + 1,
        title,
        fileExst: ".md",
        folderId: id,
      }));
      return HttpResponse.json({
        response: {
          files,
          folders: [],
          current: { id, title: String(id), parentId: AI_HUB_ROOT_ID },
          pathParts: [
            { id: AI_HUB_ROOT_ID, title: "AI rooms" },
            { id, title: String(id) },
          ],
          startIndex: 0,
          count: files.length,
          total: files.length,
        },
      });
    }),
  ];
};

/**
 * A source the composer keeps for a conversation, as the chat library stores
 * it (`ThreadSources` in `thread-sources.ts`): the portal's cloud
 * ("docspace") and the room or folder.
 */
export type AiChatThreadSourceMock = {
  id: number | string;
  name: string;
  /** For a data source: "room" draws the room icon, else a folder. */
  kind?: "room" | "folder";
};

/**
 * The record of the sources a new chat starts with, under the key ui-kit's
 * settings adapter keeps it in `localStorage`
 * (`docspace.ai-agent.` + `ai-chat.thread-sources.<userId>:draft`). The
 * library reads it when its stores are built, so a spec writes it before the
 * page loads (`page.addInitScript`) to open a chat with sources connected.
 * Returns the entries to write: the key scoped to the user, and the
 * unscoped one the stores use while the user is still being read.
 */
export const aiChatDraftSourcesStorage = (
  userId: string,
  {
    skillSets = [],
    knowledgeBases = [],
    dataSources = [],
  }: {
    skillSets?: AiChatThreadSourceMock[];
    knowledgeBases?: AiChatThreadSourceMock[];
    dataSources?: AiChatThreadSourceMock[];
  },
): Record<string, string> => {
  const list = (sources: AiChatThreadSourceMock[]) =>
    sources.map(({ id, name, kind }) => ({
      cloud: "docspace",
      room: { id: String(id), name, ...(kind ? { kind } : {}) },
    }));
  const record = JSON.stringify({
    v: 1,
    skillSets: list(skillSets),
    knowledgeBases: list(knowledgeBases),
    dataSources: list(dataSources),
  });
  const prefix = "docspace.ai-agent.ai-chat.thread-sources";
  return {
    [`${prefix}.${userId}:draft`]: record,
    [`${prefix}:draft`]: record,
  };
};
