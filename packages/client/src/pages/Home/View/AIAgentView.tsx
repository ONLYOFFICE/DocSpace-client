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

import { Activity } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import NewChat from "@docspace/ui-kit/ai-agent/new-chat";

import styles from "./AIAgentView.module.scss";

import NoAccessContainer, {
  NoAccessContainerType,
} from "SRC_DIR/components/EmptyContainer/NoAccessContainer";
import { SectionBodyContent } from "SRC_DIR/pages/Home/Section";
import { useAIActivation } from "SRC_DIR/Hooks/useAIActivation";
import ClientSimpleTopUpDialog from "SRC_DIR/components/EmptyContainer/sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";
import type FilesStore from "SRC_DIR/store/FilesStore";
import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type AccessRightsStore from "SRC_DIR/store/AccessRightsStore";
import type PaymentStore from "SRC_DIR/store/PaymentStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

const AI_SETTINGS_URL = "/portal-settings/ai-settings";

type Props = {
  currentView: string;
  isErrorAIAgentNotAvailable?: FilesStore["isErrorAIAgentNotAvailable"];
  showArticleLoader?: ClientLoadingStore["showArticleLoader"];
  showBodyLoader?: ClientLoadingStore["showBodyLoader"];
  canUseChat?: AccessRightsStore["canUseChat"];
  standalone?: SettingsStore["standalone"];
  isAdmin?: boolean;
  isPayer?: PaymentStore["isPayer"];
  isCardLinkedToPortal?: PaymentStore["isCardLinkedToPortal"];
  isAIReady?: PaymentStore["isAIReady"];
  enableAIService?: PaymentStore["enableAIService"];
  getAIConfig?: SettingsStore["getAIConfig"];
  refreshPaymentInfo?: () => Promise<void> | void;
  walletCustomerEmail?: string | null;
  walletCustomerDisplayName?: string | null;
  language?: string;
};

const AIAgentViewComponent = ({
  currentView,
  isErrorAIAgentNotAvailable,
  showArticleLoader,
  showBodyLoader,
  canUseChat,
  standalone,
  isAdmin,
  isPayer,
  isCardLinkedToPortal,
  isAIReady,
  enableAIService,
  getAIConfig,
  refreshPaymentInfo,
  walletCustomerEmail,
  walletCustomerDisplayName,
  language,
}: Props) => {
  const navigate = useNavigate();

  const {
    onActivateAI,
    onTopUpAndActivateAI,
    onAIActivated,
    isActivating,
    simpleTopUpDialogVisible,
    onCloseSimpleTopUpDialog,
  } = useAIActivation({
    enableAIService,
    getAIConfig,
    refreshPaymentInfo,
    isCardLinkedToPortal,
    context: "chat",
    createAgentOnActivate: false,
  });

  if (
    currentView === "chat" &&
    isErrorAIAgentNotAvailable &&
    !showArticleLoader
  ) {
    return <NoAccessContainer type={NoAccessContainerType.Agent} />;
  }

  const hasNoAccessToChat = !canUseChat && !showBodyLoader;
  const shouldRenderChat =
    !hasNoAccessToChat && (!isErrorAIAgentNotAvailable || showArticleLoader);
  const shouldRenderFiles = currentView !== "chat";

  const noAccessProps = {
    aiReady: !!isAIReady,
    standalone: !!standalone,
    isPortalAdmin: !!isAdmin,
    isPayer,
    isCardLinkedToPortal,
    walletCustomerEmail,
    walletCustomerDisplayName,
    onActivateAI,
    onTopUpAndActivateAI,
    isActivating,
    goToAISettings: () => navigate(AI_SETTINGS_URL),
  };

  return (
    <>
      {shouldRenderChat ? (
        <Activity mode={currentView === "chat" ? "visible" : "hidden"}>
          <div
            className={styles.aiAgentChat}
            data-chat-active={currentView === "chat" ? "" : undefined}
          >
            <NewChat aiReady={!!isAIReady} noAccessProps={noAccessProps} />
          </div>
        </Activity>
      ) : null}

      {shouldRenderFiles ? <SectionBodyContent /> : null}

      <ClientSimpleTopUpDialog
        visible={simpleTopUpDialogVisible}
        onClose={onCloseSimpleTopUpDialog}
        onConfirm={onAIActivated}
        language={language}
      />
    </>
  );
};

export const AIAgentView = inject(
  ({
    filesStore,
    clientLoadingStore,
    accessRightsStore,
    settingsStore,
    userStore,
    paymentStore,
    currentTariffStatusStore,
    authStore,
  }: TStore) => {
    const { isErrorAIAgentNotAvailable } = filesStore;
    const { showArticleLoader, showBodyLoader } = clientLoadingStore;
    const { canUseChat } = accessRightsStore;
    const { standalone, getAIConfig } = settingsStore;
    const { isPayer, isCardLinkedToPortal, isAIReady, enableAIService } =
      paymentStore;
    const { walletCustomerEmail, walletCustomerInfo } =
      currentTariffStatusStore;

    return {
      isErrorAIAgentNotAvailable,
      showArticleLoader,
      showBodyLoader,
      canUseChat,
      standalone,
      isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
      isPayer,
      isCardLinkedToPortal,
      isAIReady,
      enableAIService,
      getAIConfig,
      refreshPaymentInfo: authStore?.getPaymentInfo,
      walletCustomerEmail,
      walletCustomerDisplayName: walletCustomerInfo?.displayName,
      language: authStore?.language ?? "en",
    };
  },
)(observer(AIAgentViewComponent));

