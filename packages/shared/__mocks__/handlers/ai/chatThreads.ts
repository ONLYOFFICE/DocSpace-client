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

/**
 * A successful chat round and the conversations it lands in, as ASC.AI.Chat
 * (the Node AI gateway) answers the chat library (`@onlyoffice/ai-chat`).
 *
 * The library talks to `/api/2.0/ai/<domain>/<action>` through its
 * `ServerAPI` transport and reads the bodies raw, with no DocSpace envelope:
 *
 * - `GET threads/list?entityId&count&cursor&query` - the conversations of a
 *   scope, newest first (`lastEditDate` DESC, `threadId` DESC). The scope is
 *   the agent the chat runs on; without one the storage lists only the
 *   conversations of no agent (`ThreadQueries`, `EntryId == null`), so the
 *   default agent's history and the sidebar's Recent never see an agent's.
 *   The thread DTO does not echo its scope back.
 * - `GET threads/get-by-id?threadId` - one thread, 404 when unknown. The
 *   library reads it right after a round's `thread-title` event, so a round
 *   that creates a thread must make it readable at once.
 * - `GET threads/read-messages?threadId&count&cursor&direction` - the
 *   messages, ordered by `createdAt` then `id`, `"desc"` for the tail page a
 *   chat opens on.
 * - `POST threads/touch` - a follow-up in an existing thread.
 * - `POST ai/send-with-stream` - the round, an NDJSON stream of the
 *   library's `ChatEvent`s (`streamNdjson` in `aiController.ts`).
 *
 * {@link aiChatThreadsHandlers} keeps one in-memory store behind all of them,
 * so a round's new conversation shows in the history and a follow-up lands
 * in the thread it was sent to.
 */

/** The title the engine gives a new thread until the real one is generated. */
export const AI_CHAT_PLACEHOLDER_TITLE = "New chat";

/** A text part of a message. */
export type AiChatTextPart = { type: "text"; text: string };

/**
 * A tool call inside an assistant message (assistant-ui's `tool-call` part).
 * `result` is the stored result, a JSON string; without it the call is still
 * running.
 */
export type AiChatToolCallPart = {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  argsText: string;
  result?: string;
};

export type AiChatContentPart = AiChatTextPart | AiChatToolCallPart;

/**
 * A stored message as `threads/read-messages` answers it: assistant-ui's
 * `ThreadMessageLike` with the storage id and `createdAt` as an ISO string.
 */
export type AiChatMessageMock = {
  id: string;
  role: "user" | "assistant";
  content: AiChatContentPart[];
  createdAt: string;
};

/**
 * A conversation of the mocked storage.
 *
 * `agentId` is the scope it was started in: the id of the agent (an AI
 * project room), or none for the default agent. It decides which history
 * lists the conversation and is never sent back to the client.
 */
export type AiChatThreadMock = {
  threadId: string;
  title: string;
  /** Ms since epoch; the history sorts and groups by it. Defaults to now. */
  lastEditDate?: number;
  profileId?: string;
  agentId?: number | string;
  /** Oldest first. */
  messages?: AiChatMessageMock[];
};

/** What an assistant reply of a round consists of. */
export type AiChatReplyMock = {
  /** A plain text reply. Ignored when `content` is given. */
  text?: string;
  /** The reply's parts, e.g. a tool call and the text after it. */
  content?: AiChatContentPart[];
  /** The generated title of a new thread. Defaults to the user's text. */
  title?: string;
};

/** The body of `POST ai/send-with-stream` (the library's `SendStreamInput`). */
export type AiChatSendRequest = {
  threadId?: string;
  entityId?: string;
  contextEntityId?: string;
  profileId?: string;
  userMessage: { role: string; content: unknown };
  actionArgs?: Record<string, unknown>;
};

/** Every request the handlers answered, in order, for a spec to assert on. */
export type AiChatRequestLog = {
  list: { entityId?: string; count?: number; query?: string }[];
  getById: string[];
  readMessages: { threadId: string; count?: number; direction?: string }[];
  touch: { threadId?: string; profileId?: string }[];
  send: AiChatSendRequest[];
};

