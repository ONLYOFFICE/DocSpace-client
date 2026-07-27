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

import { getNewAiAgent, getNewAiAgents } from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomSearchArea } from "@docspace/shared/enums";
import type { ProfilePickerAction } from "@docspace/ui-kit/ai-agent/providers";

// TODO: temporary hardcoded label, no i18n at this stage by design.
const CHOOSE_AI_AGENT_LABEL = "Choose AI Agent";

// Same cap as FilesStore.fetchAgents — the agents view never pages past 100.
const AGENTS_PAGE_COUNT = 100;

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
 * Loads the AI agents list (once, when `enabled` first turns true) and builds
 * the "Choose AI Agent" entry for the chat model picker (`actions` is empty
 * while loading and when at most one agent has a bound profile — the entry
 * is shown only when there is a real choice). `getAgentByRoomId` resolves a
 * loaded agent by its room id — used to restore the picked agent from a
 * thread's persisted context.
 */
export const useAiAgentsPickerActions = (
  enabled: boolean,
  onAgentPick: (agent: TPickedAgent) => void,
): {
  actions: ProfilePickerAction[];
  getAgentByRoomId: (roomId: string) => TPickedAgent | null;
} => {
  const [agents, setAgents] = useState<TAgent[] | null>(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!enabled || requested.current) return undefined;
    requested.current = true;

    const controller = new AbortController();
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.AIAgents);
    filter.pageCount = AGENTS_PAGE_COUNT;

    getNewAiAgents(filter, controller.signal)
      .then(async (data) => {
        // The list response never carries `profileId` — the new-ai service
        // injects it only into GET /new-ai/agents/:id (see EditAgentEvent) —
        // so each agent's details are fetched and the id merged in.
        const detailed = await Promise.all(
          data.folders.map((agent) =>
            getNewAiAgent(agent.id)
              .then((full) => ({ ...agent, profileId: full?.profileId }))
              // Non-fatal: an agent without the new-ai binding just stays
              // non-pickable, matching the edit dialog's behavior.
              .catch(() => agent),
          ),
        );
        setAgents(detailed);
      })
      .catch(() => {
        // The menu entry is optional — swallow the error (incl. aborts) and
        // allow the next `enabled` transition to retry the request.
        requested.current = false;
      });

    return () => controller.abort();
  }, [enabled]);

  const actions = useMemo<ProfilePickerAction[]>(() => {
    // Only agents bound to an AI profile are pickable — selecting an agent
    // switches the chat to its profile (displayed under the agent's name).
    const pickable = (agents ?? []).flatMap((agent) =>
      agent.profileId ? [{ agent, profileId: agent.profileId }] : [],
    );
    if (pickable.length <= 1) return [];

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
