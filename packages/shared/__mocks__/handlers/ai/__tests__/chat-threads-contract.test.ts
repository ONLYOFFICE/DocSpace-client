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

// CONTRACT TESTS: the conversations of the chat and a successful round, as
// ASC.AI.Chat answers the chat library (threads/list, get-by-id,
// read-messages, ai/send-with-stream). See
// privacyroom/__tests__/contract.test.ts for the rationale.

import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";

import { setupServer } from "../../../e2e/msw-compat";
import { BASE_URL, API_PREFIX } from "../../../e2e/utils";
import {
  AI_CHAT_PLACEHOLDER_TITLE,
  aiChatAssistantMessage,
  aiChatGeneratedImagePart,
  aiChatMessageId,
  aiChatRequestLog,
  aiChatThreadId,
  aiChatThreadsHandlers,
  aiChatUserMessage,
} from "../chatThreads";

const PORT = "3303";
const AGENT = 777001;

const api = (path: string, init?: RequestInit) =>
  fetch(`${BASE_URL}:${PORT}/${API_PREFIX}/ai/${path}`, init);

const send = (body: unknown) =>
  api("ai/send-with-stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

const readEvents = async (res: Response) =>
  (await res.text())
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);

const userMessage = (text: string) => ({
  role: "user",
  content: [{ type: "text", text }],
});

const threads = [
  {
    threadId: aiChatThreadId(1),
    title: "NDA review",
    agentId: AGENT,
    lastEditDate: 3000,
    messages: [
      aiChatUserMessage("What is the term?", {
        id: aiChatMessageId(1),
        createdAt: "2026-11-18T10:00:00.000Z",
      }),
      aiChatAssistantMessage("Two years.", {
        id: aiChatMessageId(2),
        createdAt: "2026-11-18T10:00:01.000Z",
      }),
    ],
  },
  { threadId: aiChatThreadId(2), title: "Older", agentId: AGENT, lastEditDate: 1000 },
  { threadId: aiChatThreadId(3), title: "Default chat", lastEditDate: 2000 },
  { threadId: aiChatThreadId(4), title: "Other agent", agentId: 1, lastEditDate: 4000 },
];

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

