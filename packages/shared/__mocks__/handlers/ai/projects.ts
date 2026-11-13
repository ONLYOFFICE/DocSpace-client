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

/**
 * The "AI rooms" root (`FolderType.AiHub`, 41): the Instructions rooms, the
 * Knowledge rooms and the AI projects live under it.
 */
export const AI_HUB_ROOT_ID = 777500;
const AI_HUB_FOLDER_TYPE = 41;

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
  /** The project's instructions to the chat. */
  instructions?: string;
  /** The suggestion chips of the project's empty chat. */
  suggestions?: { name: string; prompt: string }[];
  instructionsRooms?: (typeof INSTRUCTIONS_ROOMS)[keyof typeof INSTRUCTIONS_ROOMS][];
  knowledgeRooms?: (typeof KNOWLEDGE_ROOMS)[keyof typeof KNOWLEDGE_ROOMS][];
};

/**
 * A project as the page reads it: the room `files/rooms` answers, with the
 * `aiProject` block the client composes from `files/rooms/{id}/sources`
 * (the handlers answer the room without it).
 */
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
  instructions = "",
  suggestions = [],
  instructionsRooms = [],
  knowledgeRooms = [],
}: MockProjectOptions) => {
  const sec = security(access);
  return {
    id,
    title,
    roomType: AI_PROJECT_ROOM_TYPE,
    type: 40,
    parentId: AI_HUB_ROOT_ID,
    rootFolderId: AI_HUB_ROOT_ID,
    rootFolderType: AI_HUB_FOLDER_TYPE,
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
      instructions,
      suggestions,
      instructionsRooms,
      knowledgeRooms,
      canEditSettings: sec.EditRoom,
    },
  };
};

export type AiProjectMock = ReturnType<typeof aiProjectMock>;

/**
 * The stock list: a project with both source kinds, instructions and three
 * suggestion chips, one with skills only and a single chip, and one shared
 * with the caller as a member, without sources, instructions or chips at
 * all. Dates descend as the default sort lists them.
 */
export const AI_PROJECTS: AiProjectMock[] = [
  aiProjectMock({
    id: 777001,
    title: "Sales assistant",
    color: "8570FF",
    created: "2026-10-22T10:00:00.0000000+00:00",
    pinned: true,
    tags: ["sales", "internal"],
    instructions:
      "You are a sales assistant. Answer briefly, cite the contract you rely on and flag every deadline.",
    suggestions: [
      { name: "Summarize contracts", prompt: "Summarize the contracts signed this month and list the main risks." },
      { name: "Draft a follow-up", prompt: "Draft a follow-up email to a client after the first sales call." },
      { name: "Find deadlines", prompt: "Find all payment and delivery deadlines in the knowledge base." },
    ],
    instructionsRooms: [INSTRUCTIONS_ROOMS.sales, INSTRUCTIONS_ROOMS.legal],
    knowledgeRooms: [KNOWLEDGE_ROOMS.contracts],
  }),
  aiProjectMock({
    id: 777002,
    title: "Contract reviewer",
    color: "FF6680",
    created: "2026-10-21T10:00:00.0000000+00:00",
    tags: ["legal"],
    suggestions: [
      { name: "Review a contract", prompt: "Review the attached contract and point out clauses that need a lawyer." },
    ],
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

/** A project as `files/rooms` answers it: the room, without the `aiProject` block. */
const projectRoom = ({ aiProject: _aiProject, ...room }: AiProjectMock) => room;

/** The owner's name, for the owner sort. */
const ownerName = (project: AiProjectMock) => project.createdBy?.displayName ?? "";

/**
 * The projects of a `files/rooms?searchArea=AiHub&type=12` query, as the
 * server reads it for a rooms listing: `filterValue` narrows by title (so the
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

const notFound = () =>
  HttpResponse.json({ error: { message: "The room was not found." } }, { status: 404 });

const findProject = (projects: AiProjectMock[], id: unknown) =>
  projects.find((p) => String(p.id) === String(id));

/**
 * `GET files/rooms/:id` for a project: the room, without its `aiProject`
 * block. Any other room is left to the rooms handlers.
 */
export const aiProjectGetByIdHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id`, ({ params }) => {
    const project = findProject(projects, params.id);
    return project ? HttpResponse.json({ response: projectRoom(project) }) : undefined;
  });

const toSource = (room: { id: number; title: string; logo: unknown }) => ({
  id: room.id,
  title: room.title,
  logo: room.logo,
});

/**
 * `GET files/rooms/:id/sources`: the project's linked rooms; `POST` and
 * `DELETE` link and unlink `roomIds` (any Instructions or Knowledge room of
 * the mocks), as the server does.
 */
export const aiProjectSourcesHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/sources`;
  const linkable = [...Object.values(INSTRUCTIONS_ROOMS), ...Object.values(KNOWLEDGE_ROOMS)];
  const change =
    (link: boolean) =>
    async ({ params, request }: { params: Record<string, unknown>; request: Request }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      const { roomIds = [] } = (await request.json()) as { roomIds?: number[] };
      const block = project.aiProject;
      if (link) {
        for (const room of linkable.filter((r) => roomIds.includes(r.id))) {
          const list = (
            room.roomType === INSTRUCTIONS_ROOM_TYPE ? block.instructionsRooms : block.knowledgeRooms
          ) as (typeof room)[];
          if (!list.some((r) => r.id === room.id)) list.push(room);
        }
      } else {
        block.instructionsRooms = block.instructionsRooms.filter((r) => !roomIds.includes(r.id));
        block.knowledgeRooms = block.knowledgeRooms.filter((r) => !roomIds.includes(r.id));
      }
      return new HttpResponse(null, { status: 204 });
    };
  return [
    http.get(url, ({ params }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      return HttpResponse.json({
        response: {
          instructionsRooms: project.aiProject.instructionsRooms.map(toSource),
          knowledgeRooms: project.aiProject.knowledgeRooms.map(toSource),
        },
      });
    }),
    http.post(url, change(true)),
    http.delete(url, change(false)),
  ];
};

/**
 * `GET` / `PUT files/rooms/:id/model`: the project's model as the Files API
 * keeps it (`profileId: null` runs on the portal default; a write keeps the
 * stock profile for any id sent), and `GET ai/profiles/get-by-id` naming
 * that profile, unwrapped as ASC.AI.Chat answers it.
 */
export const aiProjectModelHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/model`;
  const answer = (project: AiProjectMock) =>
    HttpResponse.json({ response: { profileId: project.aiProject.profile?.id ?? null } });
  return [
    http.get(url, ({ params }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      return answer(project);
    }),
    http.put(url, async ({ params, request }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      const { profileId } = (await request.json()) as { profileId?: string };
      project.aiProject.profile = profileId ? PROFILE : null;
      return answer(project);
    }),
    http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/profiles/get-by-id`, ({ request }) => {
      const id = new URL(request.url).searchParams.get("id");
      if (id !== PROFILE.id) return HttpResponse.json({ error: "Profile not found" }, { status: 404 });
      return HttpResponse.json({ id: PROFILE.id, name: PROFILE.name, providerType: PROFILE.provider, capabilities: 1 });
    }),
  ];
};