/** An empty {@link AiChatRequestLog}, to pass to {@link aiChatThreadsHandlers}. */
export const aiChatRequestLog = (): AiChatRequestLog => ({
  list: [],
  getById: [],
  readMessages: [],
  touch: [],
  send: [],
});

const pad = (n: number) => `000000000000${n}`.slice(-12);

/** A message id in the storage's UUID form, stable per index. */
export const aiChatMessageId = (n: number) =>
  `bbbbbbbb-0000-4000-8000-${pad(n)}`;

/** A thread id in the storage's UUID form, stable per index. */
export const aiChatThreadId = (n: number) => `aaaaaaaa-0000-4000-8000-${pad(n)}`;

const DEFAULT_CREATED_AT = "2026-11-18T10:00:00.000Z";

/** A stored user message with one text part. */
export const aiChatUserMessage = (
  text: string,
  {
    id = aiChatMessageId(1),
    createdAt = DEFAULT_CREATED_AT,
  }: { id?: string; createdAt?: string } = {},
): AiChatMessageMock => ({
  id,
  role: "user",
  content: [{ type: "text", text }],
  createdAt,
});

/** A stored assistant message: a text, or its parts (tool calls, text). */
export const aiChatAssistantMessage = (
  reply: string | AiChatContentPart[],
  {
    id = aiChatMessageId(2),
    createdAt = DEFAULT_CREATED_AT,
  }: { id?: string; createdAt?: string } = {},
): AiChatMessageMock => ({
  id,
  role: "assistant",
  content: typeof reply === "string" ? [{ type: "text", text: reply }] : reply,
  createdAt,
});

/** A finished tool call; `result` is stringified as storage keeps it. */
export const aiChatToolCallPart = ({
  toolName,
  args = {},
  result,
  toolCallId = `call-${toolName}`,
}: {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
  toolCallId?: string;
}): AiChatToolCallPart => ({
  type: "tool-call",
  toolCallId,
  toolName,
  args,
  argsText: JSON.stringify(args),
  ...(result === undefined
    ? {}
    : { result: typeof result === "string" ? result : JSON.stringify(result) }),
});

/**
 * The built-in `generate_image` call with its stored result. The engine
 * keeps the picture as an attachment and the result as `{ data: { ref } }`
 * (`persistGeneratedImage`); the reply draws it as a generated image card
 * (`generated-image-card`) once `ai/attachments/get` answers the ref - see
 * {@link aiChatAttachmentsGetHandler}.
 */
export const aiChatGeneratedImagePart = ({
  ref,
  prompt = "A chart",
}: {
  ref: string;
  prompt?: string;
}) =>
  aiChatToolCallPart({
    toolName: "generate_image",
    args: { prompt },
    result: { data: { ref } },
  });

/**
 * ASC.AI.Chat's `document_agent` call with the documents it saved, drawn by
 * ui-kit as created-document cards (`created-document-card`). Its result is
 * `{ data: { summary, files: [{ id, title, fileExst?, ... }] } }`.
 */
export const aiChatCreatedDocumentPart = ({
  files,
  task = "Write the document",
  summary = "The document is ready.",
}: {
  files: { id: number; title: string; fileExst?: string; folderId?: number }[];
  task?: string;
  summary?: string;
}) =>
  aiChatToolCallPart({
    toolName: "document_agent",
    args: { task },
    result: { data: { summary, files } },
  });

/**
 * The snapshots a reply streams through: each tool call first without its
 * result, then with it, and the closing text in two halves - what the engine
 * yields as `message-start` / `message-delta`, every one the whole message so
 * far.
 */
const replySnapshots = (content: AiChatContentPart[]) => {
  const snapshots: AiChatContentPart[][] = [];
  const done: AiChatContentPart[] = [];

  content.forEach((part) => {
    if (part.type === "tool-call" && part.result !== undefined) {
      const running: AiChatToolCallPart = { ...part };
      delete running.result;
      snapshots.push(done.concat([running]));
    } else if (part.type === "text" && part.text.length > 1) {
      const half = part.text.slice(0, Math.ceil(part.text.length / 2));
      snapshots.push(done.concat([{ type: "text", text: half }]));
    }
    done.push(part);
    snapshots.push(done.slice());
  });

  return snapshots;
};

