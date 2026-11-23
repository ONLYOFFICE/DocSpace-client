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

import { http } from "msw";

import { BASE_URL, API_PREFIX } from "../../e2e/utils";
import type { EncryptedFilesHandlerHandle } from "../files/encryptedFiles";
import type { RequestLog } from "../privacyroom";

export type RoomMember = {
  id: string;
  displayName?: string;
  email?: string;
  access?: number;
  /** A portal group (SubjectType.Group) rather than an account. */
  isGroup?: boolean;
  /** A guest account (EmployeeFullDto.isVisitor). */
  isVisitor?: boolean;
};

export type RoomMembersHandlerHandle = {
  getMembers: () => RoomMember[];
  getRequests: () => RequestLog[];
  setMembers: (members: RoomMember[]) => void;
  reset: () => void;
};

export type RoomMembersHandlerOptions = {
  initial?: RoomMember[];
  links?: unknown[];
  handle?: { current: RoomMembersHandlerHandle | null };
  /**
   * Users who never registered an encryption key, for a private room. A
   * share request that gives one of them access for the first time is
   * answered with 403; one who already holds a share can be removed or
   * given another role.
   */
  withoutKeys?: string[];
  /**
   * Portal groups, for a private room. A group named with an access other
   * than FileShare.None is answered with 403, also one the room still
   * holds; removing it goes through. The request carries no subject type,
   * hence this option.
   */
  groups?: string[];
  /**
   * The room's files. A share set to None (FileShare.None) for a member
   * who held one removes that member's file keys, as SetAceObjectAsync
   * calls RevokeFileKeysAsync for the members a request takes out; the
   * mock's groups have no members, so every subject counts as a user.
   */
  files?: { current: EncryptedFilesHandlerHandle | null };
};

/** FileShare.None. */
const SHARE_NONE = 0;

/** SubjectType.User and SubjectType.Group (ASC.Files.Core.Security). */
const SUBJECT_USER = 0;
const SUBJECT_GROUP = 2;

/** ShareFilterType.User and ShareFilterType.ExternalLink. */
const FILTER_USER = "16";
const FILTER_EXTERNAL_LINK = "2";

const okResponse = <T>(response: T): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode: 200 }),
    { headers: { "Content-Type": "application/json" } },
  );

const refusedResponse = (message: string, type: string): Response =>
  new Response(
    JSON.stringify({ status: 1, statusCode: 403, error: { message, type } }),
    { status: 403, headers: { "Content-Type": "application/json" } },
  );

/** EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync. */
const noKeyResponse = (): Response =>
  refusedResponse(
    "The user does not have an encryption key",
    "ASC.Web.Studio.Core.EncryptionKeyNotSetException",
  );

/** FilesCommonResource.ErrorMessage_GroupInPrivateRoom. */
const groupResponse = (): Response =>
  refusedResponse(
    "A group cannot be invited to a private room: file keys are issued to each user",
    "System.InvalidOperationException",
  );

/**
 * FileShareDtoHelper.Get: a group entry carries GroupSummaryDto in sharedTo
 * and SubjectType.Group.
 */
const buildGroupDto = (m: RoomMember) => ({
  access: m.access ?? 11,
  sharedTo: {
    id: m.id,
    name: m.displayName ?? m.id,
    manager: null,
  },
  isOwner: false,
  isLocked: false,
  canEditAccess: true,
  subjectType: SUBJECT_GROUP,
});

const buildUserDto = (m: RoomMember) => ({
  access: m.access ?? 11,
  sharedTo: {
    id: m.id,
    displayName: m.displayName ?? m.id,
    email: m.email ?? `${m.id}@example.com`,
    avatar: "",
    avatarOriginal: "",
    avatarMax: "",
    avatarMedium: "",
    avatarSmall: "",
    profileUrl: "",
    hasAvatar: false,
    isAnonim: false,
    activationStatus: 1,
    status: 1,
    isVisitor: !!m.isVisitor,
  },
  isOwner: m.access === 0,
  isLocked: false,
  canEditAccess: true,
  subjectType: SUBJECT_USER,
});

