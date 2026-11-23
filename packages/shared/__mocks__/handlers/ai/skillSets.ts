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
  AI_HUB_ROOT_ID,
  aiRoomProjectMock,
  aiRoomProjectsHandler,
} from "./projects";
import type { AiRoomProjectMock } from "./projects";

/*
 * The Skill sets of the AI Chat section: Instructions rooms (`roomType` 10,
 * folder type 38) under the "AI rooms" root, each holding its skills as
 * Markdown files with a frontmatter (`name`, `description`) followed by the
 * instructions. The list is `files/rooms?searchArea=AiHub&type=10`, an opened
 * set is `files/{id}` with its files, a skill's text is read from its
 * `viewUrl`, and a save rewrites it in place (`PUT files/{id}/update`) and
 * renames it (`PUT files/file/{id}`).
 */

const AI_HUB_FOLDER_TYPE = 41;
const INSTRUCTIONS_ROOM_TYPE = 10;
const INSTRUCTIONS_FOLDER_TYPE = 38;
const AI_HUB_TITLE = "AI rooms";

/** `FileShare.Owner` and `FileShare.Read`: the caller's access to a set. */
const ACCESS_OWNER = 1;
const ACCESS_READ = 2;

const avatar = "/static/images/default_user_photo_size_32-32.png";

const person = (id: string, displayName: string) => ({
  id,
  displayName,
  avatarSmall: avatar,
  hasAvatar: false,
  profileUrl: "",
});

/** The owner of the portal, as `selfByTypeHandler(port, "owner")` signs in. */
export const SKILL_SET_OWNERS = {
  administrator: person("66faa6e4-f133-11ea-b126-00ffeec8b4ef", "Administrator"),
  jane: person("11111111-2222-3333-4444-555555555555", "Jane Reviewer"),
  zoe: person("22222222-3333-4444-5555-666666666666", "Zoe Counsel"),
};

type SkillSetOwner = (typeof SKILL_SET_OWNERS)[keyof typeof SKILL_SET_OWNERS];

export type SkillMock = {
  id: number;
  /** The file's title, with the `.md` extension. */
  title: string;
  /** The whole text of the file: the frontmatter, then the instructions. */
  text: string;
  version: number;
  created: string;
  updated: string;
};

export type SkillSetMock = {
  id: number;
  title: string;
  color: string;
  owner: SkillSetOwner;
  created: string;
  updated: string;
  /** The caller's access: the owner's, or read-only. */
  readOnly: boolean;
  skills: SkillMock[];
  /** The agents that use the set; none when left out. */
  usedBy?: AiRoomProjectMock[];
};

/** A skill file as the AI service writes one (`buildSkillFile`). */
export const skillFileText = (
  name: string,
  description: string,
  body: string,
) =>
  `---\nname: ${JSON.stringify(name)}\ndescription: ${JSON.stringify(
    description,
  )}\n---\n\n${body.trim()}\n`;

const skill = (
  id: number,
  title: string,
  name: string,
  description: string,
  body: string,
  updated: string,
): SkillMock => ({
  id,
  title,
  text: skillFileText(name, description, body),
  version: 1,
  created: "2026-11-01T10:00:00.0000000+00:00",
  updated,
});

/** The description and instructions of "Document summary", as the specs read them. */
export const DOCUMENT_SUMMARY = {
  title: "Document summary.md",
  name: "document-summary",
  description: "Summarizes a document in five bullet points.",
  body: "Read the whole document\n## Steps\n1. List the five main points.\n2. Keep each point to one sentence.",
};

/**
 * The stock skill sets, newest first: "Document assistant" (the
 * Administrator's, three skills), "Legal tone" (Zoe Counsel's, one skill) and
 * "Sales assistant" (Jane Reviewer's, two skills). Two agents use the first,
 * one the second and none the third. Sorted by owner they read otherwise
 * than by date. With `readOnly` the caller may only read them.
 * A fresh copy each call: a save changes the files.
 */
