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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useNavigate } from "react-router";

import ChatNoAccessRightsDarkIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.dark.svg";
import ChatNoAccessRightsLightIcon from "PUBLIC_DIR/images/emptyview/empty.chat.access.rights.light.svg";

import { EmptyView } from "@docspace/shared/components/empty-view";
import { Text } from "@docspace/ui-kit/components";
import AIFeaturesDialog from "@docspace/ui-kit/billing/services/panels/ai-service/AIFeaturesDialog";
import { getBrandName } from "@docspace/shared/constants/brands";

import { useAIActivation } from "SRC_DIR/Hooks/useAIActivation";
import ClientSimpleTopUpDialog from "./sub-components/EmptyViewContainer/ClientSimpleTopUpDialog";

const KnowledgeDisabledContainer = (props) => {
  const {
    t,
    theme,
    isFrame,
    isAdmin,
    standalone,
    isCardLinkedToPortal,
    enableAIService,
    getAIConfig,
    refreshPaymentInfo,
    language,
    setKnowledgeId,
    setCurrentTab,
  } = props;

  const navigate = useNavigate();

  const {
    onActivateAI,
    onTopUpAndActivateAI,
    // onShowAIBenefits,
    onDialogActivate,
    onAIActivated,
    isActivating,
    aiFeaturesDialogVisible,
    onCloseAIFeaturesDialog,
    simpleTopUpDialogVisible,
    onCloseSimpleTopUpDialog,
  } = useAIActivation({
    enableAIService,
    getAIConfig,
    refreshPaymentInfo,
    isCardLinkedToPortal,
    context: "knowledge",
    createAgentOnActivate: false,
  });

  const productName = getBrandName("ProductName");

  let titleRoomNoAccess;
  let descriptionRoomNoAccess;

  if (standalone) {
    titleRoomNoAccess = t("Common:KnowledgeUnavailable");
    descriptionRoomNoAccess = isAdmin
      ? t("Common:KnowledgeUnavailableDescription", {
          productName,
          aiAgents: t("Common:AIAgents"),
        })
      : t("Common:KnowledgeUnavailableDescriptionUser", {
          productName,
          aiAgents: t("Common:AIAgents"),
        });
  } else if (isAdmin) {
    titleRoomNoAccess = t("Common:EmptyAIAgentsNotActiveYetTitle");
    descriptionRoomNoAccess = (
      <>
        <Text as="span">
          {t("Common:EmptyAIAgentsNotActiveYetDescription")}
        </Text>
        <Text as="span" style={{ display: "block", marginTop: "8px" }}>
          {t("Common:EmptyAIAgentsNotActiveYetDescriptionLine2")}
        </Text>
      </>
    );
  } else {
    // saas user — same text as the empty AI agents view
    titleRoomNoAccess = t("Common:AIFeaturesNotActive");
    descriptionRoomNoAccess = t("Common:EmptyAIDisabledContactAdminDesc", {
      productName,
    });
  }

  const goToSettings = (event) => {
    event?.preventDefault();

    if (isFrame) return;

    setKnowledgeId(null);
    setCurrentTab(null);

    navigate("/portal-settings/ai-settings/knowledge");
  };

  const getOptions = () => {
    if (isFrame || !isAdmin) return [];

    if (standalone)
      return [
        {
          type: "button",
          onClick: goToSettings,
          key: "disabled-view-go-to-settings",
          title: t("Common:GoToSettings"),
        },
      ];

    const activateOrTopUpAI = isCardLinkedToPortal
      ? {
          type: "button",
          title: t("Common:Activate"),
          key: "activate-ai",
          onClick: onActivateAI,
          isLoading: isActivating,
        }
      : {
          type: "button",
          title: t("Common:TopUpAndActivate"),
          key: "top-up-and-activate-ai",
          onClick: onTopUpAndActivateAI,
        };

    return [
      activateOrTopUpAI,
      // {
      //   type: "button",
      //   title: t("Common:Benefits"),
      //   key: "ai-benefits",
      //   primary: false,
      //   onClick: onShowAIBenefits,
      // },
    ];
  };

  const propsRoomNotFoundOrMoved = {
    title: titleRoomNoAccess,
    description: isFrame ? "" : descriptionRoomNoAccess,
    icon: theme.isBase ? (
      <ChatNoAccessRightsLightIcon />
    ) : (
      <ChatNoAccessRightsDarkIcon />
    ),
    options: getOptions(),
  };

  return (
    <>
      <EmptyView {...propsRoomNotFoundOrMoved} />
      <AIFeaturesDialog
        visible={aiFeaturesDialogVisible}
        onClose={onCloseAIFeaturesDialog}
        onActivate={onDialogActivate}
        isCardLinkedToPortal={isCardLinkedToPortal ?? false}
        isActivating={isActivating}
      />
      <ClientSimpleTopUpDialog
        visible={simpleTopUpDialogVisible}
        onClose={onCloseSimpleTopUpDialog}
        onConfirm={onAIActivated}
        language={language}
      />
    </>
  );
};

export default inject(
  ({ settingsStore, userStore, aiRoomStore, paymentStore, authStore }) => {
    const { isFrame, theme, standalone, getAIConfig } = settingsStore;
    return {
      theme,
      isFrame,
      standalone,
      isAdmin: userStore?.user?.isAdmin || userStore?.user?.isOwner,
      isCardLinkedToPortal: paymentStore?.isCardLinkedToPortal,
      isCardMissingOrInactive: paymentStore?.isCardMissingOrInactive,
      enableAIService: paymentStore?.enableAIService,
      getAIConfig,
      refreshPaymentInfo: authStore?.getPaymentInfo,
      language: authStore?.language ?? "en",
      setKnowledgeId: aiRoomStore.setKnowledgeId,
      setCurrentTab: aiRoomStore.setCurrentTab,
    };
  },
)(withTranslation(["Common"])(observer(KnowledgeDisabledContainer)));

