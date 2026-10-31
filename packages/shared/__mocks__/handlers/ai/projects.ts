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

export const PATH_AI_PROJECTS = "ai/projects";

/** The projects root the list answers as `current`; its channel carries created projects. */
export const AI_PROJECTS_ROOT_ID = 777000;

const INSTRUCTIONS_ROOM_TYPE = 10;
const KNOWLEDGE_ROOM_TYPE = 11;
const AI_PROJECT_ROOM_TYPE = 12;

/** `FileShare` values a project uses. */
export const AiProjectMockAccess = {
  None: 0,
  Owner: 1,
  Member: 2,
  ProjectManager: 9,
} as const;

type MockAccess =
  (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess];

const OWNER = {
  id: "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  displayName: "Administrator",
  avatarSmall: "/static/images/default_user_photo_size_32-32.png",
  hasAvatar: false,
  isOwner: true,
  isAdmin: false,
  isRoomAdmin: false,
  isCollaborator: false,
  isVisitor: false,
};

const MEMBER = {
  id: "11111111-2222-3333-4444-555555555555",
  displayName: "Jane Reviewer",
  avatarSmall: "/static/images/default_user_photo_size_32-32.png",
  hasAvatar: false,
  isOwner: false,
  isAdmin: false,
  isRoomAdmin: true,
  isCollaborator: false,
  isVisitor: false,
};

const PROFILE = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "GPT-5.1",
  provider: "openai",
  available: true,
};

const roomLogo = (color: string) => ({
  original: "",
  large: "",
  medium: "",
  small: "",
  color,
  cover: null,
});

const INSTRUCTIONS_ROOMS = {
  sales: {
    id: 778001,
    title: "Sales playbook",
    roomType: INSTRUCTIONS_ROOM_TYPE,
    available: true,
    archived: false,
    logo: roomLogo("8570FF"),
    skillsCount: 2,
  },
  legal: {
    id: 778002,
    title: "Legal tone",
    roomType: INSTRUCTIONS_ROOM_TYPE,
    available: true,
    archived: false,
    logo: roomLogo("FF6680"),
    skillsCount: 1,
  },
};

const KNOWLEDGE_ROOMS = {
  contracts: {
    id: 779001,
    title: "Contracts archive",
    roomType: KNOWLEDGE_ROOM_TYPE,
    available: true,
    archived: false,
    logo: roomLogo("5CC5D4"),
    totalFiles: 3,
    indexedFiles: 2,
  },
};

/** What the caller may do, by their role in the project (the server's `security`). */
const security = (access: MockAccess) => {
  const owner = access === AiProjectMockAccess.Owner;
  const manager = owner || access === AiProjectMockAccess.ProjectManager;
  const inside = access !== AiProjectMockAccess.None;
  return {
    Read: true,
    Rename: manager,
    EditRoom: manager,
    EditAccess: manager,
    ChangeOwner: owner || !inside,
    Delete: owner || !inside,
    Pin: true,
    Mute: inside,
    CopyLink: inside,
    UseChat: inside,
  };
};

type MockProjectOptions = {
  id: number;
  title: string;
  color: string;
  /** An uploaded picture: one URL for every logo size. */
  logoImage?: string;
  access?: MockAccess;
  createdBy?: typeof OWNER;
  created?: string;
  pinned?: boolean;
  /** The room tags, by name. */
  tags?: string[];
  profile?: typeof PROFILE | null;
  instructionsRooms?: (typeof INSTRUCTIONS_ROOMS)[keyof typeof INSTRUCTIONS_ROOMS][];
  knowledgeRooms?: (typeof KNOWLEDGE_ROOMS)[keyof typeof KNOWLEDGE_ROOMS][];
};

