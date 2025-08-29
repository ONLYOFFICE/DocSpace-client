// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React, { useEffect } from "react";
import { useParams } from "react-router";
import Article from "@docspace/shared/components/article";
import { inject, observer } from "mobx-react";
import Section from "@docspace/shared/components/section";

import withLoading from "SRC_DIR/HOCs/withLoading";
import ArticleWrapper from "SRC_DIR/components/ArticleWrapper";

import SectionWrapper from "SRC_DIR/components/Section";

import SectionHeaderContent from "./Section/Header";
import { ArticleHeaderContent, ArticleBodyContent } from "./Article";

import HistoryHeader from "../categories/developer-tools/Webhooks/WebhookHistory/sub-components/HistoryHeader";
import DetailsNavigationHeader from "../categories/developer-tools/Webhooks/WebhookEventDetails/sub-components/DetailsNavigationHeader";
import OAuthSectionHeader from "../categories/developer-tools/OAuth/OAuthSectionHeader";

const ArticleSettings = React.memo(
  ({ showArticleLoader, needPageReload, isNotPaidPeriod }) => {
    const onLogoClickAction = () => {
      if (needPageReload) {
        window.location.replace("/");
      }
    };

    return (
      <ArticleWrapper
        showArticleLoader={showArticleLoader}
        onLogoClickAction={onLogoClickAction}
        showBackButton={!isNotPaidPeriod}
      >
        <Article.Header>
          <ArticleHeaderContent />
        </Article.Header>

        <Article.Body>
          <ArticleBodyContent />
        </Article.Body>
      </ArticleWrapper>
    );
  },
);

ArticleSettings.displayName = "ArticleSettings";

const Layout = ({
  currentProductId,
  setCurrentProductId,
  language,
  children,
  isGeneralPage,
  enablePlugins,
  isInitPlugins,
  initPlugins,

  isLoadedArticleBody,
  needPageReload,
  isNotPaidPeriod,
}) => {
  const { id, eventId } = useParams();

  const path = location.pathname.includes("/portal-settings")
    ? "/portal-settings"
    : "";

  const webhookHistoryPath = `${path}/developer-tools/webhooks/${id}`;
  const webhookDetailsPath = `${path}/developer-tools/webhooks/${id}/${eventId}`;
  const oauthCreatePath = `${path}/developer-tools/oauth/create`;
  const oauthEditPath = `${path}/developer-tools/oauth/${id}`;
  const currentPath = window.location.pathname;

  useEffect(() => {
    currentProductId !== "settings" && setCurrentProductId("settings");
  }, [language, currentProductId, setCurrentProductId]);

  useEffect(() => {
    if (enablePlugins && !isInitPlugins) initPlugins();
  }, [enablePlugins, isInitPlugins, initPlugins]);

  return (
    <>
      <ArticleSettings
        showArticleLoader={!isLoadedArticleBody}
        needPageReload={needPageReload}
        isNotPaidPeriod={isNotPaidPeriod}
      />
      {!isGeneralPage ? (
        <SectionWrapper viewAs="settings" withBodyScroll settingsStudio>
          <Section.SectionHeader>
            {currentPath === webhookHistoryPath ? (
              <HistoryHeader />
            ) : currentPath === webhookDetailsPath ? (
              <DetailsNavigationHeader />
            ) : currentPath === oauthCreatePath ||
              currentPath === oauthEditPath ? (
              <OAuthSectionHeader isEdit={currentPath === oauthEditPath} />
            ) : (
              <SectionHeaderContent />
            )}
          </Section.SectionHeader>

          <Section.SectionBody>{children}</Section.SectionBody>
        </SectionWrapper>
      ) : null}
    </>
  );
};

export default inject(
  ({
    authStore,
    settingsStore,
    setup,
    pluginStore,
    currentTariffStatusStore,
  }) => {
    const { language } = authStore;
    const { addUsers } = setup.headerAction;

    const {
      setCurrentProductId,
      enablePlugins,

      isLoadedArticleBody,
    } = settingsStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { isInit: isInitPlugins, initPlugins, needPageReload } = pluginStore;

    return {
      language,
      setCurrentProductId,
      addUsers,

      enablePlugins,
      isInitPlugins,
      initPlugins,

      isLoadedArticleBody,
      needPageReload,
      isNotPaidPeriod,
    };
  },
)(withLoading(observer(Layout)));