export const skillSetsMock = ({
  readOnly = false,
}: { readOnly?: boolean } = {}): SkillSetMock[] => [
  {
    id: 778101,
    title: "Document assistant",
    color: "8570FF",
    owner: SKILL_SET_OWNERS.administrator,
    created: "2026-11-01T10:00:00.0000000+00:00",
    updated: "2026-11-12T10:00:00.0000000+00:00",
    readOnly,
    usedBy: [
      aiRoomProjectMock(778302, "Sales desk", "5CC5D4"),
      aiRoomProjectMock(778301, "Contract reviewer", "FF6680"),
    ],
    skills: [
      skill(
        778201,
        DOCUMENT_SUMMARY.title,
        DOCUMENT_SUMMARY.name,
        DOCUMENT_SUMMARY.description,
        DOCUMENT_SUMMARY.body,
        "2026-11-12T10:00:00.0000000+00:00",
      ),
      skill(
        778202,
        "Clause check.md",
        "clause-check",
        "Checks every clause of a contract against the house rules.",
        "Compare each clause with the rules and list the ones that differ.",
        "2026-11-11T10:00:00.0000000+00:00",
      ),
      skill(
        778203,
        "Meeting notes.md",
        "meeting-notes",
        "Turns a transcript into meeting notes with action items.",
        "Write the decisions first, then the action items with their owners.",
        "2026-11-10T10:00:00.0000000+00:00",
      ),
    ],
  },
  {
    id: 778103,
    title: "Legal tone",
    color: "FF6680",
    owner: SKILL_SET_OWNERS.zoe,
    created: "2026-11-01T10:00:00.0000000+00:00",
    updated: "2026-11-11T10:00:00.0000000+00:00",
    readOnly,
    usedBy: [aiRoomProjectMock(778301, "Contract reviewer", "FF6680")],
    skills: [
      skill(
        778211,
        "House style.md",
        "house-style",
        "Keeps every answer in the house legal style.",
        "Use plain words, short sentences and the defined terms of the contract.",
        "2026-11-11T10:00:00.0000000+00:00",
      ),
    ],
  },
  {
    id: 778102,
    title: "Sales assistant",
    color: "5CC5D4",
    owner: SKILL_SET_OWNERS.jane,
    created: "2026-11-01T10:00:00.0000000+00:00",
    updated: "2026-11-10T10:00:00.0000000+00:00",
    readOnly,
    skills: [
      skill(
        778221,
        "Pitch builder.md",
        "pitch-builder",
        "Drafts a pitch from the product sheet and the prospect's brief.",
        "Open with the prospect's problem, then the product's answer to it.",
        "2026-11-10T10:00:00.0000000+00:00",
      ),
      skill(
        778222,
        "Follow-up writer.md",
        "follow-up-writer",
        "Writes the follow-up e-mail after a call.",
        "Thank the client, sum up the call and propose the next step.",
        "2026-11-09T10:00:00.0000000+00:00",
      ),
    ],
  },
];

const roomLogo = (color: string) => ({
  original: "",
  large: "",
  medium: "",
  small: "",
  color,
  cover: null,
});

/** What the caller may do in a set: the owner all but archiving, a reader read. */
const roomSecurity = (readOnly: boolean) => ({
  Read: true,
  Create: !readOnly,
  Rename: !readOnly,
  EditRoom: !readOnly,
  EditAccess: !readOnly,
  ChangeOwner: !readOnly,
  Delete: !readOnly,
  Duplicate: !readOnly,
  Pin: true,
  Mute: true,
  CopyLink: true,
  Download: true,
  UseChat: true,
});

const fileSecurity = (readOnly: boolean) => ({
  Read: true,
  Comment: false,
  FillForms: false,
  Review: false,
  Edit: !readOnly,
  Delete: !readOnly,
  CustomFilter: false,
  Rename: !readOnly,
  ReadHistory: true,
  Lock: false,
  EditHistory: !readOnly,
  Copy: true,
  Move: !readOnly,
  Duplicate: !readOnly,
  Download: true,
  Convert: false,
  CreateRoomFrom: false,
  CopyLink: true,
  Embed: false,
  Vectorization: false,
  AskAi: false,
});

/** A set as the rooms list and its own folder answer it. */
const skillSetRoom = (set: SkillSetMock) => ({
  id: set.id,
  title: set.title,
  roomType: INSTRUCTIONS_ROOM_TYPE,
  type: INSTRUCTIONS_FOLDER_TYPE,
  parentId: AI_HUB_ROOT_ID,
  rootFolderId: AI_HUB_ROOT_ID,
  rootFolderType: AI_HUB_FOLDER_TYPE,
  created: set.created,
  updated: set.updated,
  createdBy: set.owner,
  updatedBy: set.owner,
  pinned: false,
  tags: [],
  mute: false,
  inRoom: true,
  access: set.readOnly ? ACCESS_READ : ACCESS_OWNER,
  // A set holds its skills only: no folders.
  filesCount: set.skills.length,
  foldersCount: 0,
  linkedProjectsCount: set.usedBy?.length ?? 0,
  isFavorite: false,
  new: 0,
  logo: roomLogo(set.color),
  security: roomSecurity(set.readOnly),
});

/** The address a skill's text is read from. */
export const skillViewUrl = (port: string, id: number) =>
  `${BASE_URL}:${port}/filehandler.ashx?action=download&fileid=${id}`;

