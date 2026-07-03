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

import { inject, observer } from "mobx-react";

import { ChatInfoBlock } from "@docspace/ui-kit/ai-agent/chat/components/chat-info-block";

import { useAIActivation } from "SRC_DIR/Hooks/useAIActivation";
import type ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import type PaymentStore from "SRC_DIR/store/PaymentStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";

type Props = {
  showBodyLoader?: ClientLoadingStore["showBodyLoader"];
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

const AIChatComposerBannerComponent = ({
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
}: Props) => {
  const { onActivateAI, onShowAIBenefits, isActivating } = useAIActivation({
    enableAIService,
    getAIConfig,
    refreshPaymentInfo,
    isCardLinkedToPortal,
    context: "chat",
    createAgentOnActivate: false,
  });

  if (isAIReady) return null;

  return (
    <ChatInfoBlock
      standalone={!!standalone}
      isPortalAdmin={!!isAdmin}
      isPayer={isPayer}
      walletCustomerEmail={walletCustomerEmail}
      walletCustomerDisplayName={walletCustomerDisplayName}
      onActivateAI={onActivateAI}
      onShowAIBenefits={onShowAIBenefits}
      isActivating={isActivating}
    />
  );
};

export const AIChatComposerBanner = inject(
  ({
    settingsStore,
    userStore,
    paymentStore,
    currentTariffStatusStore,
    authStore,
  }: TStore) => {
    const { standalone, getAIConfig } = settingsStore;
    const { isPayer, isCardLinkedToPortal, isAIReady, enableAIService } =
      paymentStore;
    const { walletCustomerEmail, walletCustomerInfo } =
      currentTariffStatusStore;

    return {
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
    };
  },
)(observer(AIChatComposerBannerComponent));

export default AIChatComposerBanner;

