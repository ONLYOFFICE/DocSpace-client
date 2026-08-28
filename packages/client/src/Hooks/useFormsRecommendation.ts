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

import {
  getAIAgent,
  getAIUserConfig,
  updateAIUserConfig,
} from "@docspace/shared/api/ai";
import type { TAgent } from "@docspace/shared/api/ai/types";
import { Events } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { AgentDialogContext } from "SRC_DIR/helpers/enums";
import type { FormsRecommendation } from "@docspace/ui-kit/ai-agent/providers";

type UseFormsRecommendationArgs = {
  /**
   * The chat runs against an AI agent — the only context where the notice
   * makes sense, since it asks for that agent's model to be changed. Also
   * gates the user-config read, so portals never pay for it elsewhere.
   */
  enabled: boolean;
  /** Agent room whose settings the admin link opens. */
  agentRoomId?: string;
  /** The user may change the agent's model (room `EditRoom` right). */
  canEditAgent: boolean;
  /** `TAIConfig.recommendedModelForForms`. */
  recommendedModel?: string;
};

/**
 * Host wiring for the in-chat notice that recommends the model tested for
 * form results (shown by `AiAgentProviders` while the composer carries a
 * DocSpace form).
 *
 * Dismissal is per user and lives on the server (`chatRecommendedModelVisible`
 * on the AI user config) — the same flag the legacy chat used, so a user who
 * closed the notice before still has it closed. `undefined` until that read
 * lands, which the notice treats as visible: the flag defaults to `true`
 * server-side, so waiting would only delay the first showing.
 */
export const useFormsRecommendation = ({
  enabled,
  agentRoomId,
  canEditAgent,
  recommendedModel,
}: UseFormsRecommendationArgs): FormsRecommendation => {
  const [noticeVisible, setNoticeVisible] = useState<boolean | undefined>(
    undefined,
  );
  const requested = useRef(false);

  useEffect(() => {
    if (!enabled || requested.current) return;
    requested.current = true;

    getAIUserConfig()
      .then((config) => setNoticeVisible(config.chatRecommendedModelVisible))
      // Non-fatal: the notice stays visible, which is the server default.
      .catch(() => {});
  }, [enabled]);

  const onCloseNotice = useCallback(() => {
    setNoticeVisible(false);
    updateAIUserConfig({ chatRecommendedModelVisible: false }).catch(() => {});
  }, []);

  // The same dialog the room context menu opens, fed the agent the AI service
  // returns — the chat knows only the room id.
  const onOpenAgentEdit = useCallback(async () => {
    if (!agentRoomId) return;

    try {
      const agent = await getAIAgent(agentRoomId as unknown as TAgent["id"]);
      if (!agent) return;

      const event = new CustomEvent(Events.AGENT_EDIT, {
        detail: { context: AgentDialogContext.Chat },
      }) as unknown as CustomEvent & { item: TAgent };
      event.item = agent;

      window.dispatchEvent(event);
    } catch (err) {
      // The link is a plain onClick — an unhandled rejection here would only
      // surface in the console and leave the user staring at nothing.
      toastr.error(err as Error);
    }
  }, [agentRoomId]);

  return useMemo(
    () => ({
      recommendedModel: enabled ? recommendedModel : undefined,
      canEditAgent,
      onOpenAgentEdit,
      noticeVisible,
      onCloseNotice,
    }),
    [
      enabled,
      recommendedModel,
      canEditAgent,
      onOpenAgentEdit,
      noticeVisible,
      onCloseNotice,
    ],
  );
};

export default useFormsRecommendation;