/** A project as `GET ai/projects` lists it: a room folder with the `aiProject` block. */
export const aiProjectMock = ({
  id,
  title,
  color,
  logoImage,
  access = AiProjectMockAccess.Owner,
  createdBy = OWNER,
  created = "2026-10-20T10:00:00.0000000+00:00",
  pinned = false,
  tags = [],
  profile = PROFILE,
  instructionsRooms = [],
  knowledgeRooms = [],
}: MockProjectOptions) => {
  const sec = security(access);
  return {
    id,
    title,
    roomType: AI_PROJECT_ROOM_TYPE,
    type: 40,
    parentId: AI_PROJECTS_ROOT_ID,
    rootFolderId: AI_PROJECTS_ROOT_ID,
    rootFolderType: 41,
    created,
    updated: created,
    createdBy,
    updatedBy: createdBy,
    pinned,
    tags,
    mute: false,
    inRoom: access !== AiProjectMockAccess.None,
    access,
    filesCount: 0,
    foldersCount: 0,
    isFavorite: false,
    new: 0,
    logo: logoImage
      ? { ...roomLogo(color), original: logoImage, large: logoImage, medium: logoImage, small: logoImage }
      : roomLogo(color),
    security: sec,
    aiProject: {
      profile,
      instructionsRooms,
      knowledgeRooms,
      canEditSettings: sec.EditRoom,
    },
  };
};

export type AiProjectMock = ReturnType<typeof aiProjectMock>;

/**
 * The stock list: a project with both source kinds, one with skills only,
 * and one shared with the caller as a member, without sources at all. Dates
 * descend as the default sort lists them.
 */
export const AI_PROJECTS: AiProjectMock[] = [
  aiProjectMock({
    id: 777001,
    title: "Sales assistant",
    color: "8570FF",
    created: "2026-10-22T10:00:00.0000000+00:00",
    pinned: true,
    tags: ["sales", "internal"],
    instructionsRooms: [INSTRUCTIONS_ROOMS.sales, INSTRUCTIONS_ROOMS.legal],
    knowledgeRooms: [KNOWLEDGE_ROOMS.contracts],
  }),
  aiProjectMock({
    id: 777002,
    title: "Contract reviewer",
    color: "FF6680",
    created: "2026-10-21T10:00:00.0000000+00:00",
    tags: ["legal"],
    instructionsRooms: [INSTRUCTIONS_ROOMS.legal],
  }),
  aiProjectMock({
    id: 777003,
    title: "Team notes",
    color: "5CC5D4",
    created: "2026-10-20T10:00:00.0000000+00:00",
    access: AiProjectMockAccess.Member,
    createdBy: MEMBER,
    profile: null,
  }),
];

/** The project with every source kind: the one the deep-view specs open. */
export const AI_PROJECT_WITH_SOURCES = AI_PROJECTS[0];
/** The project without a linked room: its source cards are hidden. */
export const AI_PROJECT_WITHOUT_SOURCES = AI_PROJECTS[2];

// The list answers the rooms without their `aiProject` block, as the
// service does: the page reads a project on its own when it opens it.
const listResponse = (projects: AiProjectMock[]) => ({
  response: {
    files: [],
    folders: projects.map(({ aiProject: _aiProject, ...room }) => room),
    current: {
      id: AI_PROJECTS_ROOT_ID,
      parentId: 0,
      rootFolderId: AI_PROJECTS_ROOT_ID,
      rootFolderType: 41,
      title: "AI Projects",
      filesCount: 0,
      foldersCount: projects.length,
      security: { Read: true, Create: true },
    },
    pathParts: [{ id: AI_PROJECTS_ROOT_ID, title: "AI Projects" }],
    startIndex: 0,
    count: projects.length,
    total: projects.length,
    new: 0,
  },
  count: 1,
  links: [],
  status: 0,
  statusCode: 200,
});

/** The owner's name, for the owner sort. */
const ownerName = (project: AiProjectMock) => project.createdBy?.displayName ?? "";

/**
 * `GET ai/projects`: the caller's projects. `projects` is the list to answer
 * with; left out, the stock list, and `[]` an empty section. The query is
 * read as the rooms list reads it: `filterValue` narrows by title (so the
 * search renders its own empty view), `tags` keeps the projects carrying any
 * of them, `withoutTags` the untagged ones, `subjectOwnerId` and
 * `subjectId` (a member) by user, and `sortBy`
 * takes `AZ`, `Tags`, `Author`, `DateAndTime` and `DateAndTimeCreation`.
 */
/**
 * The `GET ai/projects` query, as the server reads it for a rooms listing (the
 * Files list reads the "AI Projects" section there): `filterValue` narrows by title (so the
 * search renders its own empty view), `tags` keeps the projects carrying any
 * of them, `withoutTags` the untagged ones, `subjectOwnerId` and `subjectId`
 * (a member) by user, and `sortBy` takes `AZ`, `Tags`, `Author`,
 * `DateAndTime` and `DateAndTimeCreation`.
 */
