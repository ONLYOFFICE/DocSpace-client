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

import {
  createAIAgent,
  deleteAIAgent,
  deleteChat,
  editAIAgent,
  getAIAgents,
  getChats,
} from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";

import type { AgentConfig } from "./agentConfig";
import { buildArbiterAgentPrompt } from "./buildArbiterAgentPrompt";
import { buildExpertPrompt } from "./buildExpertPrompt";
import {
  TAG_ARBITER,
  TAG_EXPERT,
  TAG_WIZARD,
  arbiterTags,
  expertTags,
  extractSessionId,
  isArbiterTag,
  isExpertTag,
  sessionTag,
  wizardTags,
} from "./tags";
import {
  WIZARD_SYSTEM_PROMPT,
  buildWizardSystemPrompt,
  type WizardPromptModel,
} from "./wizardPrompt";

const WIZARD_TITLE = "AI Arbiter Setup Wizard";
const TITLE_MAX = 170;

export type DefaultProviderRef = {
  providerId: number;
  modelId: string;
  modelAlias?: string;
};

export type AgentModelRef = DefaultProviderRef;

export type ProvisionContext = {
  userId: string;
  defaultProvider: DefaultProviderRef;
  availableModels?: ReadonlyArray<WizardPromptModel>;
  expertModels?: AgentModelRef[];
  arbiterModel?: AgentModelRef;
  signal?: AbortSignal;
  onProgress?: (progress: ProvisionProgress) => void;
};

export type ProvisionProgress =
  | { type: "create_expert"; index: number; total: number; title: string }
  | { type: "expert_created"; index: number; agentId: number }
  | { type: "create_arbiter"; title: string }
  | { type: "arbiter_created"; agentId: number }
  | { type: "rollback"; reason: string; deletedIds: number[] };

export type ProvisionResult = {
  sessionId: string;
  expertIds: number[];
  arbiterAgentId: number;
};

export type ActivePanel = {
  sessionId: string;
  arbiter: TAgent;
  experts: TAgent[];
};

function truncateTitle(s: string): string {
  return s.length <= TITLE_MAX ? s : `${s.slice(0, TITLE_MAX - 1)}…`;
}

