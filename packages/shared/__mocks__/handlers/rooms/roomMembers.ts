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
import type { RequestLog } from "../privacyroom";

export type RoomMember = {
  id: string;
  displayName?: string;
  email?: string;
  access?: number;
};

export type RoomMembersHandlerHandle = {
  getMembers: () => RoomMember[];
  getRequests: () => RequestLog[];
  setMembers: (members: RoomMember[]) => void;
  reset: () => void;
};

export type RoomMembersHandlerOptions = {
  initial?: RoomMember[];
  handle?: { current: RoomMembersHandlerHandle | null };
};

const okResponse = <T>(response: T): Response =>
  new Response(
    JSON.stringify({ response, status: 0, statusCode: 200 }),
    { headers: { "Content-Type": "application/json" } },
  );

const buildMemberDto = (m: RoomMember) => ({
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
  },
  isOwner: m.access === 0,
  isLocked: false,
  canEditAccess: true,
  subjectType: 0,
});

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
    http.get(baseUrl, ({ request }) => {
      requests.push({ method: "GET", url: new URL(request.url).pathname });
      const items = state.map(buildMemberDto);
      return okResponse({ items, total: items.length });
    }),

    http.put(baseUrl, async ({ request }) => {
      const body = (await request.json()) as {
        invitations?: Array<{ id: string; access?: number; email?: string }>;
      };
      requests.push({ method: "PUT", url: baseUrl, body });

      for (const inv of body.invitations ?? []) {
        const existing = state.find((m) => m.id === inv.id);
        if (existing) {
          if (inv.access !== undefined) existing.access = inv.access;
          continue;
        }
        state.push({
          id: inv.id,
          email: inv.email,
          access: inv.access ?? 11,
        });
      }
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