const queryProjects = (params: URLSearchParams, projects: AiProjectMock[]) => {
  const filterValue = params.get("filterValue")?.trim().toLowerCase();
  const tagsParam = params.get("tags");
  const tags = tagsParam ? (JSON.parse(tagsParam) as string[]) : [];
  const withoutTags = params.get("withoutTags") === "true";
  const ownerId = params.get("subjectOwnerId");
  const subjectId = params.get("subjectId");
  let list = filterValue
    ? projects.filter((project) =>
        project.title.toLowerCase().includes(filterValue),
      )
    : projects;
  if (tags.length > 0) {
    list = list.filter((project) => project.tags.some((tag) => tags.includes(tag)));
  }
  if (withoutTags) list = list.filter((project) => project.tags.length === 0);
  if (ownerId) list = list.filter((project) => project.createdBy?.id === ownerId);
  if (subjectId) {
    // The mock's projects are the caller's, so the member filter keeps the
    // ones the caller is in.
    list = list.filter((project) => project.inRoom);
  }
  const sortBy = params.get("sortBy") ?? "DateAndTime";
  const descending = params.get("sortOrder") !== "ascending";
  const compare = (a: AiProjectMock, b: AiProjectMock) => {
    switch (sortBy) {
      case "AZ":
        return a.title.localeCompare(b.title);
      case "Tags":
        return a.tags.join(",").localeCompare(b.tags.join(","));
      case "Author":
        return ownerName(a).localeCompare(ownerName(b));
      case "DateAndTimeCreation":
        return a.created.localeCompare(b.created);
      default:
        return a.updated.localeCompare(b.updated);
    }
  };
  list = [...list].sort((a, b) => (descending ? -compare(a, b) : compare(a, b)));
  return list;
};

export const aiProjectsHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROJECTS}`,
    ({ request }) =>
      HttpResponse.json(
        listResponse(queryProjects(new URL(request.url).searchParams, projects)),
      ),
  );

/**
 * `GET ai/projects/:id`: one project, by id from `projects`; a project the
 * list does not hold answers 404, as the server does for one the caller
 * cannot see.
 */
export const aiProjectGetByIdHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROJECTS}/:id`,
    ({ params }) => {
      const project = projects.find((p) => String(p.id) === params.id);
      if (!project)
        return HttpResponse.json(
          { error: { message: "The project was not found." } },
          { status: 404 },
        );
      return HttpResponse.json({ response: project });
    },
  );

/** A 1x1 PNG, what an uploaded logo resolves to in the mocks. */
export const MOCK_LOGO_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * `POST ai/projects`: creates a project from the dialog's fields and answers
 * it; the project then joins `projects`, so the page can open it. A `logo`
 * object in the body (an uploaded picture) gives it the mock picture.
 */
export const aiProjectCreateHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROJECTS}`,
    async ({ request }) => {
      const body = (await request.json()) as {
        title?: string;
        tags?: string[];
        color?: string;
        logo?: { tmpFile?: string };
        aiProject?: { instructionsRoomIds?: number[]; knowledgeRoomIds?: number[] };
      };
      const created = aiProjectMock({
        id: 777100,
        title: body.title ?? "New project",
        tags: body.tags ?? [],
        color: body.color ?? "8570FF",
        logoImage: body.logo ? MOCK_LOGO_IMAGE : undefined,
        created: "2026-10-29T10:00:00.0000000+00:00",
      });
      projects.unshift(created);
      return HttpResponse.json({ response: created });
    },
  );

/** `POST files/logos`: the upload a picture makes before it is set as a logo. */
export const roomLogoUploadHandler = (port: string) =>
  http.post(`${BASE_URL}:${port}/${API_PREFIX}/files/logos`, () =>
    HttpResponse.json({ response: { success: true, data: "tmp-logo.png" } }),
  );

const SKILLS_BY_ROOM: Record<number, { id: string; name: string; description: string }[]> = {
  [INSTRUCTIONS_ROOMS.sales.id]: [
    {
      id: "skill-sales-pitch",
      name: "Pitch builder",
      description: "Drafts a pitch from the product sheet and the prospect's brief.",
    },
    {
      id: "skill-sales-followup",
      name: "Follow-up writer",
      description: "Writes the follow-up e-mail after a call.",
    },
  ],
  [INSTRUCTIONS_ROOMS.legal.id]: [
    {
      id: "skill-legal-tone",
      name: "Legal tone",
      description: "Keeps every answer in the house legal style.",
    },
  ],
};

/** `GET ai/projects/:id/skills`: the project's Instructions rooms with their skills. */
export const aiProjectSkillsHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROJECTS}/:id/skills`,
    ({ params }) => {
      const project = projects.find((p) => String(p.id) === params.id);
      const rooms = (project?.aiProject.instructionsRooms ?? []).map(
        (room) => ({
          id: room.id,
          title: room.title,
          logo: room.logo,
          available: room.available,
          skills: SKILLS_BY_ROOM[room.id] ?? [],
        }),
      );
      return HttpResponse.json({ response: { rooms } });
    },
  );