function makeAgentFilter(tag: string, userId: string): RoomsFilter {
  const f = RoomsFilter.getDefault();
  f.searchArea = RoomSearchArea.AIAgents;
  f.tags = [tag];
  f.subjectId = userId;
  f.pageCount = 100;
  return f;
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function findWizardAgent(
  userId: string,
): Promise<TAgent | null> {
  const filter = makeAgentFilter(TAG_WIZARD, userId);
  const res = await getAIAgents(filter);
  return res.folders[0] ?? null;
}

export async function findActivePanel(
  userId: string,
): Promise<ActivePanel | null> {
  const arbiterFilter = makeAgentFilter(TAG_ARBITER, userId);
  const arbiterRes = await getAIAgents(arbiterFilter);
  const arbiter = arbiterRes.folders[0];
  if (!arbiter) return null;

  const sid = extractSessionId(arbiter.tags);
  if (!sid) return null;

  const sessionFilter = makeAgentFilter(sessionTag(sid), userId);
  const sessionRes = await getAIAgents(sessionFilter);
  const experts: TAgent[] = [];
  for (const a of sessionRes.folders) {
    if (a.id === arbiter.id) continue;
    if (a.tags?.some(isExpertTag)) experts.push(a);
  }
  return { sessionId: sid, arbiter, experts };
}

export async function ensureWizardAgent(
  ctx: ProvisionContext,
): Promise<TAgent> {
  const existing = await findWizardAgent(ctx.userId);

  const effectivePrompt = ctx.availableModels
    ? buildWizardSystemPrompt(ctx.availableModels)
    : WIZARD_SYSTEM_PROMPT;

  if (existing) {
    if (existing.chatSettings?.prompt !== effectivePrompt) {
      try {
        const updated = await editAIAgent(existing.id, {
          chatSettings: {
            providerId: ctx.defaultProvider.providerId,
            modelId: ctx.defaultProvider.modelId,
            prompt: effectivePrompt,
          },
        });
        await clearWizardChats(updated.id);
        return updated;
      } catch (err) {
        console.warn("Failed to refresh wizard prompt", err);
        return existing;
      }
    }
    return existing;
  }

  return createAIAgent({
    title: WIZARD_TITLE,
    tags: wizardTags(),
    attachDefaultTools: false,
    chatSettings: {
      providerId: ctx.defaultProvider.providerId,
      modelId: ctx.defaultProvider.modelId,
      prompt: effectivePrompt,
    },
  });
}

async function clearWizardChats(wizardAgentId: number): Promise<void> {
  try {
    const list = await getChats(wizardAgentId, 0, 100);
    if (!list?.items?.length) return;
    await Promise.allSettled(list.items.map((c) => deleteChat(c.id)));
  } catch (err) {
    console.warn("Failed to clear wizard chat history", err);
  }
}

export async function provisionPanel(
  config: AgentConfig,
  ctx: ProvisionContext,
): Promise<ProvisionResult> {
  const sessionId = generateSessionId();
  const created: number[] = [];

  const checkAborted = () => {
    if (ctx.signal?.aborted) {
      throw new DOMException("Provisioning aborted", "AbortError");
    }
  };

  const buildCtx = { domain: config.domain, tone: config.tone };

  try {
    const expertIds: number[] = [];
    for (let i = 0; i < config.experts.length; i++) {
      checkAborted();
      const expert = config.experts[i];
      const expertModel = ctx.expertModels?.[i] ?? ctx.defaultProvider;
      ctx.onProgress?.({
        type: "create_expert",
        index: i,
        total: config.experts.length,
        title: expert.role_title,
      });
      const agent = await createAIAgent({
        title: truncateTitle(expert.role_title),
        tags: expertTags(sessionId),
        attachDefaultTools: false,
        chatSettings: {
          providerId: expertModel.providerId,
          modelId: expertModel.modelId,
          prompt: buildExpertPrompt(expert, buildCtx),
        },
      });
      created.push(agent.id);
      expertIds.push(agent.id);
      ctx.onProgress?.({ type: "expert_created", index: i, agentId: agent.id });
    }

    checkAborted();
    const arbiterTitle = truncateTitle(`Arbiter — ${config.domain}`);
    ctx.onProgress?.({ type: "create_arbiter", title: arbiterTitle });
    const arbiterModel = ctx.arbiterModel ?? ctx.defaultProvider;
    const arbiter = await createAIAgent({
      title: arbiterTitle,
      tags: arbiterTags(sessionId),
      attachDefaultTools: true,
      chatSettings: {
        providerId: arbiterModel.providerId,
        modelId: arbiterModel.modelId,
        prompt: buildArbiterAgentPrompt(config.arbiter, buildCtx),
      },
    });
    created.push(arbiter.id);
    ctx.onProgress?.({ type: "arbiter_created", agentId: arbiter.id });

    return { sessionId, expertIds, arbiterAgentId: arbiter.id };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    await rollbackCreated(created);
    ctx.onProgress?.({ type: "rollback", reason, deletedIds: created });
    throw err;
  }
}

async function rollbackCreated(ids: number[]): Promise<void> {
  await Promise.allSettled(ids.map((id) => deleteAIAgent(id)));
}

export async function tearDownPanel(
  sessionId: string,
  userId: string,
): Promise<void> {
  const filter = makeAgentFilter(sessionTag(sessionId), userId);
  const res = await getAIAgents(filter);
  await Promise.allSettled(res.folders.map((a) => deleteAIAgent(a.id)));
}

export async function cleanupOrphanAgents(userId: string): Promise<number> {
  const [expertRes, arbiterRes] = await Promise.all([
    getAIAgents(makeAgentFilter(TAG_EXPERT, userId)),
    getAIAgents(makeAgentFilter(TAG_ARBITER, userId)),
  ]);
  const orphans = [...expertRes.folders, ...arbiterRes.folders];
  if (orphans.length === 0) return 0;
  await Promise.allSettled(orphans.map((a) => deleteAIAgent(a.id)));
  return orphans.length;
}

export type ActivePanelOf<T> = {
  sessionId: string;
  arbiter: T;
  experts: T[];
};

type TaggedAgentLike = { id: number; tags?: string[] };

export function selectActivePanel<T extends TaggedAgentLike>(
  agents: T[],
): ActivePanelOf<T> | null {
  const arbiter = agents.find((a) => a.tags?.some(isArbiterTag));
  if (!arbiter) return null;

  const sid = extractSessionId(arbiter.tags);
  if (!sid) return null;

  const sTag = sessionTag(sid);
  const experts = agents.filter(
    (a) =>
      a.id !== arbiter.id &&
      a.tags?.some(isExpertTag) &&
      a.tags?.some((t) => t === sTag),
  );

  return { sessionId: sid, arbiter, experts };
}
