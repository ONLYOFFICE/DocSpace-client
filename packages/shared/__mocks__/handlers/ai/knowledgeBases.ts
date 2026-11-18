// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode


import { http, HttpResponse } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import {
  AI_HUB_ROOMS,
  AI_HUB_ROOT_ID,
  AI_PROJECTS,
  aiSectionsHandlers,
} from "./projects";
import type { AiHubRoomMock, AiProjectMock } from "./projects";

/**
 * The Knowledge bases list (Knowledge rooms, `RoomsType.KnowledgeRoom`) with
 * a base in each indexing state, and the files of each base as
 * `GET files/{roomId}` lists them, with their `vectorizationStatus`
 * (0 in progress, 1 completed, 2 failed).
 */

const AI_HUB_FOLDER_TYPE = 41;
const KNOWLEDGE_ROOM_TYPE = 11;
const KNOWLEDGE_FOLDER_TYPE = 39;

/** `VectorizationStatus`. */
export const KnowledgeFileMockStatus = {
  InProgress: 0,
  Completed: 1,
  Failed: 2,
} as const;

type KnowledgeFileMockStatusValue =
  (typeof KnowledgeFileMockStatus)[keyof typeof KnowledgeFileMockStatus];

type KnowledgeFileSeed = {
  title: string;
  status: KnowledgeFileMockStatusValue;
};

/** A stock Knowledge room of the "AI rooms" list: what every base is drawn from. */
const knowledgeRoomTemplate = (): AiHubRoomMock => {
  const room = AI_HUB_ROOMS.find((r) => r.roomType === KNOWLEDGE_ROOM_TYPE);
  if (!room) throw new Error("AI_HUB_ROOMS lists no Knowledge room");
  return room;
};

const roomLogo = (color: string) => ({
  original: "",
  large: "",
  medium: "",
  small: "",
  color,
  cover: null,
});

const knowledgeBase = (
  id: number,
  title: string,
  color: string,
  updated: string,
  filesCount: number,
): AiHubRoomMock => ({
  ...knowledgeRoomTemplate(),
  id,
  title,
  logo: roomLogo(color),
  created: "2026-10-01T10:00:00.0000000+00:00",
  updated,
  filesCount,
});

/** One file failed and two are still being indexed: the base carries "Error". */
export const KNOWLEDGE_BASE_FAILED_ID = 779201;
/** A file is still being indexed and none failed: the base carries "Indexing". */
export const KNOWLEDGE_BASE_INDEXING_ID = 779202;
/** Every file is indexed: the base carries no mark. */
export const KNOWLEDGE_BASE_INDEXED_ID = 779203;

/** The file of the failed base that could not be indexed. */
export const KNOWLEDGE_FAILED_FILE_TITLE = "Information security policy.pdf";

const FAILED_BASE_INDEXED_FILES = 45;

const SEEDS: Record<number, KnowledgeFileSeed[]> = {
  [KNOWLEDGE_BASE_FAILED_ID]: [
    { title: KNOWLEDGE_FAILED_FILE_TITLE, status: KnowledgeFileMockStatus.Failed },
    { title: "Travel policy.docx", status: KnowledgeFileMockStatus.InProgress },
    { title: "Remote work policy.docx", status: KnowledgeFileMockStatus.InProgress },
    ...Array.from({ length: FAILED_BASE_INDEXED_FILES }, (_, index) => ({
      title: `Policy ${index + 1 < 10 ? "0" : ""}${index + 1}.docx`,
      status: KnowledgeFileMockStatus.Completed,
    })),
  ],
  [KNOWLEDGE_BASE_INDEXING_ID]: [
    { title: "Release notes.docx", status: KnowledgeFileMockStatus.InProgress },
    { title: "User guide.pdf", status: KnowledgeFileMockStatus.Completed },
    { title: "API reference.docx", status: KnowledgeFileMockStatus.Completed },
  ],
  [KNOWLEDGE_BASE_INDEXED_ID]: [
    { title: "Glossary A-M.docx", status: KnowledgeFileMockStatus.Completed },
    { title: "Glossary N-Z.docx", status: KnowledgeFileMockStatus.Completed },
  ],
};

/**
 * The Knowledge bases list, newest change first: "Company policies" (48
 * files, one failed, two being indexed), "Product documentation" (one file
 * being indexed) and "Company glossary" (all indexed).
 */
export const KNOWLEDGE_BASES: AiHubRoomMock[] = [
  knowledgeBase(
    KNOWLEDGE_BASE_FAILED_ID,
    "Company policies",
    "5CC5D4",
    "2026-11-17T10:00:00.0000000+00:00",
    SEEDS[KNOWLEDGE_BASE_FAILED_ID].length,
  ),
  knowledgeBase(
    KNOWLEDGE_BASE_INDEXING_ID,
    "Product documentation",
    "8570FF",
    "2026-11-16T10:00:00.0000000+00:00",
    SEEDS[KNOWLEDGE_BASE_INDEXING_ID].length,
  ),
  knowledgeBase(
    KNOWLEDGE_BASE_INDEXED_ID,
    "Company glossary",
    "FF6680",
    "2026-11-15T10:00:00.0000000+00:00",
    SEEDS[KNOWLEDGE_BASE_INDEXED_ID].length,
  ),
];

const extension = (title: string) => title.slice(title.lastIndexOf("."));