/** A skill as the Files service lists it in its set. */
const skillFile = (port: string, set: SkillSetMock, file: SkillMock) => ({
  id: file.id,
  title: file.title,
  folderId: set.id,
  version: file.version,
  versionGroup: file.version,
  contentLength: `${file.text.length} bytes`,
  pureContentLength: file.text.length,
  fileStatus: 0,
  mute: false,
  viewUrl: skillViewUrl(port, file.id),
  webUrl: `${BASE_URL}:${port}/doceditor?fileid=${file.id}&version=${file.version}`,
  fileType: 7,
  fileExst: ".md",
  comment: "",
  thumbnailStatus: 0,
  locked: false,
  formFillingStatus: 0,
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
  access: set.readOnly ? ACCESS_READ : ACCESS_OWNER,
  shared: false,
  canShare: false,
  security: fileSecurity(set.readOnly),
  created: file.created,
  updated: file.updated,
  createdBy: set.owner,
  updatedBy: set.owner,
});

const ownerName = (set: SkillSetMock) => set.owner.displayName;

/**
 * The sets of a `files/rooms?searchArea=AiHub&type=10` query, as the server
 * reads it for a rooms listing: `filterValue` narrows by title, `sortBy`
 * takes `AZ`, `Author`, `DateAndTime` and `DateAndTimeCreation`.
 */
const querySkillSets = (params: URLSearchParams, sets: SkillSetMock[]) => {
  const filterValue = params.get("filterValue")?.trim().toLowerCase();
  const list = filterValue
    ? sets.filter((set) => set.title.toLowerCase().includes(filterValue))
    : sets.slice();
  const sortBy = params.get("sortBy") ?? "DateAndTime";
  const descending = params.get("sortOrder") !== "ascending";
  const compare = (a: SkillSetMock, b: SkillSetMock) => {
    switch (sortBy) {
      case "AZ":
        return a.title.localeCompare(b.title);
      case "Author":
        return ownerName(a).localeCompare(ownerName(b));
      case "DateAndTimeCreation":
        return a.created.localeCompare(b.created);
      default:
        return a.updated.localeCompare(b.updated);
    }
  };
  return list.sort((a, b) => (descending ? -compare(a, b) : compare(a, b)));
};

const folderContent = (
  current: Record<string, unknown>,
  pathParts: {
    id: number;
    title: string;
    folderType?: number;
    roomType?: number;
  }[],
  files: unknown[],
  folders: unknown[],
) => ({
  response: {
    files,
    folders,
    current,
    pathParts,
    startIndex: 0,
    count: files.length + folders.length,
    total: files.length + folders.length,
    new: 0,
  },
  count: 1,
  links: [],
  status: 0,
  statusCode: 200,
});

const hubPath = {
  id: AI_HUB_ROOT_ID,
  title: AI_HUB_TITLE,
  folderType: AI_HUB_FOLDER_TYPE,
};

/**
 * `GET files/rooms?searchArea=AiHub&type=10`: the Skill sets list, sorted and
 * searched as the server does. Any other query is left to the other
 * handlers, so this one is used after `aiSectionsHandlers` (`mockRequest.use`
 * puts it first).
 */
export const aiSkillSetsListHandler = (port: string, sets: SkillSetMock[]) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const types = params.getAll("type").map(Number);
    if (
      params.get("searchArea") !== "AiHub" ||
      types.length !== 1 ||
      types[0] !== INSTRUCTIONS_ROOM_TYPE
    )
      return undefined;
    const list = querySkillSets(params, sets).map(skillSetRoom);
    return HttpResponse.json(
      folderContent(
        {
          id: AI_HUB_ROOT_ID,
          parentId: 0,
          rootFolderId: AI_HUB_ROOT_ID,
          rootFolderType: AI_HUB_FOLDER_TYPE,
          title: AI_HUB_TITLE,
          filesCount: 0,
          foldersCount: list.length,
          security: { Read: true, Create: true },
        },
        [hubPath],
        [],
        list,
      ),
    );
  });

const findSet = (sets: SkillSetMock[], id: unknown) =>
  sets.find((set) => String(set.id) === String(id));

const findSkill = (sets: SkillSetMock[], id: unknown) => {
  for (let i = 0; i < sets.length; i += 1) {
    const file = sets[i].skills.find((s) => String(s.id) === String(id));
    if (file) return { set: sets[i], file };
  }
  return null;
};

/**
 * The `file` part of a multipart body, read from its raw text: the browser's
 * `FormData` is not parsed the same way under every runner the mocks serve.
 */
