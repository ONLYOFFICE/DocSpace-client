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

// CONTRACT TESTS: the files of a knowledge base as the Files service answers
// `GET files/{roomId}` for a Knowledge room: a folder content with the files
// and their `vectorizationStatus`, paged by `startIndex` and `count`, with
// `total` counting them all. See privacyroom/__tests__/contract.test.ts for
// the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import {
  KNOWLEDGE_BASES,
  KNOWLEDGE_BASE_FAILED_ID,
  KNOWLEDGE_FAILED_FILE_TITLE,
  KnowledgeFileMockStatus,
  knowledgeBaseFilesMock,
  knowledgeBaseFolderHandler,
} from "../knowledgeBases";

const PORT = "3303";

type FolderContent = {
  response: {
    files: {
      id: number;
      title: string;
      vectorizationStatus: number;
      security: { Vectorization: boolean };
    }[];
    folders: unknown[];
    current: { id: number; roomType: number; filesCount: number };
    total: number;
    count: number;
  };
};

const read = async (roomId: number, query = "") => {
  const res = await fetch(
    `${BASE_URL}:${PORT}/${API_PREFIX}/files/${roomId}${query}`,
  );
  return { status: res.status, body: (await res.json()) as FolderContent };
};

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("knowledgeBaseFolderHandler (mirrors GET files/{roomId} for a Knowledge room)", () => {
  it("lists the files of a base with their indexing state and the room as current", async () => {
    server.use(knowledgeBaseFolderHandler(PORT));

    const { status, body } = await read(KNOWLEDGE_BASE_FAILED_ID, "?filterType=1&count=100");
    expect(status).toBe(200);
    expect(body.response.total).toBe(48);
    expect(body.response.files).toHaveLength(48);
    expect(body.response.folders).toEqual([]);
    expect(body.response.current).toMatchObject({
      id: KNOWLEDGE_BASE_FAILED_ID,
      roomType: 11,
      filesCount: 48,
    });

    const failed = body.response.files.filter(
      (file) => file.vectorizationStatus === KnowledgeFileMockStatus.Failed,
    );
    expect(failed.map((file) => file.title)).toEqual([KNOWLEDGE_FAILED_FILE_TITLE]);
    // Only a failed file may be indexed again.
    expect(failed[0].security.Vectorization).toBe(true);
    expect(
      body.response.files.filter(
        (file) => file.vectorizationStatus === KnowledgeFileMockStatus.InProgress,
      ),
    ).toHaveLength(2);
  });

  it("pages the files by startIndex and count, total counting them all", async () => {
    server.use(knowledgeBaseFolderHandler(PORT));

    const { body } = await read(KNOWLEDGE_BASE_FAILED_ID, "?filterType=1&startIndex=40&count=10");
    expect(body.response.total).toBe(48);
    expect(body.response.count).toBe(8);
    expect(body.response.files).toHaveLength(8);
  });

  it("answers what the spec's own copy of the files says", async () => {
    const files = knowledgeBaseFilesMock();
    server.use(knowledgeBaseFolderHandler(PORT, KNOWLEDGE_BASES, files));
    files[KNOWLEDGE_BASE_FAILED_ID].forEach((file) => {
      file.vectorizationStatus = KnowledgeFileMockStatus.Completed;
    });

    const { body } = await read(KNOWLEDGE_BASE_FAILED_ID);
    expect(
      body.response.files.every(
        (file) => file.vectorizationStatus === KnowledgeFileMockStatus.Completed,
      ),
    ).toBe(true);
    // The stock copy is untouched.
    expect(
      knowledgeBaseFilesMock()[KNOWLEDGE_BASE_FAILED_ID][0].vectorizationStatus,
    ).toBe(KnowledgeFileMockStatus.Failed);
  });
});
