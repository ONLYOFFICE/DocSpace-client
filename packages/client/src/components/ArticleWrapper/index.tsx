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
import { useNavigate } from "react-router";

import Article from "@docspace/ui-kit/components/article";
import { ArticleProps } from "@docspace/ui-kit/components/article/Article.types";
import { getUserType } from "@docspace/shared/utils/common";

import { useSectionNavigation } from "../../contexts/SectionNavigationContext";

import ArticlePluginItems from "./ArticlePluginItems/ArticlePluginItems";

const ArticleWrapper = (props: ArticleProps) => {
  const navigate = useNavigate();
  const { navigateBack } = useSectionNavigation();

  return <Article {...props} navigate={navigate} onBack={navigateBack} />;
};

export default inject<TStore>(
  ({
    authStore,
    uploadDataStore,
    profileActionsStore,
    userStore,
    currentTariffStatusStore,
    currentQuotaStore,
    settingsStore,
    backup,
    pluginStore,
  }) => {
    const {
      isLiveChatAvailable,

      isPaymentPageAvailable,
    } = authStore;

    const { getActions, onProfileClick, isShowLiveChat } = profileActionsStore;

    const { withSendAgain, user } = userStore;

    const { primaryProgressDataStore, secondaryProgressDataStore } =
      uploadDataStore;

    const { email, displayName } = user || {};

    const isAdmin = user?.isAdmin || user?.isOwner;

    const { isPrimaryProgressVisbile } = primaryProgressDataStore;
    const { isSecondaryProgressVisbile } = secondaryProgressDataStore;
    const { downloadingProgress } = backup;
    const isBackupProgressVisible =
      downloadingProgress > 0 && downloadingProgress < 100;

    const showProgress =
      isPrimaryProgressVisbile ||
      isSecondaryProgressVisbile ||
      isBackupProgressVisible;

    const {
      showText,
      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,
      toggleArticleOpen,
      currentColorScheme,
      setArticleOpen,
      mainBarVisible,
      zendeskKey,
      isMobileArticle,

      currentDeviceType,
      standalone,
      isBurgerLoading,
      logoText,
      limitedAccessDevToolsForUsers,
      downloaddesktopUrl,
      officeforandroidUrl,
      officeforiosUrl,
    } = settingsStore;

    const { isFreeTariff, isNonProfit, isTrial, currentTariffPlanTitle } =
      currentQuotaStore;
    const { isGracePeriod, isLicenseDateExpired, trialDaysLeft } =
      currentTariffStatusStore;

    const customSlot = pluginStore?.articleButtonItemsList ? (
      <ArticlePluginItems items={pluginStore.articleButtonItemsList} />
    ) : null;

    return {
      onProfileClick,
      user,
      getUserType,
      getActions,

      currentTariffPlanTitle,
      email,
      displayName,

      zendeskKey,
      isMobileArticle,
      showProgress,

      isBurgerLoading,

      isTrial,
      isLicenseDateExpired,
      trialDaysLeft,

      toggleArticleOpen,

      showText,
      isNonProfit,
      isGracePeriod,
      isFreeTariff,
      isPaymentPageAvailable,

      standalone,

      setShowText,
      articleOpen,
      setIsMobileArticle,
      toggleShowText,

      currentColorScheme,
      setArticleOpen,
      withSendAgain,
      mainBarVisible,
      isLiveChatAvailable,
      isShowLiveChat,

      currentDeviceType,
      logoText,
      isAdmin,
      limitedAccessDevToolsForUsers,
      downloaddesktopUrl,
      officeforandroidUrl,
      officeforiosUrl,
      hideAppsBlock:
        !downloaddesktopUrl && !officeforandroidUrl && !officeforiosUrl,
      customSlot,
    };
  },
)(observer(ArticleWrapper));
