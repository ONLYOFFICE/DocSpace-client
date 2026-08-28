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

"use client";

import { useCallback, useRef } from "react";

import { useApi } from "@docspace/ui-kit/ai-agent/providers";

import type { AgentSummary, AttachedFile, SseEvent } from "@/types/arbiter";
import {
  type AgentApi,
  createAgentThread,
  streamAgentChat,
} from "@/utils/ai-arbiter";
import {
  buildArbiterPrompt,
  type ExpertAnswer,
} from "../_utils/arbiterPrompts";
import { useAiArbiterAgentsStore } from "../_store/AiArbiterAgentsStore";
import { useAiArbiterRunStore } from "../_store/AiArbiterRunStore";

type OnEventFn = (panelId: string, ev: SseEvent) => void;

const THREAD_TITLE_MAX = 120;

const threadTitle = (question: string) =>
  question.length <= THREAD_TITLE_MAX
    ? question
    : `${question.slice(0, THREAD_TITLE_MAX - 1)}...`;

async function* streamInNewThread(
  api: AgentApi,
  agentId: number,
  message: string,
  title: string,
  file: AttachedFile | undefined,
  signal: AbortSignal,
): AsyncGenerator<SseEvent> {
  const threadId = await createAgentThread(api, agentId, title);
  yield* streamAgentChat(api, { agentId, message, threadId, file, signal });
}

async function consumeExpert(
  api: AgentApi,
  panelId: string,
  expert: AgentSummary,
  question: string,
  file: AttachedFile | undefined,
  signal: AbortSignal,
  onEvent: OnEventFn,
): Promise<ExpertAnswer> {
  let text = "";
  let errored = false;

  try {
    for await (const ev of streamInNewThread(
      api,
      expert.id,
      question,
      threadTitle(question),
      file,
      signal,
    )) {
      onEvent(panelId, ev);
      if (ev.type === "new_token") {
        text += ev.text;
      }
    }
  } catch (err) {
    if (!signal.aborted) {
      errored = true;
      onEvent(panelId, {
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { alias: expert.title, modelAlias: expert.modelAlias, text, errored };
}

export default function useArbiterRun() {
  const api = useApi();
  const agentsStore = useAiArbiterAgentsStore();
  const runStore = useAiArbiterRunStore();
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    const { experts, arbiter } = agentsStore;
    if (!arbiter || experts.length === 0) return;

    const question = runStore.question.trim();
    if (!question) return;

    const file = runStore.attachedFile ?? undefined;

    runStore.initPanels(experts, arbiter);
    runStore.setRunStatus("running");

    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    const onEvent = runStore.applyEvent.bind(runStore);

    try {
      const expertAnswers = await Promise.all(
        experts.map((expert, i) =>
          consumeExpert(
            api,
            `expert-${i}`,
            expert,
            question,
            file,
            signal,
            onEvent,
          ),
        ),
      );

      if (signal.aborted) return;

      const arbiterPrompt = buildArbiterPrompt(
        question,
        expertAnswers,
        file,
      );

      for await (const ev of streamInNewThread(
        api,
        arbiter.id,
        arbiterPrompt,
        threadTitle(question),
        file,
        signal,
      )) {
        if (signal.aborted) break;
        runStore.applyEvent("arbiter", ev);
      }

      if (!signal.aborted) {
        runStore.setRunStatus("done");
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error("Arbiter run failed", err);
        runStore.setRunStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [api, agentsStore, runStore]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    runStore.abortAll();
  }, [runStore]);

  return { run, stop };
}
