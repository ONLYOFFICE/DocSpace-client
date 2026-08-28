import { describe, expect, it, vi } from "vitest";

import type { SseEvent } from "@/types/arbiter";

import { type AgentApi, createAgentThread, streamAgentChat } from "./agentStream";

type ChatEvent = { type: string; message?: unknown; messageId?: string };

const textMessage = (text: string, extra: unknown[] = []) => ({
  role: "assistant",
  content: [{ type: "text", text }, ...extra],
});

async function* events(list: ChatEvent[]) {
  for (const ev of list) yield ev;
}

function makeApi(list: ChatEvent[]) {
  const sendWithStream = vi.fn((_input: unknown) => events(list));
  const saveFile = vi.fn(async (_input: unknown, _entityId?: string) => ({
    id: "att-1",
    kind: "file",
  }));
  const create = vi.fn(async (_input: unknown) => ({ threadId: "thread-1" }));
  const api = {
    ai: { sendWithStream },
    attachments: { saveFile },
    threads: { create },
  } as unknown as AgentApi;
  return { api, sendWithStream, saveFile, create };
}

async function collect(gen: AsyncGenerator<SseEvent>) {
  const out: SseEvent[] = [];
  for await (const ev of gen) out.push(ev);
  return out;
}

describe("streamAgentChat", () => {
  it("maps growing message snapshots to token deltas and a stop", async () => {
    const { api, sendWithStream } = makeApi([
      { type: "message-start", message: textMessage("") },
      { type: "message-delta", message: textMessage("Hel") },
      { type: "message-delta", message: textMessage("Hello") },
      { type: "message-end", message: textMessage("Hello!"), messageId: "m1" },
    ]);

    const out = await collect(
      streamAgentChat(api, { agentId: 7, message: "hi", threadId: "t1" }),
    );

    expect(out).toEqual([
      { type: "message_start", chatId: "t1" },
      { type: "new_token", text: "Hel" },
      { type: "new_token", text: "lo" },
      { type: "new_token", text: "!" },
      { type: "message_stop", messageId: "m1" },
    ]);

    const input = sendWithStream.mock.calls[0][0] as {
      entityId: string;
      threadId: string;
      userMessage: { content: unknown[] };
    };
    expect(input.entityId).toBe("7");
    expect(input.threadId).toBe("t1");
    expect(input.userMessage.content).toEqual([{ type: "text", text: "hi" }]);
  });

  it("emits reasoning deltas and each tool call once", async () => {
    const call = {
      type: "tool-call",
      toolCallId: "c1",
      toolName: "search",
      args: { q: "x" },
    };
    const { api } = makeApi([
      {
        type: "message-delta",
        message: {
          role: "assistant",
          content: [{ type: "reasoning", text: "think" }, call],
        },
      },
      {
        type: "message-end",
        message: {
          role: "assistant",
          content: [
            { type: "reasoning", text: "thinking" },
            call,
            { type: "text", text: "done" },
          ],
        },
        messageId: "m2",
      },
    ]);

    const out = await collect(streamAgentChat(api, { agentId: 1, message: "q" }));

    expect(out).toEqual([
      { type: "message_start", chatId: "" },
      { type: "reasoning", text: "think" },
      { type: "tool_call", callId: "c1", name: "search", arguments: { q: "x" } },
      { type: "reasoning", text: "ing" },
      { type: "new_token", text: "done" },
      { type: "message_stop", messageId: "m2" },
    ]);
  });

  it("turns message-incomplete into an error carrying the reason", async () => {
    const { api } = makeApi([
      {
        type: "message-incomplete",
        message: {
          ...textMessage("partial"),
          status: { type: "incomplete", reason: "length" },
        },
      },
    ]);

    const out = await collect(streamAgentChat(api, { agentId: 1, message: "q" }));

    expect(out).toEqual([
      { type: "message_start", chatId: "" },
      { type: "new_token", text: "partial" },
      { type: "error", message: "length" },
    ]);
  });

  it("closes an empty stream with a stop so the panel settles", async () => {
    const { api } = makeApi([]);

    const out = await collect(streamAgentChat(api, { agentId: 1, message: "q" }));

    expect(out).toEqual([
      { type: "message_start", chatId: "" },
      { type: "message_stop", messageId: "" },
    ]);
  });

  it("stops yielding once the signal is aborted", async () => {
    const ac = new AbortController();
    const { api } = makeApi([
      { type: "message-delta", message: textMessage("a") },
      { type: "message-delta", message: textMessage("ab") },
      { type: "message-end", message: textMessage("abc"), messageId: "m" },
    ]);

    const out: SseEvent[] = [];
    for await (const ev of streamAgentChat(api, {
      agentId: 1,
      message: "q",
      signal: ac.signal,
    })) {
      out.push(ev);
      if (ev.type === "new_token") ac.abort();
    }

    expect(out).toEqual([
      { type: "message_start", chatId: "" },
      { type: "new_token", text: "a" },
    ]);
  });

  it("saves the attached file as a draft and references it before the text", async () => {
    const { api, saveFile, sendWithStream } = makeApi([
      { type: "message-end", message: textMessage("ok"), messageId: "m" },
    ]);

    await collect(
      streamAgentChat(api, {
        agentId: 42,
        message: "review",
        file: { id: 555, name: "contract.docx" },
      }),
    );

    expect(saveFile).toHaveBeenCalledWith(
      { path: "555", title: "contract.docx", type: 65, content: "" },
      "42",
    );

    const input = sendWithStream.mock.calls[0][0] as {
      userMessage: { content: { type: string; mimeType?: string }[] };
    };
    const [fileBlock, textBlock] = input.userMessage.content;
    expect(textBlock).toEqual({ type: "text", text: "review" });
    expect(fileBlock.type).toBe("file");
    expect(JSON.parse(fileBlock.mimeType ?? "")).toEqual({
      ref: "att-1",
      title: "contract.docx",
      kind: "file",
      path: "555",
      type: 65,
    });
  });
});

describe("createAgentThread", () => {
  it("creates the thread bound to the agent room", async () => {
    const { api, create } = makeApi([]);

    await expect(createAgentThread(api, 9, "Title", "p1")).resolves.toBe(
      "thread-1",
    );
    expect(create).toHaveBeenCalledWith({
      title: "Title",
      profileId: "p1",
      entityId: "9",
    });
  });
});