/**
 * The events of one successful round, in the order the engine yields them
 * (`AIEngine.sendWithStream`, `stream.ts`):
 *
 * - a new thread (`title` given): `thread-title` with the placeholder title,
 *   `user-message-stored`, the reply, then `thread-title` with the real one;
 * - an existing thread: `user-message-stored`, then the reply.
 *
 * The reply is `message-start`, `message-delta`s and `message-end`, each
 * carrying the whole message so far under the stored `messageId`.
 *
 * On its own this suits `aiChatSendWithStreamHandler`; a new thread then also
 * needs `threads/get-by-id` to answer it (`aiChatThreadGetByIdHandler`), as
 * the library reads it on `thread-title`. {@link aiChatThreadsHandlers}
 * builds these events itself and keeps every read consistent.
 */
export const aiChatReplyEvents = ({
  threadId,
  userMessage,
  reply,
  title,
  profileId,
}: {
  threadId: string;
  /** The stored user message of the round. */
  userMessage: AiChatMessageMock;
  /** The stored assistant reply. */
  reply: AiChatMessageMock;
  /** Set for a round that creates the thread: its generated title. */
  title?: string;
  profileId?: string;
}): unknown[] => {
  const events: unknown[] = [];
  const titleEvent = (value: string) => ({
    type: "thread-title",
    threadId,
    title: value,
    ...(profileId ? { profileId } : {}),
  });

  if (title !== undefined) events.push(titleEvent(AI_CHAT_PLACEHOLDER_TITLE));

  events.push({
    type: "user-message-stored",
    message: userMessage,
    messageId: userMessage.id,
  });

  const snapshots = replySnapshots(reply.content);
  snapshots.forEach((content, index) => {
    events.push({
      type: index === 0 ? "message-start" : "message-delta",
      message: { ...reply, content },
      messageId: reply.id,
    });
  });
  events.push({ type: "message-end", message: reply, messageId: reply.id });

  if (title !== undefined) events.push(titleEvent(title));

  return events;
};

const ndjson = (events: unknown[]) =>
  new HttpResponse(`${events.map((event) => JSON.stringify(event)).join("\n")}\n`, {
    headers: { "Content-Type": "application/x-ndjson" },
  });

const scopeOf = (agentId: number | string | undefined | null) =>
  agentId === undefined || agentId === null || agentId === ""
    ? ""
    : String(agentId);

const toThreadDto = (thread: AiChatThreadMock) => ({
  threadId: thread.threadId,
  title: thread.title,
  lastEditDate: thread.lastEditDate,
  ...(thread.profileId ? { profileId: thread.profileId } : {}),
});

const parseJson = (value: string | null): unknown => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const parseCount = (value: string | null) => {
  const count = value ? parseInt(value, 10) : NaN;
  return Number.isNaN(count) ? undefined : count;
};

/** Newest first, as the storage pages threads. */
const compareThreads = (a: AiChatThreadMock, b: AiChatThreadMock) => {
  const byDate = (b.lastEditDate ?? 0) - (a.lastEditDate ?? 0);
  if (byDate !== 0) return byDate;
  if (a.threadId === b.threadId) return 0;
  return a.threadId < b.threadId ? 1 : -1;
};

/** Oldest first, as the storage orders messages. */
const compareMessages = (a: AiChatMessageMock, b: AiChatMessageMock) => {
  const byDate = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  if (byDate !== 0) return byDate;
  if (a.id === b.id) return 0;
  return a.id < b.id ? -1 : 1;
};

const textOf = (message: { content: unknown }) => {
  if (typeof message.content === "string") return message.content;
  if (!Array.isArray(message.content)) return "";
  return message.content
    .map((part: { type?: string; text?: string }) =>
      part?.type === "text" && typeof part.text === "string" ? part.text : "",
    )
    .join(" ")
    .trim();
};

export type AiChatThreadsMockOptions = {
  /** The stored conversations, of every scope. Copied, never mutated. */
  threads?: AiChatThreadMock[];
  /**
   * The assistant's answer to a round. A function gets the request, e.g. to
   * answer by the agent (`entityId`) or the text sent.
   */
  reply?: AiChatReplyMock | ((request: AiChatSendRequest) => AiChatReplyMock);
  /** Filled with every request answered; see {@link aiChatRequestLog}. */
  log?: AiChatRequestLog;
};

