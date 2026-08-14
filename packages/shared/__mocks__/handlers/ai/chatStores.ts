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

import { delay, http, HttpResponse } from "msw";
import { API_PREFIX, BASE_URL } from "../../e2e/utils";

/**
 * The chat library's own stores (`@onlyoffice/ai-chat`) — profiles, model
 * assignments, the deep-mode preference and the thread list.
 *
 * These are not the DocSpace endpoints the rest of `handlers/ai` mocks: the
 * library talks to `/api/2.0/ai/<domain>/<action>` itself through its
 * `ServerAPI` transport (`DEFAULT_SERVER_API_ROUTES`), and it consumes the
 * bodies raw — no `{ response, status, statusCode }` envelope. Anything the
 * chat widget shows above the composer (the model picker, and with it the
 * "Model updated" notice) needs these three reads to land, or the profiles
 * store never leaves `initialized: false`.
 */

/** Model-assignment slots, from the library's `ActionType`. */
export const AiActionType = {
  Default: "Default",
  Chat: "Chat",
} as const;

/**
 * Capability bitmask (the library's `CapabilitiesUI`). The composer's picker
 * only offers profiles whose mask carries `Chat`, and a profile that leaves
 * `capabilities` unset has one inferred from its provider and model — which
 * an invented test model would fail. Set it here instead.
 */
const CAPABILITY_CHAT = 1;
const CAPABILITY_TOOLS = 256;

export type AiChatProfile = {
  id: string;
  name: string;
  providerType: string;
  baseUrl: string;
  modelId: string;
  capabilities: number;
};

/**
 * Two profiles, so a test can tell the automatic pick (the first chat-capable
 * one) apart from any other choice. Names are what the picker and the notice
 * put on screen.
 */
export const AI_CHAT_PROFILES: AiChatProfile[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    name: "GPT-5.1",
    providerType: "openai",
    baseUrl: "https://api.openai.com/v1",
    modelId: "gpt-5.1",
    capabilities: CAPABILITY_CHAT | CAPABILITY_TOOLS,
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    name: "Claude Opus 4.5",
    providerType: "anthropic",
    baseUrl: "https://api.anthropic.com",
    modelId: "claude-opus-4-5",
    capabilities: CAPABILITY_CHAT | CAPABILITY_TOOLS,
  },
];

/** The profile the picker selects by itself when nothing is assigned. */
export const AI_CHAT_AUTO_PICKED = AI_CHAT_PROFILES[0];

/** The other one — an assignment that is nobody's automatic pick. */
export const AI_CHAT_ASSIGNED = AI_CHAT_PROFILES[1];

/** `GET /api/2.0/ai/profiles/list` — the portal's configured models. */
export const aiChatProfilesListHandler = (
  port: string,
  { profiles = AI_CHAT_PROFILES }: { profiles?: AiChatProfile[] } = {},
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/profiles/list`, () =>
    HttpResponse.json(profiles),
  );

export type AssignmentMap = Partial<
  Record<(typeof AiActionType)[keyof typeof AiActionType], string>
>;

/**
 * `GET /api/2.0/ai/assignments/get-all-assignments?entityId=…` — which model
 * each action is bound to for that scope. An empty map is the marker the
 * "Model updated" notice is raised on.
 *
 * `delayMs` holds the answer back, which is how the window between opening the
 * chat and its assignment landing is reproduced — the notice must not be
 * raised on slots that have not been read yet.
 */
export const aiChatAssignmentsHandler = (
  port: string,
  {
    assignments = {},
    delayMs,
  }: { assignments?: AssignmentMap; delayMs?: number } = {},
) =>
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/ai/assignments/get-all-assignments`,
    async () => {
      if (delayMs) await delay(delayMs);

      return HttpResponse.json(assignments);
    },
  );

/** `GET /api/2.0/ai/preferences/get-deep-mode` — the third read `init` makes. */
export const aiChatDeepModeHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/preferences/get-deep-mode`, () =>
    HttpResponse.json(false),
  );

/** `GET /api/2.0/ai/threads/list` — an account with no chat history yet. */
export const aiChatThreadsListHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/threads/list`, () =>
    HttpResponse.json([]),
  );

/**
 * The tool and web-search reads the widget fires alongside the three above.
 * Nothing in these specs looks at them; they are answered only so a failed
 * read does not put an error toast over the notice under test.
 */
export const aiChatQuietHandlers = (port: string) => [
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/tools/list-custom-servers`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/tools/list-system-tools`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/tools/get-disabled`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/tools/get-allow-always`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/web-search/is-configured`, () =>
    HttpResponse.json(false),
  ),
  http.get(
    `${BASE_URL}:${port}/${API_PREFIX}/ai/web-search/get-active-config`,
    () => HttpResponse.json(null),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/prompts/list-folders`, () =>
    HttpResponse.json([]),
  ),
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/ai/prompts/list`, () =>
    HttpResponse.json([]),
  ),
];

/**
 * Everything the chat widget hydrates from, in one call. Pass the assignment
 * options through; the rest have no knobs worth turning per spec.
 */
export const aiChatStoreHandlers = (
  port: string,
  options: Parameters<typeof aiChatAssignmentsHandler>[1] = {},
) => [
  aiChatProfilesListHandler(port),
  aiChatAssignmentsHandler(port, options),
  aiChatDeepModeHandler(port),
  aiChatThreadsListHandler(port),
  ...aiChatQuietHandlers(port),
];
