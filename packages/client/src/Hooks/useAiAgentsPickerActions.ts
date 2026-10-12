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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getAIAgent, getAIAgents } from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import type { ProfilePickerAction } from "@onlyoffice/apps-ui-kit/ai-agent/providers";
import SocketHelper, {
  SocketEvents,
  type TOptSocket,
} from "@onlyoffice/apps-ui-kit/utils/socket";

// TODO: temporary hardcoded label, no i18n at this stage by design.
const CHOOSE_AI_AGENT_LABEL = "Choose AI Agent";

// Same cap as FilesStore.fetchAgents — the agents view never pages past 100.
const AGENTS_PAGE_COUNT = 100;

// Socket-driven reloads are coalesced over this window: one agent change
// (create with its logo, a bulk delete) lands as several events, and every
// reload costs a list request plus one detail request per agent.
const AGENTS_RELOAD_DELAY_MS = 300;

const sameId = (a: unknown, b: unknown): boolean =>
  a !== undefined && a !== null && b !== null && String(a) === String(b);

const parseData = (opt: TOptSocket): { parentId?: number | string } | null => {
  if (!opt.data) return null;
  try {
    const parsed: unknown = JSON.parse(opt.data);
    return parsed && typeof parsed === "object"
      ? (parsed as { parentId?: number | string })
      : null;
  } catch {
    return null;
  }
};

/**
 * Agent picked in the model picker (or restored from a thread), in the
 * shape the chat host needs. `profileId`/`title` may be absent when the
 * agent is restored from a thread but no longer resolvable in the agents
 * list — the request context still targets `entityId`, while the picker
 * alias is skipped.
 */
export type TPickedAgent = {
  /** Agent room id — the request context scope (contextEntityId). */
  entityId: string;
  /** The agent's bound AI profile — drives the picker alias. */
  profileId?: string;
  /** Agent title — displayed as the picker value instead of the profile. */
  title?: string;
};

/**
 * Loads the AI agents list (each time `enabled` turns true) and builds the
 * "Choose AI Agent" entry for the chat model picker (`actions` is empty until
 * the first load and when no agent has a bound profile — picking an agent is a
 * distinct action even with a single one, since it also switches the request
 * context to the agent's room). `getAgentByRoomId` resolves a loaded agent by
 * its room id — used to restore the picked agent from a thread's persisted
 * context.
 *
 * The list is reloaded, rather than loaded once, on two signals:
 * - `enabled` turning true again. Agents are created, edited and deleted in
 *   the AI Agents section, where the side chat is unavailable, so leaving it
 *   is the moment the picker must catch up.
 * - a socket change to an agent while the chat is available (another user,
 *   another tab, a restore from Trash). The AI Agents root is one of the tree
 *   folders, whose parts TreeFoldersStore keeps subscribed for the whole
 *   session, so the hook only listens — it never subscribes or unsubscribes.
 */
export const useAiAgentsPickerActions = (
  enabled: boolean,
  onAgentPick: (agent: TPickedAgent) => void,
): {
  actions: ProfilePickerAction[];
  getAgentByRoomId: (roomId: string) => TPickedAgent | null;
} => {
  const [agents, setAgents] = useState<TAgent[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Where the socket handler looks for agent events: the AI Agents root
  // (a created or restored agent) and the agents already listed (an update or
  // a delete, whose payload may not carry the parent).
  const agentsRootId = useRef<string | null>(null);
  const agentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return undefined;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const handle = (opt?: TOptSocket) => {
      if (!opt || opt.type !== "folder") return;
      const data = parseData(opt);
      const isAgent =
        sameId(data?.parentId, agentsRootId.current) ||
        (opt.id !== undefined && agentIds.current.has(String(opt.id)));
      if (!isAgent) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        setReloadKey((key) => key + 1);
      }, AGENTS_RELOAD_DELAY_MS);
    };

    SocketHelper?.on(SocketEvents.ModifyFolder, handle);

    return () => {
      SocketHelper?.off(SocketEvents.ModifyFolder, handle);
      if (timer) clearTimeout(timer);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const controller = new AbortController();
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AIAgents);
    filter.pageCount = AGENTS_PAGE_COUNT;

    getAIAgents(filter, controller.signal)
      .then(async (data) => {
        if (data.current?.id !== undefined) {
          agentsRootId.current = String(data.current.id);
        }
        // The list response never carries `profileId` — the new-ai service
        // injects it only into GET /new-ai/agents/:id (see EditAgentEvent) —
        // so each agent's details are fetched and the id merged in.
        const detailed = await Promise.all(
          data.folders.map((agent) =>
            getAIAgent(agent.id)
              .then((full) => ({ ...agent, profileId: full?.profileId }))
              // Non-fatal: an agent without the new-ai binding just stays
              // non-pickable, matching the edit dialog's behavior.
              .catch(() => agent),
          ),
        );
        // The detail requests take no signal, so a load superseded while
        // they were in flight must not overwrite the newer list.
        if (controller.signal.aborted) return;
        agentIds.current = new Set(detailed.map((agent) => String(agent.id)));
        setAgents(detailed);
      })
      .catch(() => {
        // The menu entry is optional — swallow the error (incl. aborts) and
        // keep the last loaded list; the next reload signal retries.
      });

    return () => controller.abort();
  }, [enabled, reloadKey]);

  const actions = useMemo<ProfilePickerAction[]>(() => {
    // Only agents bound to an AI profile are pickable — selecting an agent
    // switches the chat to its profile (displayed under the agent's name).
    const pickable = (agents ?? []).flatMap((agent) =>
      agent.profileId ? [{ agent, profileId: agent.profileId }] : [],
    );
    if (pickable.length === 0) return [];

    return [
      {
        id: "choose-ai-agent",
        text: CHOOSE_AI_AGENT_LABEL,
        items: pickable.map(({ agent, profileId }) => ({
          id: String(agent.id),
          text: agent.title,
          profileId,
          onClick: () =>
            onAgentPick({
              entityId: String(agent.id),
              profileId,
              title: agent.title,
            }),
        })),
      },
    ];
  }, [agents, onAgentPick]);

  const getAgentByRoomId = useCallback(
    (roomId: string): TPickedAgent | null => {
      const agent = agents?.find((a) => String(a.id) === roomId);
      if (!agent) return null;
      return {
        entityId: roomId,
        profileId: agent.profileId,
        title: agent.title,
      };
    },
    [agents],
  );

  return { actions, getAgentByRoomId };
};