/**
 * The conversations of the chat and a successful round over them, from one
 * in-memory storage:
 *
 * - `threads/list` lists the threads of the requested scope only - the
 *   agent's when `entityId` is sent, else those of no agent - newest first,
 *   honouring `count`, `cursor` and `query` (a title search);
 * - `threads/get-by-id` answers a known thread, 404 otherwise;
 * - `threads/read-messages` pages its messages (`count`, `cursor`,
 *   `direction`), 400 without a `threadId`;
 * - `threads/touch` bumps a thread;
 * - `ai/send-with-stream` stores the user message and the `reply` and
 *   streams them (see {@link aiChatReplyEvents}). Without a `threadId` it
 *   creates the thread in the request's `entityId` scope, titled
 *   `reply.title` or the user's text, so it is listed in that history and
 *   readable at once.
 *
 * Use it after `aiChatStoreHandlers` (it overrides their empty thread list):
 *
 * ```ts
 * const log = aiChatRequestLog();
 * mockRequest.use(
 *   ...aiChatStoreHandlers(TEST_PORT),
 *   ...aiChatThreadsHandlers(TEST_PORT, {
 *     threads: [{ threadId: aiChatThreadId(1), title: "NDA review", agentId: 777001,
 *       messages: [aiChatUserMessage("Term?"), aiChatAssistantMessage("Two years.")] }],
 *     reply: { text: "Done.", title: "Summary" },
 *     log,
 *   }),
 * );
 * // ... then e.g. expect(log.send[0].entityId).toBe("777001")
 * ```
 */