describe("aiChatThreadsHandlers (mirrors ASC.AI.Chat's threads and round)", () => {
  it("lists the threads of the requested scope only, newest first, without the scope", async () => {
    const log = aiChatRequestLog();
    server.use(...aiChatThreadsHandlers(PORT, { threads, log }));

    const agent = (await (
      await api(`threads/list?entityId=${AGENT}`)
    ).json()) as Record<string, unknown>[];
    expect(agent.map((t) => t.title)).toEqual(["NDA review", "Older"]);
    expect(agent[0]).not.toHaveProperty("agentId");

    const general = (await (await api("threads/list")).json()) as {
      title: string;
    }[];
    expect(general.map((t) => t.title)).toEqual(["Default chat"]);

    expect(log.list).toEqual([
      { entityId: String(AGENT), count: undefined, query: undefined },
      { entityId: undefined, count: undefined, query: undefined },
    ]);
  });

  it("pages the list by count and cursor and searches by title", async () => {
    server.use(...aiChatThreadsHandlers(PORT, { threads }));

    const first = (await (
      await api(`threads/list?entityId=${AGENT}&count=1`)
    ).json()) as { threadId: string; lastEditDate: number }[];
    expect(first.map((t) => t.threadId)).toEqual([aiChatThreadId(1)]);

    const cursor = encodeURIComponent(
      JSON.stringify({ ...first[0], id: first[0].threadId }),
    );
    const next = (await (
      await api(`threads/list?entityId=${AGENT}&count=1&cursor=${cursor}`)
    ).json()) as { threadId: string }[];
    expect(next.map((t) => t.threadId)).toEqual([aiChatThreadId(2)]);

    const found = (await (
      await api(`threads/list?entityId=${AGENT}&query=nda`)
    ).json()) as { title: string }[];
    expect(found.map((t) => t.title)).toEqual(["NDA review"]);
  });

  it("answers a known thread and 404 for an unknown one", async () => {
    server.use(...aiChatThreadsHandlers(PORT, { threads }));

    const res = await api(`threads/get-by-id?threadId=${aiChatThreadId(1)}`);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ title: "NDA review" });

    expect((await api("threads/get-by-id?threadId=nope")).status).toBe(404);
    expect((await api("threads/get-by-id")).status).toBe(400);
  });

  it("reads the messages in both directions", async () => {
    server.use(...aiChatThreadsHandlers(PORT, { threads }));

    const asc = (await (
      await api(`threads/read-messages?threadId=${aiChatThreadId(1)}`)
    ).json()) as { role: string }[];
    expect(asc.map((m) => m.role)).toEqual(["user", "assistant"]);

    const desc = (await (
      await api(
        `threads/read-messages?threadId=${aiChatThreadId(1)}&count=100&direction=desc`,
      )
    ).json()) as { role: string }[];
    expect(desc.map((m) => m.role)).toEqual(["assistant", "user"]);

    expect((await api("threads/read-messages")).status).toBe(400);
  });

  it("streams a round that creates a thread in the agent's scope and lists it there", async () => {
    const log = aiChatRequestLog();
    server.use(
      ...aiChatThreadsHandlers(PORT, {
        threads,
        reply: { text: "Here is the summary.", title: "Summary" },
        log,
      }),
    );

    const res = await send({
      userMessage: userMessage("Summarize"),
      entityId: String(AGENT),
      profileId: "p1",
    });
    expect(res.headers.get("Content-Type")).toBe("application/x-ndjson");
    const events = await readEvents(res);

    expect(events.map((e) => e.type)).toEqual([
      "thread-title",
      "user-message-stored",
      "message-start",
      "message-delta",
      "message-end",
      "thread-title",
    ]);
    expect(events[0]).toMatchObject({ title: AI_CHAT_PLACEHOLDER_TITLE });
    expect(events[5]).toMatchObject({ title: "Summary", profileId: "p1" });
    const end = events[4] as {
      message: { id: string; content: { text: string }[] };
      messageId: string;
    };
    expect(end.message.content[0].text).toBe("Here is the summary.");
    expect(end.message.id).toBe(end.messageId);

    const threadId = events[0].threadId as string;
    expect((await api(`threads/get-by-id?threadId=${threadId}`)).status).toBe(200);
    const listed = (await (
      await api(`threads/list?entityId=${AGENT}`)
    ).json()) as { threadId: string }[];
    expect(listed[0].threadId).toBe(threadId);
    const general = (await (await api("threads/list")).json()) as {
      threadId: string;
    }[];
    expect(general.map((t) => t.threadId)).not.toContain(threadId);

    const messages = (await (
      await api(`threads/read-messages?threadId=${threadId}`)
    ).json()) as { role: string }[];
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant"]);

    expect(log.send[0]).toMatchObject({ entityId: String(AGENT) });
  });

  it("appends a follow-up to an existing thread without a title event", async () => {
    server.use(...aiChatThreadsHandlers(PORT, { threads, reply: { text: "Yes." } }));

    const events = await readEvents(
      await send({ threadId: aiChatThreadId(1), userMessage: userMessage("Sure?") }),
    );
    expect(events.map((e) => e.type)).not.toContain("thread-title");
    expect(events[0].type).toBe("user-message-stored");

    const messages = (await (
      await api(`threads/read-messages?threadId=${aiChatThreadId(1)}`)
    ).json()) as unknown[];
    expect(messages).toHaveLength(4);
  });

  it("streams a tool call without its result first, then with it", async () => {
    server.use(
      ...aiChatThreadsHandlers(PORT, {
        reply: {
          content: [
            aiChatGeneratedImagePart({ ref: "img-1" }),
            { type: "text", text: "Here it is." },
          ],
        },
      }),
    );

    const events = await readEvents(await send({ userMessage: userMessage("Draw") }));
    const parts = events
      .filter((e) => String(e.type).startsWith("message-"))
      .map((e) => (e.message as { content: { type: string; result?: string }[] }).content);
    expect(parts[0]).toEqual([expect.not.objectContaining({ result: expect.anything() })]);
    expect(parts[1][0].result).toBe(JSON.stringify({ data: { ref: "img-1" } }));
    expect(parts[parts.length - 1]).toHaveLength(2);
  });
});
