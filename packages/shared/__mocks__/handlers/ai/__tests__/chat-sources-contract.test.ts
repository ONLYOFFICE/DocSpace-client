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

// CONTRACT TESTS: the skills of the chat's skill sets (ASC.AI.Chat's
// context/get-room-skills and the Files API's rooms/{id}/ai), the
// attachment record of a generated image saved as a portal file, and the
// copy of a file into a room. See privacyroom/__tests__/contract.test.ts for
// the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import {
  aiChatDraftSourcesStorage,
  aiChatRoomSkillsHandlers,
  type AiChatRoomSkillsLog,
} from "../chatSources";
import {
  aiChatAttachmentsGetHandler,
  aiChatFileAttachmentPart,
  aiChatImageAttachmentPart,
} from "../chatThreads";
import { aiCopyToRoomHandlers, type AiCopyRequest } from "../saveToRoom";

const PORT = "3304";

const api = (path: string, init?: RequestInit) =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/${path}`, init);

const SKILLS = {
  "778101": [
    { id: "s1", name: "document-summary", description: "Condenses a document." },
  ],
  "778103": [],
};

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("aiChatRoomSkillsHandlers (mirrors ASC.AI.Chat's room skills)", () => {
  it("answers a room's skills raw, an empty list for an unknown room and 400 without a room", async () => {
    const log: AiChatRoomSkillsLog = [];
    server.use(...aiChatRoomSkillsHandlers(PORT, SKILLS, log));

    const skills = await (
      await api("ai/context/get-room-skills?cloud=docspace&roomId=778101")
    ).json();
    expect(skills).toEqual(SKILLS["778101"]);

    const unknown = await (
      await api("ai/context/get-room-skills?cloud=docspace&roomId=1")
    ).json();
    expect(unknown).toEqual([]);

    expect(
      (await api("ai/context/get-room-skills?cloud=docspace")).status,
    ).toBe(400);
    expect(log).toEqual([
      { roomId: "778101", cloud: "docspace" },
      { roomId: "1", cloud: "docspace" },
    ]);
  });

  it("serves the skills folder of a listed room with a Markdown file, an empty set included", async () => {
    server.use(...aiChatRoomSkillsHandlers(PORT, SKILLS));

    for (const roomId of ["778101", "778103"]) {
      const { response } = (await (
        await api(`files/rooms/${roomId}/ai?filterType=1`)
      ).json()) as {
        response: {
          current: { id: number };
          pathParts: { id: number }[];
          files: { fileExst: string }[];
        };
      };
      expect(response.current.id).toBe(Number(roomId));
      expect(response.pathParts.map((part) => part.id)).toEqual([
        777500,
        Number(roomId),
      ]);
      expect(response.files.length).toBeGreaterThan(0);
      expect(response.files.every((file) => file.fileExst === ".md")).toBe(
        true,
      );
    }
  });
});

describe("aiChatDraftSourcesStorage", () => {
  it("writes the draft's sources under the user's key and the unscoped one", () => {
    const entries = aiChatDraftSourcesStorage("user-1", {
      skillSets: [{ id: 778101, name: "Document assistant" }],
      dataSources: [{ id: 5101, name: "Design for Marketing", kind: "room" }],
    });
    expect(Object.keys(entries)).toEqual([
      "docspace.ai-agent.ai-chat.thread-sources.user-1:draft",
      "docspace.ai-agent.ai-chat.thread-sources:draft",
    ]);
    expect(
      JSON.parse(entries["docspace.ai-agent.ai-chat.thread-sources:draft"]),
    ).toEqual({
      v: 1,
      skillSets: [
        { cloud: "docspace", room: { id: "778101", name: "Document assistant" } },
      ],
      knowledgeBases: [],
      dataSources: [
        {
          cloud: "docspace",
          room: { id: "5101", name: "Design for Marketing", kind: "room" },
        },
      ],
    });
  });
});

describe("attachments of a message", () => {
  it("answers a portal file's record with the entryId/title path", async () => {
    server.use(
      aiChatAttachmentsGetHandler(PORT, {
        ref1: { title: "Revenue chart.png", base64: "data:,", entryId: 42 },
        ref2: { title: "Notes.jpg", base64: "data:," },
      }),
    );
    const read = async (id: string) =>
      (await (
        await api("ai/attachments/get", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(id),
        })
      ).json()) as Record<string, unknown> | null;

    expect(await read("ref1")).toMatchObject({
      id: "ref1",
      title: "Revenue chart.png",
      path: "42/Revenue chart.png",
    });
    expect(await read("ref2")).not.toHaveProperty("path");
  });

  it("builds the ref blocks the library stores in a sent message", () => {
    const image = aiChatImageAttachmentPart({ ref: "r1", title: "Notes.jpg" });
    expect(image.type).toBe("image");
    expect(JSON.parse(image.image)).toEqual({
      ref: "r1",
      title: "Notes.jpg",
      kind: "image",
    });

    const file = aiChatFileAttachmentPart({
      ref: "r2",
      title: "Agreement.docx",
      entryId: 7,
      type: 65,
    });
    expect(file).toMatchObject({ type: "file", data: "" });
    expect(JSON.parse(file.mimeType)).toEqual({
      ref: "r2",
      title: "Agreement.docx",
      kind: "file",
      path: "7/Agreement.docx",
      type: 65,
    });
  });
});

describe("aiCopyToRoomHandlers (mirrors the Files API's copy)", () => {
  const ROOMS = [
    { id: 5101, title: "Design for Marketing", canCreate: true },
    { id: 5102, title: "Board minutes", canCreate: false },
  ];

  it("lists the rooms and opens one with the caller's right to add files", async () => {
    server.use(...aiCopyToRoomHandlers(PORT, ROOMS));

    const list = (await (await api("files/rooms?count=100")).json()) as {
      response: { folders: { id: number; title: string }[] };
    };
    expect(list.response.folders.map((room) => room.title)).toEqual([
      "Design for Marketing",
      "Board minutes",
    ]);

    const open = async (id: number) =>
      (
        (await (await api(`files/${id}`)).json()) as {
          response: { current: { security: { Create: boolean } } };
        }
      ).response.current.security.Create;
    expect(await open(5101)).toBe(true);
    expect(await open(5102)).toBe(false);
  });

  it("copies a file and answers a finished operation", async () => {
    const copies: AiCopyRequest[] = [];
    server.use(...aiCopyToRoomHandlers(PORT, ROOMS, copies));

    const body = {
      fileIds: [42],
      folderIds: [],
      destFolderId: 5101,
      conflictResolveType: 2,
      deleteAfter: false,
    };
    const started = (await (
      await api("files/fileops/copy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ).json()) as { response: { id: string; finished: boolean }[] };
    expect(started.response[0].finished).toBe(true);
    expect(copies).toEqual([body]);

    const statuses = (await (await api("files/fileops")).json()) as {
      response: { id: string }[];
    };
    expect(statuses.response.map((op) => op.id)).toEqual([
      started.response[0].id,
    ]);
  });
});