const buildMemberDto = (m: RoomMember) =>
  m.isGroup ? buildGroupDto(m) : buildUserDto(m);

export const roomMembersHandlers = (
  port: string,
  roomId: number | string,
  opts: RoomMembersHandlerOptions = {},
) => {
  const state: RoomMember[] = [...(opts.initial ?? [])];
  const requests: RequestLog[] = [];

  const handle: RoomMembersHandlerHandle = {
    getMembers: () => [...state],
    getRequests: () => [...requests],
    setMembers: (members) => {
      state.length = 0;
      state.push(...members);
    },
    reset: () => {
      state.length = 0;
      requests.length = 0;
    },
  };
  if (opts.handle) opts.handle.current = handle;

  const baseUrl = `${BASE_URL}:${port}/${API_PREFIX}/files/rooms/${roomId}/share`;

  return [
    /**
     * VirtualRoomsController.GetRoomSecurityInfo. SecurityDao.GetPureSharesQuery
     * keeps SubjectType.User records only for ShareFilterType.User, guests
     * included, and the total counts the same records; any other filter but
     * the external links answers users and groups (UserOrGroup).
     */
    http.get(baseUrl, ({ request }) => {
      const url = new URL(request.url);
      requests.push({ method: "GET", url: url.pathname });
      const filterType = url.searchParams.get("filterType");
      if (filterType === FILTER_EXTERNAL_LINK) {
        const items = opts.links ?? [];
        return okResponse({ items, total: items.length });
      }
      const subjects =
        filterType === FILTER_USER ? state.filter((m) => !m.isGroup) : state;
      const items = subjects.map(buildMemberDto);
      return okResponse({ items, total: items.length });
    }),

    /**
     * VirtualRoomsController.SetRoomSecurity, which runs
     * FileSharingAceHelper.SetAceObjectAsync. In a private room
     * ValidatePrivateRoomMembersAsync checks the whole request before
     * anything is written: a group with an access is refused, and a user
     * who holds no share of the room yet must hold a key.
     */
    http.put(baseUrl, async ({ request }) => {
      const body = (await request.json()) as {
        invitations?: Array<{ id: string; access?: number; email?: string }>;
      };
      requests.push({ method: "PUT", url: baseUrl, body });

      const isGroup = (id: string) => opts.groups?.includes(id) ?? false;
      const invitations = body.invitations ?? [];

      for (const inv of invitations) {
        if (inv.access === SHARE_NONE) continue;
        if (isGroup(inv.id)) return groupResponse();
        const isMember = state.some((m) => m.id === inv.id);
        if (!isMember && opts.withoutKeys?.includes(inv.id)) {
          return noKeyResponse();
        }
      }

      const removed: string[] = [];
      for (const inv of invitations) {
        const existing = state.find((m) => m.id === inv.id);
        if (existing) {
          if (inv.access === SHARE_NONE) removed.push(inv.id);
          if (inv.access !== undefined) existing.access = inv.access;
          continue;
        }
        state.push({
          id: inv.id,
          email: inv.email,
          access: inv.access ?? 11,
          isGroup: isGroup(inv.id) || undefined,
        });
      }
      opts.files?.current?.revokeFileKeys(removed);
      return okResponse({ members: state.map(buildMemberDto) });
    }),

    http.delete(baseUrl, async ({ request }) => {
      const body = (await request.json().catch(() => ({}))) as {
        userIds?: string[];
      };
      requests.push({ method: "DELETE", url: baseUrl, body });

      const removeSet = new Set((body.userIds ?? []).map(String));
      for (let i = state.length - 1; i >= 0; i--) {
        if (removeSet.has(state[i].id)) state.splice(i, 1);
      }
      return okResponse({ members: state.map(buildMemberDto) });
    }),
  ];
};