/**
 * `GET` / `PUT files/rooms/:id/instructions`: the project's instructions to
 * the chat ("" when none); a write replaces them, "" clears them.
 */
export const aiProjectInstructionsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/instructions`;
  const answer = (project: AiProjectMock) =>
    HttpResponse.json({ response: { instructions: project.aiProject.instructions } });
  return [
    http.get(url, ({ params }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      return answer(project);
    }),
    http.put(url, async ({ params, request }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      const { instructions } = (await request.json()) as { instructions?: string };
      project.aiProject.instructions = instructions ?? "";
      return answer(project);
    }),
  ];
};

/**
 * `GET` / `PUT files/rooms/:id/suggestions`: the suggestion chips of the
 * project's empty chat; a write replaces them, `[]` clears them.
 */
export const aiProjectSuggestionsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => {
  const url = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/suggestions`;
  const answer = (project: AiProjectMock) =>
    HttpResponse.json({ response: { suggestions: project.aiProject.suggestions } });
  return [
    http.get(url, ({ params }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      return answer(project);
    }),
    http.put(url, async ({ params, request }) => {
      const project = findProject(projects, params.id);
      if (!project) return notFound();
      const { suggestions } = (await request.json()) as { suggestions?: AiProjectMock["aiProject"]["suggestions"] };
      project.aiProject.suggestions = suggestions ?? [];
      return answer(project);
    }),
  ];
};

/** A 1x1 PNG, what an uploaded logo resolves to in the mocks. */
export const MOCK_LOGO_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/**
 * `POST files/rooms` with `roomType: 12`: creates a project from the
 * dialog's fields and answers its room; the project then joins `projects`,
 * so the page can open it. A `logo` object in the body (an uploaded picture)
 * gives it the mock picture. Any other room type is left to the rooms
 * handlers.
 */