// `vectorizationStatus`: 0 in progress, 1 completed, 2 failed.
const KNOWLEDGE_FILES = [
  {
    id: 779101,
    title: "Master agreement.docx",
    fileExst: ".docx",
    indexed: true,
    vectorizationStatus: 1,
    security: { Vectorization: false },
  },
  {
    id: 779102,
    title: "NDA template.docx",
    fileExst: ".docx",
    indexed: true,
    vectorizationStatus: 1,
    security: { Vectorization: false },
  },
  {
    id: 779103,
    title: "Pricing 2026.xlsx",
    fileExst: ".xlsx",
    indexed: false,
    vectorizationStatus: 0,
    security: { Vectorization: false },
  },
  {
    id: 779104,
    title: "Old price list.pdf",
    fileExst: ".pdf",
    indexed: false,
    vectorizationStatus: 2,
    security: { Vectorization: true },
  },
];

/** `GET ai/projects/:id/knowledge`: the project's Knowledge rooms with their files. */
export const aiProjectKnowledgeHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/${PATH_AI_PROJECTS}/:id/knowledge`,
    ({ params }) => {
      const project = projects.find((p) => String(p.id) === params.id);
      const rooms = (project?.aiProject.knowledgeRooms ?? []).map((room) => ({
        id: room.id,
        title: room.title,
        logo: room.logo,
        available: room.available,
        totalFiles: KNOWLEDGE_FILES.length,
        indexedFiles: KNOWLEDGE_FILES.filter((file) => file.indexed).length,
        failedFiles: KNOWLEDGE_FILES.filter((file) => file.vectorizationStatus === 2).length,
        truncated: false,
        files: KNOWLEDGE_FILES,
      }));
      return HttpResponse.json({ response: { rooms } });
    },
  );

/** The "AI rooms" root (`FolderType.AiHub`), the Instructions and Knowledge rooms live under it. */
export const AI_HUB_ROOT_ID = 777500;

/** An Instructions or Knowledge room as `files/rooms?searchArea=AiHub` lists it. */
const aiHubRoomMock = (
  room:
    | (typeof INSTRUCTIONS_ROOMS)[keyof typeof INSTRUCTIONS_ROOMS]
    | (typeof KNOWLEDGE_ROOMS)[keyof typeof KNOWLEDGE_ROOMS],
  created: string,
) => ({
  id: room.id,
  title: room.title,
  roomType: room.roomType,
  type: room.roomType === INSTRUCTIONS_ROOM_TYPE ? 38 : 39,
  parentId: AI_HUB_ROOT_ID,
  rootFolderId: AI_HUB_ROOT_ID,
  rootFolderType: 42,
  created,
  updated: created,
  createdBy: OWNER,
  updatedBy: OWNER,
  pinned: false,
  tags: [],
  mute: false,
  inRoom: true,
  access: AiProjectMockAccess.Owner,
  filesCount: 0,
  foldersCount: 0,
  isFavorite: false,
  new: 0,
  logo: room.logo,
  // The owner's rights in an AI room: everything but archiving and
  // templates, which the server refuses for the AI types (no `Move`,
  // no `CreateRoomFrom`).
  security: {
    Read: true,
    Create: true,
    Rename: true,
    EditRoom: true,
    EditAccess: true,
    ChangeOwner: true,
    Delete: true,
    Duplicate: true,
    Pin: true,
    Mute: true,
    CopyLink: true,
    Download: true,
    UseChat: true,
  },
});

/** The stock "AI rooms" list: two Instructions rooms and a Knowledge room. */
export const AI_HUB_ROOMS = [
  aiHubRoomMock(INSTRUCTIONS_ROOMS.sales, "2026-10-22T10:00:00.0000000+00:00"),
  aiHubRoomMock(KNOWLEDGE_ROOMS.contracts, "2026-10-21T10:00:00.0000000+00:00"),
  aiHubRoomMock(INSTRUCTIONS_ROOMS.legal, "2026-10-20T10:00:00.0000000+00:00"),
];

export type AiHubRoomMock = (typeof AI_HUB_ROOMS)[number];

const AI_ROOT_TITLE = { 41: "AI Projects", 42: "AI rooms" } as const;

/** A folder content answer: the root's list, or a room opened with no files in it. */
const folderContent = (
  current: Record<string, unknown>,
  pathParts: { id: number; title: string; folderType?: number; roomType?: number }[],
  folders: unknown[] = [],
) => ({
  response: {
    files: [],
    folders,
    current,
    pathParts,
    startIndex: 0,
    count: folders.length,
    total: folders.length,
    new: 0,
  },
  count: 1,
  links: [],
  status: 0,
  statusCode: 200,
});

const aiRoot = (id: number, rootFolderType: 41 | 42, foldersCount: number) => ({
  id,
  parentId: 0,
  rootFolderId: id,
  rootFolderType,
  title: AI_ROOT_TITLE[rootFolderType],
  filesCount: 0,
  foldersCount,
  security: { Read: true, Create: true },
});

/**
 * `GET files/rooms?searchArea=AiHub`: the "AI rooms" list, narrowed by the
 * search, the type filter (`type`, repeated) and the rooms list's sorts as
 * `queryProjects` reads them. Any other search area is left to the rooms list
 * handler, so this one must be used before it (`mockRequest.use` puts it
 * first).
 */
export const aiHubRoomsHandler = (
  port: string,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    if (params.get("searchArea") !== "AiHub") return undefined;
    const types = params.getAll("type").map(Number);
    const filterValue = params.get("filterValue")?.trim().toLowerCase();
    const list = rooms.filter(
      (room) =>
        (types.length === 0 || types.includes(room.roomType)) &&
        (!filterValue || room.title.toLowerCase().includes(filterValue)),
    );
    return HttpResponse.json(
      folderContent(
        aiRoot(AI_HUB_ROOT_ID, 42, list.length),
        [{ id: AI_HUB_ROOT_ID, title: AI_ROOT_TITLE[42], folderType: 42 }],
        list,
      ),
    );
  });

/**
 * `GET files/:id` for an AI room or a project: the room opened, with no files
 * in it (a project holds none; the specs open a room only to check where it
 * lands). Any other folder is left to the files handlers.
 */
export const aiRoomFolderHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/:id`, ({ params }) => {
    const id = Number(params.id);
    const project = projects.find((p) => p.id === id);
    if (project) {
      const { aiProject: _aiProject, ...room } = project;
      return HttpResponse.json(
        folderContent({ ...room, isRoom: true }, [
          { id: AI_PROJECTS_ROOT_ID, title: AI_ROOT_TITLE[41], folderType: 41 },
          { id, title: room.title, folderType: 40, roomType: room.roomType },
        ]),
      );
    }
    const hubRoom = rooms.find((r) => r.id === id);
    if (hubRoom) {
      return HttpResponse.json(
        folderContent({ ...hubRoom, isRoom: true }, [
          { id: AI_HUB_ROOT_ID, title: AI_ROOT_TITLE[42], folderType: 42 },
          { id, title: hubRoom.title, folderType: hubRoom.type, roomType: hubRoom.roomType },
        ]),
      );
    }
    return undefined;
  });

/** Every route of the two AI sections: the projects, the AI rooms and their folders. */
export const aiSectionsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
) => [
  aiHubRoomsHandler(port, rooms),
  aiRoomFolderHandler(port, projects, rooms),
  ...aiProjectsHandlers(port, projects),
];

/** Every projects route, over one list. */
export const aiProjectsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => [
  aiProjectsHandler(port, projects),
  aiProjectGetByIdHandler(port, projects),
  aiProjectSkillsHandler(port, projects),
  aiProjectKnowledgeHandler(port, projects),
  aiProjectCreateHandler(port, projects),
  roomLogoUploadHandler(port),
];