const readUploadedFile = (contentType: string, raw: string): string | null => {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/.exec(contentType);
  const boundary = match ? (match[1] ?? match[2]).trim() : "";
  if (!boundary) return null;
  const parts = raw.split(`--${boundary}`);
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const headerEnd = part.indexOf("\r\n\r\n");
    if (headerEnd < 0 || !/name="file"/.test(part.slice(0, headerEnd))) continue;
    return part.slice(headerEnd + 4).replace(/\r\n$/, "");
  }
  return null;
};

export type SkillSetsMockOptions = {
  /**
   * The message the Files service refuses a rewritten skill with
   * (`PUT files/{id}/update`), as it does for a frontmatter it does not
   * take; the file is then left as it was.
   */
  refuseUpdate?: string;
};

/**
 * An opened set and its skills: `GET files/{id}` (the set with its files),
 * `GET files/rooms/{id}` and `GET files/folder/{id}` (the set alone),
 * `GET files/file/{id}` (a skill), the skill's text at its `viewUrl`, and the
 * two writes of a save, which change the mock: `PUT files/{id}/update` takes
 * the new text as a new version, `PUT files/file/{id}` renames the file.
 * Any other id is left to the other handlers.
 */
export const aiSkillSetContentHandlers = (
  port: string,
  sets: SkillSetMock[],
  { refuseUpdate }: SkillSetsMockOptions = {},
) => {
  const api = `${BASE_URL}:${port}/${API_PREFIX}`;
  return [
    http.get(`${api}/files/:id`, ({ params }) => {
      const set = findSet(sets, params.id);
      if (!set) return undefined;
      return HttpResponse.json(
        folderContent(
          { ...skillSetRoom(set), isRoom: true },
          [
            hubPath,
            {
              id: set.id,
              title: set.title,
              folderType: INSTRUCTIONS_FOLDER_TYPE,
              roomType: INSTRUCTIONS_ROOM_TYPE,
            },
          ],
          set.skills.map((file) => skillFile(port, set, file)),
          [],
        ),
      );
    }),
    http.get(`${api}/files/rooms/:id`, ({ params }) => {
      const set = findSet(sets, params.id);
      if (!set) return undefined;
      return HttpResponse.json({
        response: { ...skillSetRoom(set), isRoom: true },
      });
    }),
    http.get(`${api}/files/folder/:id`, ({ params }) => {
      const set = findSet(sets, params.id);
      if (!set) return undefined;
      return HttpResponse.json({
        response: { ...skillSetRoom(set), isRoom: true },
      });
    }),
    http.get(`${api}/files/file/:id`, ({ params }) => {
      const found = findSkill(sets, params.id);
      if (!found) return undefined;
      return HttpResponse.json({
        response: skillFile(port, found.set, found.file),
      });
    }),
    http.get(`${BASE_URL}:${port}/filehandler.ashx`, ({ request }) => {
      const id = new URL(request.url).searchParams.get("fileid");
      const found = findSkill(sets, id);
      if (!found) return undefined;
      return new HttpResponse(found.file.text, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }),
    http.put(`${api}/files/:id/update`, async ({ params, request }) => {
      const found = findSkill(sets, params.id);
      if (!found) return undefined;
      if (refuseUpdate)
        return HttpResponse.json(
          { error: { message: refuseUpdate } },
          { status: 400 },
        );
      const text = readUploadedFile(
        request.headers.get("Content-Type") ?? "",
        await request.text(),
      );
      if (text === null)
        return HttpResponse.json(
          { error: { message: "No file was sent." } },
          { status: 400 },
        );
      found.file.text = text;
      found.file.version += 1;
      found.file.updated = "2026-11-18T10:00:00.0000000+00:00";
      return HttpResponse.json({
        response: skillFile(port, found.set, found.file),
      });
    }),
    http.put(`${api}/files/file/:id`, async ({ params, request }) => {
      const found = findSkill(sets, params.id);
      if (!found) return undefined;
      const { title } = (await request.json()) as { title?: string };
      if (!title)
        return HttpResponse.json(
          { error: { message: "The title is empty." } },
          { status: 400 },
        );
      found.file.title = title;
      return HttpResponse.json({
        response: skillFile(port, found.set, found.file),
      });
    }),
  ];
};

/**
 * Every route of the Skill sets: the list, the agents that use each set, the
 * opened sets and their skills.
 */
export const aiSkillSetsHandlers = (
  port: string,
  sets: SkillSetMock[],
  options: SkillSetsMockOptions = {},
) => [
  aiSkillSetsListHandler(port, sets),
  aiRoomProjectsHandler(
    port,
    Object.fromEntries(sets.map((set) => [set.id, set.usedBy ?? []])),
  ),
  ...aiSkillSetContentHandlers(port, sets, options),
];
