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

import { useCallback, useRef, useState } from "react";

import {
  extractWizardConfig,
  streamContinueChat,
  streamStartChat,
  type AgentConfig,
} from "@/utils/ai-arbiter";

export type ChatMessage = {
  id: string;
  role: "user" | "wizard";
  text: string;
  status: "streaming" | "done" | "error";
  hidden?: boolean;
  pendingConfig?: boolean;
  error?: string;
};

export type UseWizardChatParams = {
  wizardAgentId: number | null;
  onConfigDetected: (config: AgentConfig) => void;
};

export type UseWizardChat = {
  messages: ChatMessage[];
  isStreaming: boolean;
  send: (text: string, options?: { hidden?: boolean }) => Promise<void>;
  abort: () => void;
  reset: () => void;
};

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function looksLikeFinalConfig(text: string): boolean {
  const trimmed = text.trimStart();
  if (trimmed.length < 1) return false;
  return (
    trimmed.startsWith("```json") ||
    trimmed.startsWith("```\n{") ||
    trimmed.startsWith("{")
  );
}

export function useWizardChat(params: UseWizardChatParams): UseWizardChat {
  const { wizardAgentId } = params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const chatIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isStreamingRef = useRef(false);

  const onConfigDetectedRef = useRef(params.onConfigDetected);
  onConfigDetectedRef.current = params.onConfigDetected;

  const send = useCallback(
    async (text: string, options?: { hidden?: boolean }) => {
      if (!wizardAgentId) return;
      if (isStreamingRef.current) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        text,
        status: "done",
        hidden: options?.hidden,
      };
      const wizardMsgId = makeId();
      const wizardMsg: ChatMessage = {
        id: wizardMsgId,
        role: "wizard",
        text: "",
        status: "streaming",
      };

      setMessages((prev) => [...prev, userMsg, wizardMsg]);
      isStreamingRef.current = true;
      setIsStreaming(true);

      const ac = new AbortController();
      abortRef.current = ac;

      let accumulated = "";

      try {
        const stream = chatIdRef.current
          ? streamContinueChat(chatIdRef.current, text, [], ac.signal)
          : streamStartChat(wizardAgentId, text, [], ac.signal);

        for await (const ev of stream) {
          if (ac.signal.aborted) break;

          switch (ev.type) {
            case "message_start":
              chatIdRef.current = ev.chatId;
              break;
            case "new_token": {
              accumulated += ev.text;
              const pendingConfig = looksLikeFinalConfig(accumulated);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === wizardMsgId
                    ? { ...m, text: accumulated, pendingConfig }
                    : m,
                ),
              );
              break;
            }
            case "message_stop": {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === wizardMsgId ? { ...m, status: "done" } : m,
                ),
              );
              const result = extractWizardConfig(accumulated);
              if (result.ok) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === wizardMsgId ? { ...m, hidden: true } : m,
                  ),
                );
                onConfigDetectedRef.current(result.config);
              }
              break;
            }
            case "error":
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === wizardMsgId
                    ? { ...m, status: "error", error: ev.message }
                    : m,
                ),
              );
              break;
            default:
              break;
          }
        }
      } catch (err) {
        const isAbort =
          err instanceof DOMException && err.name === "AbortError";
        if (!isAbort) {
          const msg = err instanceof Error ? err.message : String(err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === wizardMsgId
                ? { ...m, status: "error", error: msg }
                : m,
            ),
          );
        }
      } finally {
        if (abortRef.current === ac) abortRef.current = null;
        isStreamingRef.current = false;
        setIsStreaming(false);
      }
    },
    [wizardAgentId],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    chatIdRef.current = null;
    isStreamingRef.current = false;
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, abort, reset };
}
