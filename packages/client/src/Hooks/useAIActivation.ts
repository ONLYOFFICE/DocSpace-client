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

import { useCallback, useState } from "react";

import { Events } from "@docspace/shared/enums";

type UseAIActivationProps = {
  enableAIService?: (onSuccess?: () => void | Promise<void>) => Promise<void>;
  getAIConfig?: () => Promise<unknown> | void;
  refreshCurrentFolder?: () => Promise<void> | void;
  refreshPaymentInfo?: () => Promise<void> | void;
  isCardLinkedToPortal?: boolean;
  parentId?: string | number | null;
  context?: string;
  /** Dispatch AGENT_CREATE after activation (opens the create dialog). Off inside the chat. */
  createAgentOnActivate?: boolean;
};

/**
 * Shared AI activation logic (activate / top up / benefits) reused by the
 * empty view and the AI agent chat no-access screen. Renders nothing — the
 * caller wires the returned handlers and renders the dialogs.
 */
export const useAIActivation = ({
  enableAIService,
  getAIConfig,
  refreshCurrentFolder,
  refreshPaymentInfo,
  isCardLinkedToPortal,
  parentId,
  context = "empty_state",
  createAgentOnActivate = true,
}: UseAIActivationProps) => {
  const [aiFeaturesDialogVisible, setAiFeaturesDialogVisible] = useState(false);
  const [simpleTopUpDialogVisible, setSimpleTopUpDialogVisible] =
    useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const onTopUpAndActivateAI = useCallback(
    () => setSimpleTopUpDialogVisible(true),
    [],
  );

  const onAIActivated = useCallback(async () => {
    await Promise.all([
      getAIConfig?.(),
      refreshCurrentFolder?.(),
      refreshPaymentInfo?.(),
    ]);
  }, [getAIConfig, refreshCurrentFolder, refreshPaymentInfo]);

  const onActivateAI = useCallback(async () => {
    try {
      setIsActivating(true);
      await enableAIService?.(onAIActivated);

      if (!createAgentOnActivate) return;

      const event = new CustomEvent(Events.AGENT_CREATE, {
        detail: { parentId, context },
      });
      window.dispatchEvent(event);
    } finally {
      setIsActivating(false);
    }
  }, [enableAIService, onAIActivated, parentId, context, createAgentOnActivate]);

  const onShowAIBenefits = useCallback(
    () => setAiFeaturesDialogVisible(true),
    [],
  );

  const onCloseAIFeaturesDialog = useCallback(
    () => setAiFeaturesDialogVisible(false),
    [],
  );

  const onCloseSimpleTopUpDialog = useCallback(
    () => setSimpleTopUpDialogVisible(false),
    [],
  );

  const onDialogActivate = useCallback(async () => {
    if (!isCardLinkedToPortal) {
      setAiFeaturesDialogVisible(false);
      setSimpleTopUpDialogVisible(true);
      return;
    }

    try {
      setIsActivating(true);
      await enableAIService?.(onAIActivated);
      setAiFeaturesDialogVisible(false);

      if (!createAgentOnActivate) return;

      const event = new CustomEvent(Events.AGENT_CREATE, {
        detail: { parentId, context },
      });
      window.dispatchEvent(event);
    } finally {
      setIsActivating(false);
    }
  }, [
    isCardLinkedToPortal,
    enableAIService,
    onAIActivated,
    parentId,
    context,
    createAgentOnActivate,
  ]);

  return {
    onActivateAI,
    onTopUpAndActivateAI,
    onShowAIBenefits,
    onDialogActivate,
    onAIActivated,
    isActivating,
    aiFeaturesDialogVisible,
    onCloseAIFeaturesDialog,
    simpleTopUpDialogVisible,
    onCloseSimpleTopUpDialog,
  };
};

export default useAIActivation;