export const aiChatThreadsHandlers = (
  port: string,
  { threads = [], reply = { text: "OK" }, log }: AiChatThreadsMockOptions = {},
) => {
  const url = (path: string) => `${BASE_URL}:${port}/${API_PREFIX}/ai/${path}`;
  const now = Date.now();

  const stored: AiChatThreadMock[] = threads.map((thread) => ({
    ...thread,
    lastEditDate: thread.lastEditDate ?? now,
    messages: (thread.messages ?? []).slice(),
  }));
  let nextThread = 1000;
  let nextMessage = 1000;

  const find = (threadId: string | null) =>
    threadId ? stored.filter((t) => t.threadId === threadId)[0] : undefined;

  return [
    http.get(url("threads/list"), ({ request }) => {
      const params = new URL(request.url).searchParams;
      const entityId = params.get("entityId") ?? undefined;
      const count = parseCount(params.get("count"));
      const query = params.get("query") ?? undefined;
      const cursor = parseJson(params.get("cursor")) as
        | { lastEditDate: number | null; threadId: string }
        | undefined;
      log?.list.push({ entityId, count, query });

      const scope = scopeOf(entityId);
      let page = stored
        .filter((thread) => scopeOf(thread.agentId) === scope)
        .sort(compareThreads);
      if (query) {
        const needle = query.toLowerCase();
        page = page.filter((t) => t.title.toLowerCase().includes(needle));
      }
      if (cursor) {
        const after: AiChatThreadMock = {
          threadId: cursor.threadId,
          title: "",
          lastEditDate: cursor.lastEditDate ?? 0,
        };
        page = page.filter((thread) => compareThreads(after, thread) < 0);
      }
      if (count !== undefined) page = page.slice(0, count);

      return HttpResponse.json(page.map(toThreadDto));
    }),

    http.get(url("threads/get-by-id"), ({ request }) => {
      const threadId = new URL(request.url).searchParams.get("threadId");
      if (!threadId) {
        return HttpResponse.json({ error: "threadId required" }, { status: 400 });
      }
      log?.getById.push(threadId);
      const thread = find(threadId);
      if (!thread) {
        return HttpResponse.json({ error: "thread not found" }, { status: 404 });
      }
      return HttpResponse.json(toThreadDto(thread));
    }),

    http.get(url("threads/read-messages"), ({ request }) => {
      const params = new URL(request.url).searchParams;
      const threadId = params.get("threadId");
      if (!threadId) {
        return HttpResponse.json({ error: "threadId required" }, { status: 400 });
      }
      const count = parseCount(params.get("count"));
      const direction = params.get("direction") ?? undefined;
      const cursor = parseJson(params.get("cursor")) as
        | { createdAt: string | null; id: string }
        | undefined;
      log?.readMessages.push({ threadId, count, direction });

      const desc = direction === "desc";
      let page = (find(threadId)?.messages ?? []).slice().sort(compareMessages);
      if (desc) page.reverse();
      if (cursor) {
        const after: AiChatMessageMock = {
          id: cursor.id,
          role: "user",
          content: [],
          createdAt: cursor.createdAt ?? new Date(0).toISOString(),
        };
        page = page.filter((message) =>
          desc
            ? compareMessages(message, after) < 0
            : compareMessages(message, after) > 0,
        );
      }
      if (count !== undefined) page = page.slice(0, count);

      return HttpResponse.json(page);
    }),

    http.post(url("threads/touch"), async ({ request }) => {
      const body = (await request.json().catch(() => null)) as unknown;
      // The transport sends several arguments as a positional array.
      const [threadId, profileId] = Array.isArray(body)
        ? (body as string[])
        : [typeof body === "string" ? body : undefined, undefined];
      log?.touch.push({ threadId, profileId });
      const thread = find(threadId ?? null);
      if (thread) thread.lastEditDate = Date.now();
      return HttpResponse.json({ success: true });
    }),

    http.post(url("ai/send-with-stream"), async ({ request }) => {
      const body = (await request.json()) as AiChatSendRequest;
      log?.send.push(body);

      const answer = typeof reply === "function" ? reply(body) : reply;
      const userText = textOf(body.userMessage);

      let thread = find(body.threadId ?? null);
      let title: string | undefined;
      if (!thread) {
        nextThread += 1;
        title = answer.title ?? (userText || AI_CHAT_PLACEHOLDER_TITLE);
        thread = {
          threadId: body.threadId ?? aiChatThreadId(nextThread),
          title,
          profileId: body.profileId,
          agentId: body.entityId,
          messages: [],
        };
        stored.push(thread);
      }

      const at = Date.now();
      nextMessage += 1;
      const userMessage: AiChatMessageMock = {
        id: aiChatMessageId(nextMessage),
        role: "user",
        content: Array.isArray(body.userMessage.content)
          ? (body.userMessage.content as AiChatContentPart[])
          : [{ type: "text", text: userText }],
        createdAt: new Date(at).toISOString(),
      };
      nextMessage += 1;
      const assistant = aiChatAssistantMessage(
        answer.content ?? answer.text ?? "",
        {
          id: aiChatMessageId(nextMessage),
          createdAt: new Date(at + 1).toISOString(),
        },
      );

      thread.messages = (thread.messages ?? []).concat([userMessage, assistant]);
      thread.lastEditDate = at;

      return ndjson(
        aiChatReplyEvents({
          threadId: thread.threadId,
          userMessage,
          reply: assistant,
          title,
          profileId: body.profileId,
        }),
      );
    }),
  ];
};

/**
 * `POST ai/attachments/get` - the stored attachments by id, e.g. the picture
 * behind {@link aiChatGeneratedImagePart}'s `ref`; `null` for an unknown id,
 * as the storage answers. The transport sends the id as the bare JSON body.
 */
export const aiChatAttachmentsGetHandler = (
  port: string,
  attachments: Record<string, { title: string; base64: string }>,
) =>
  http.post(
    `${BASE_URL}:${port}/${API_PREFIX}/ai/attachments/get`,
    async ({ request }) => {
      const body = (await request.json().catch(() => null)) as unknown;
      const id = Array.isArray(body)
        ? body[0]
        : body && typeof body === "object"
          ? (body as { id?: unknown }).id
          : body;
      if (typeof id !== "string" || !id) {
        return HttpResponse.json({ error: "id is required" }, { status: 400 });
      }
      const record = attachments[id];
      if (!record) return HttpResponse.json(null);
      return HttpResponse.json({
        id,
        kind: "image",
        source: "tool",
        title: record.title,
        base64: record.base64,
        createdAt: Date.parse(DEFAULT_CREATED_AT),
      });
    },
  );
