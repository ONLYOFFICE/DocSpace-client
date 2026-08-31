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

import type { useApi } from "@docspace/ui-kit/ai-agent/providers";
import { getOnlyofficeFileType } from "@docspace/ui-kit/ai-agent/providers/files/file-type";

import type { AttachedFile, SseEvent } from "@/types/arbiter";

export type AgentApi = ReturnType<typeof useApi>;

type StreamInput = Parameters<AgentApi["ai"]["sendWithStream"]>[0];
type StreamMessage = StreamInput["userMessage"];
type StreamContent = Exclude<StreamMessage["content"], string>;

export type AgentStreamInput = {
  agentId: number | string;
  message: string;
  threadId?: string;
  profileId?: string;
  file?: AttachedFile;
  signal?: AbortSignal;
};

const buildFileRefBlock = (
  attachmentId: string,
  file: AttachedFile,
  type: number,
): StreamContent[number] => ({
  type: "file",
  mimeType: JSON.stringify({
    ref: attachmentId,
    title: file.name,
    kind: "file",
    path: String(file.id),
    type,
  }),
  data: "",
});

async function buildMessageContent(
  api: AgentApi,
  input: AgentStreamInput,
): Promise<StreamContent> {
  const text: StreamContent[number] = { type: "text", text: input.message };
  if (!input.file) return [text];

  const type = getOnlyofficeFileType(input.file.name);
  const record = await api.attachments.saveFile(
    {
      path: String(input.file.id),
      title: input.file.name,
      type,
      content: "",
    },
    String(input.agentId),
  );

  return [buildFileRefBlock(record.id, input.file, type), text];
}

type MessageParts = {
  text: string;
  reasoning: string;
  toolCalls: { callId: string; name: string; arguments: unknown }[];
};

const collectParts = (message: StreamMessage): MessageParts => {
  const parts: MessageParts = { text: "", reasoning: "", toolCalls: [] };
  const content = message.content;

  if (typeof content === "string") {
    parts.text = content;
    return parts;
  }

  for (const part of content) {
    if (part.type === "text") parts.text += part.text;
    else if (part.type === "reasoning") parts.reasoning += part.text;
    else if (part.type === "tool-call")
      parts.toolCalls.push({
        callId: part.toolCallId ?? `${part.toolName}-${parts.toolCalls.length}`,
        name: part.toolName,
        arguments: part.args ?? part.argsText,
      });
  }

  return parts;
};

const incompleteReason = (message: StreamMessage): string => {
  const status = (message as { status?: unknown }).status as
    | { type?: string; reason?: string; error?: unknown }
    | undefined;
  if (!status) return "incomplete";
  if (status.error instanceof Error) return status.error.message;
  if (typeof status.error === "string" && status.error) return status.error;
  return status.reason ?? status.type ?? "incomplete";
};

export async function createAgentThread(
  api: AgentApi,
  agentId: number | string,
  title: string,
  profileId?: string,
): Promise<string> {
  const thread = await api.threads.create({
    title,
    profileId,
    entityId: String(agentId),
  });
  return thread.threadId;
}

export async function* streamAgentChat(
  api: AgentApi,
  input: AgentStreamInput,
): AsyncGenerator<SseEvent> {
  const content = await buildMessageContent(api, input);
  if (input.signal?.aborted) return;

  const events = api.ai.sendWithStream({
    threadId: input.threadId,
    entityId: String(input.agentId),
    profileId: input.profileId,
    userMessage: { role: "user", content },
    actionArgs: { signal: input.signal },
  });

  let started = false;
  let text = "";
  let reasoning = "";
  const seenToolCalls = new Set<string>();

  const emitStart = function* (): Generator<SseEvent> {
    if (started) return;
    started = true;
    yield { type: "message_start", chatId: input.threadId ?? "" };
  };

  const emitDeltas = function* (message: StreamMessage): Generator<SseEvent> {
    const parts = collectParts(message);

    if (parts.reasoning.length > reasoning.length) {
      yield { type: "reasoning", text: parts.reasoning.slice(reasoning.length) };
      reasoning = parts.reasoning;
    }
    if (parts.text.length > text.length) {
      yield { type: "new_token", text: parts.text.slice(text.length) };
      text = parts.text;
    }
    for (const call of parts.toolCalls) {
      if (seenToolCalls.has(call.callId)) continue;
      seenToolCalls.add(call.callId);
      yield { type: "tool_call", ...call };
    }
  };

  for await (const event of events) {
    if (input.signal?.aborted) return;

    switch (event.type) {
      case "message-start":
      case "message-delta":
        yield* emitStart();
        yield* emitDeltas(event.message);
        break;
      case "message-end":
        yield* emitStart();
        yield* emitDeltas(event.message);
        yield { type: "message_stop", messageId: event.messageId };
        return;
      case "message-incomplete":
        yield* emitStart();
        yield* emitDeltas(event.message);
        yield { type: "error", message: incompleteReason(event.message) };
        return;
      default:
        break;
    }
  }

  yield* emitStart();
  yield { type: "message_stop", messageId: "" };
}