const FILE_TYPE_BY_EXTENSION: Record<string, number> = {
  ".docx": 7,
  ".pdf": 10,
};

/** A file of a knowledge base as the Files service lists it. */
const knowledgeFile = (
  base: AiHubRoomMock,
  index: number,
  { title, status }: KnowledgeFileSeed,
) => {
  const fileExst = extension(title);
  const size = 24576 + index * 1024;
  return {
    id: base.id * 100 + index + 1,
    folderId: base.id,
    title,
    fileExst,
    fileType: FILE_TYPE_BY_EXTENSION[fileExst] ?? 7,
    version: 1,
    versionGroup: 1,
    contentLength: `${(size / 1024).toFixed(0)} KB`,
    pureContentLength: size,
    fileStatus: 0,
    mute: false,
    viewUrl: "",
    webUrl: "",
    comment: "Uploaded",
    thumbnailStatus: 0,
    viewAccessibility: {
      ImageView: false,
      MediaView: false,
      WebView: true,
      WebEdit: false,
      WebReview: false,
      WebCustomFilterEditing: false,
      WebRestrictedEditing: false,
      WebComment: false,
      CanConvert: false,
      MustConvert: false,
    },
    fileEntryType: 2,
    rootFolderId: AI_HUB_ROOT_ID,
    rootFolderType: AI_HUB_FOLDER_TYPE,
    access: 0,
    shared: false,
    canShare: false,
    created: "2026-11-10T09:30:00.0000000+00:00",
    updated: "2026-11-10T09:30:00.0000000+00:00",
    createdBy: base.createdBy,
    updatedBy: base.updatedBy,
    vectorizationStatus: status,
    // The owner's rights in a Knowledge room; `Vectorization` (index again)
    // is given for a file whose indexing failed.
    security: {
      Read: true,
      Comment: false,
      FillForms: false,
      Review: false,
      Edit: false,
      Delete: true,
      CustomFilter: false,
      Rename: true,
      ReadHistory: true,
      Lock: false,
      EditHistory: false,
      Copy: true,
      Move: true,
      Duplicate: false,
      SubmitToFormGallery: false,
      Download: true,
      Convert: false,
      CreateRoomFrom: false,
      CopyLink: true,
      Embed: false,
      EditForm: false,
      Vectorization: status === KnowledgeFileMockStatus.Failed,
    },
  };
};

export type KnowledgeFileMock = ReturnType<typeof knowledgeFile>;

/**
 * The files of every stock base, a fresh copy each call: a spec that changes
 * a file's state (indexing finished meanwhile) changes only its own copy.
 */
export const knowledgeBaseFilesMock = (
  bases: AiHubRoomMock[] = KNOWLEDGE_BASES,
): Record<number, KnowledgeFileMock[]> => {
  const files: Record<number, KnowledgeFileMock[]> = {};
  bases.forEach((base) => {
    files[base.id] = (SEEDS[base.id] ?? []).map((seed, index) =>
      knowledgeFile(base, index, seed),
    );
  });
  return files;
};

/**
 * `GET files/:id` for a knowledge base: its files with their indexing state,
 * the room as `current` and the "AI rooms" root before it in `pathParts`.
 * A base holds files only, so the answer is the same with
 * `filterType=1` (files only), as the state of a base is read, and without
 * it, as the opened base lists them; `startIndex` and `count` page it and
 * `total` counts them all. Any other folder is left to the other handlers.
 */
export const knowledgeBaseFolderHandler = (
  port: string,
  bases: AiHubRoomMock[] = KNOWLEDGE_BASES,
  files: Record<number, KnowledgeFileMock[]> = knowledgeBaseFilesMock(bases),
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/:id`,
    ({ params, request }) => {
      const base = bases.find((room) => String(room.id) === params.id);
      if (!base) return undefined;
      const search = new URL(request.url).searchParams;
      const all = files[base.id] ?? [];
      const startIndex = Number(search.get("startIndex")) || 0;
      const count = Number(search.get("count")) || all.length;
      const page = all.slice(startIndex, startIndex + count);
      return HttpResponse.json({
        response: {
          files: page,
          folders: [],
          current: { ...base, filesCount: all.length, isRoom: true },
          pathParts: [
            {
              id: AI_HUB_ROOT_ID,
              title: "AI rooms",
              folderType: AI_HUB_FOLDER_TYPE,
            },
            {
              id: base.id,
              title: base.title,
              folderType: KNOWLEDGE_FOLDER_TYPE,
              roomType: KNOWLEDGE_ROOM_TYPE,
            },
          ],
          startIndex,
          count: page.length,
          total: all.length,
          new: 0,
        },
        count: 1,
        links: [],
        status: 0,
        statusCode: 200,
      });
    },
  );

/**
 * The "AI rooms" section with the stock knowledge bases as its Knowledge
 * rooms and their files; the agents are the stock projects. The base
 * handler comes first, so a base opens with its files rather than empty.
 */
export const aiKnowledgeBasesHandlers = (
  port: string,
  {
    projects = AI_PROJECTS,
    bases = KNOWLEDGE_BASES,
    files = knowledgeBaseFilesMock(bases),
  }: {
    projects?: AiProjectMock[];
    bases?: AiHubRoomMock[];
    files?: Record<number, KnowledgeFileMock[]>;
  } = {},
) => [
  knowledgeBaseFolderHandler(port, bases, files),
  ...aiSectionsHandlers(port, projects, bases),
];
