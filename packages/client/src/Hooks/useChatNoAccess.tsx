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

import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useHasAiProfiles } from "SRC_DIR/Hooks/useHasAiProfiles";

import ClientSimpleTopUpDialog from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";
import { useAIActivation } from "SRC_DIR/Hooks/useAIActivation";
import { AI_SETTINGS_URL } from "SRC_DIR/helpers/constants";
import type PaymentStore from "SRC_DIR/store/PaymentStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

export type ChatNoAccessStoreProps = {
  standalone?: SettingsStore["standalone"];
  isAdmin?: boolean;
  isCardLinkedToPortal?: PaymentStore["isCardLinkedToPortal"];
  isAIReady?: PaymentStore["isAIReady"];
  enableAIService?: PaymentStore["enableAIService"];
  getAIConfig?: SettingsStore["getAIConfig"];
  refreshPaymentInfo?: () => Promise<void> | void;
  language?: string;
};

export const mapChatNoAccessStores = ({
  settingsStore,
  userStore,
  paymentStore,
  authStore,
}: TStore): ChatNoAccessStoreProps => {
  const { standalone, getAIConfig } = settingsStore;
  const { isCardLinkedToPortal, isAIReady, enableAIService } = paymentStore;

  return {
    standalone,
    isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
    isCardLinkedToPortal,
    isAIReady,
    enableAIService,
    getAIConfig,
    refreshPaymentInfo: authStore?.getPaymentInfo,
    language: authStore?.language ?? "en",
  };
};

export const useChatNoAccess = ({
  standalone,
  isAdmin,
  isCardLinkedToPortal,
  isAIReady,
  enableAIService,
  getAIConfig,
  refreshPaymentInfo,
  language,
}: ChatNoAccessStoreProps) => {
  const navigate = useNavigate();

  const hasAiProfiles = useHasAiProfiles();
  const aiReady = standalone ? hasAiProfiles : !!isAIReady;

  const activation = useAIActivation({
    enableAIService,
    getAIConfig,
    refreshPaymentInfo,
    isCardLinkedToPortal,
    context: "chat",
    createAgentOnActivate: false,
  });

  const goToAISettings = useCallback(
    () => navigate(AI_SETTINGS_URL),
    [navigate],
  );

  const noAccessProps = useMemo(
    () => ({
      standalone: !!standalone,
      isPortalAdmin: !!isAdmin,
      isCardLinkedToPortal,
      onActivateAI: activation.onActivateAI,
      onTopUpAndActivateAI: activation.onTopUpAndActivateAI,
      isActivating: activation.isActivating,
      goToAISettings,
    }),
    [
      standalone,
      isAdmin,
      isCardLinkedToPortal,
      activation.onActivateAI,
      activation.onTopUpAndActivateAI,
      activation.isActivating,
      goToAISettings,
    ],
  );

  const topUpDialog = useMemo(
    () => (
      <ClientSimpleTopUpDialog
        visible={activation.simpleTopUpDialogVisible}
        onClose={activation.onCloseSimpleTopUpDialog}
        onConfirm={activation.onAIActivated}
        language={language}
      />
    ),
    [
      activation.simpleTopUpDialogVisible,
      activation.onCloseSimpleTopUpDialog,
      activation.onAIActivated,
      language,
    ],
  );

  return { aiReady, activation, noAccessProps, topUpDialog };
};

export default useChatNoAccess;