export const aiProjectCreateHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms`,
    async ({ request }) => {
      const body = (await request.clone().json()) as {
        title?: string;
        roomType?: number;
        tags?: string[];
        color?: string;
        logo?: { tmpFile?: string };
      };
      if (body.roomType !== AI_PROJECT_ROOM_TYPE) return undefined;
      const created = aiProjectMock({
        id: 777100,
        title: body.title ?? "New project",
        tags: body.tags ?? [],
        color: body.color ?? "8570FF",
        logoImage: body.logo ? MOCK_LOGO_IMAGE : undefined,
        created: "2026-10-29T10:00:00.0000000+00:00",
      });
      projects.unshift(created);
      return HttpResponse.json({ response: projectRoom(created) });
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

/** `GET files/rooms/:id/skills` for a project: its Instructions rooms with their skills. */
export const aiProjectSkillsHandler = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/:id/skills`,
    ({ params }) => {
      const project = projects.find((p) => String(p.id) === params.id);
      const rooms = (project?.aiProject.instructionsRooms ?? []).map(
        (room) => ({
          id: room.id,
          title: room.title,
          logo: room.logo,
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

/**
 * `GET files/:id?filterType=1` for a Knowledge room: its files with their
 * vectorization state, as the project's knowledge panel reads them; a room
 * marked unavailable answers 403. Any other folder is left to the files
 * handlers.
 */
export const aiProjectKnowledgeHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/:id`, ({ params, request }) => {
    const room = Object.values(KNOWLEDGE_ROOMS).find((r) => String(r.id) === params.id);
    if (!room || new URL(request.url).searchParams.get("filterType") !== "1") return undefined;
    if (!room.available)
      return HttpResponse.json({ error: { message: "Access denied" } }, { status: 403 });
    const files = KNOWLEDGE_FILES.map(({ indexed: _indexed, ...file }) => file);
    return HttpResponse.json({
      response: { files, folders: [], total: files.length, startIndex: 0, count: files.length },
    });
  });


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
  rootFolderType: AI_HUB_FOLDER_TYPE,
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

const AI_HUB_TITLE = "AI rooms";

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

const aiRoot = (foldersCount: number) => ({
  id: AI_HUB_ROOT_ID,
  parentId: 0,
  rootFolderId: AI_HUB_ROOT_ID,
  rootFolderType: AI_HUB_FOLDER_TYPE,
  title: AI_HUB_TITLE,
  filesCount: 0,
  foldersCount,
  security: { Read: true, Create: true },
});

/**
 * `GET files/rooms?searchArea=AiHub`: the "AI rooms" list, the AI rooms and
 * the projects, narrowed by the type filter (`type`, repeated) and the
 * search. A query for the projects alone (`type=12`, as the chat's project
 * picker asks) reads the rooms list's filters and sorts (`queryProjects`).
 * Any other search area is left to the rooms list handler, so this one must
 * be used before it (`mockRequest.use` puts it first).
 */
export const aiHubRoomsHandler = (
  port: string,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
  projects: AiProjectMock[] = AI_PROJECTS,
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    if (params.get("searchArea") !== "AiHub") return undefined;
    const types = params.getAll("type").map(Number);
    let list: unknown[];
    if (types.length === 1 && types[0] === AI_PROJECT_ROOM_TYPE) {
      list = queryProjects(params, projects).map(projectRoom);
    } else {
      const filterValue = params.get("filterValue")?.trim().toLowerCase();
      list = [...projects.map(projectRoom), ...rooms].filter(
        (room) =>
          (types.length === 0 || types.includes(room.roomType)) &&
          (!filterValue || room.title.toLowerCase().includes(filterValue)),
      );
    }
    return HttpResponse.json(
      folderContent(
        aiRoot(list.length),
        [{ id: AI_HUB_ROOT_ID, title: AI_HUB_TITLE, folderType: AI_HUB_FOLDER_TYPE }],
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
    const room = project ? projectRoom(project) : rooms.find((r) => r.id === id);
    if (!room) return undefined;
    return HttpResponse.json(
      folderContent({ ...room, isRoom: true }, [
        { id: AI_HUB_ROOT_ID, title: AI_HUB_TITLE, folderType: AI_HUB_FOLDER_TYPE },
        { id, title: room.title, folderType: room.type, roomType: room.roomType },
      ]),
    );
  });

/** Every route of the "AI rooms" section: its list, the rooms and folders, the projects. */
export const aiSectionsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
  rooms: AiHubRoomMock[] = AI_HUB_ROOMS,
) => [
  aiHubRoomsHandler(port, rooms, projects),
  aiProjectKnowledgeHandler(port),
  aiRoomFolderHandler(port, projects, rooms),
  ...aiProjectsHandlers(port, projects),
];

/** Every route of a project but the list, over one list of projects. */
export const aiProjectsHandlers = (
  port: string,
  projects: AiProjectMock[] = AI_PROJECTS,
) => [
  aiProjectSkillsHandler(port, projects),
  ...aiProjectSourcesHandlers(port, projects),
  ...aiProjectModelHandlers(port, projects),
  ...aiProjectInstructionsHandlers(port, projects),
  ...aiProjectSuggestionsHandlers(port, projects),
  aiProjectGetByIdHandler(port, projects),
  aiProjectCreateHandler(port, projects),
  roomLogoUploadHandler(port),
];
