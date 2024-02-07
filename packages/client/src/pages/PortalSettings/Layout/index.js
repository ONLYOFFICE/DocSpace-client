import React, { useEffect } from "react";
import Article from "@docspace/shared/components/article";
import { ArticleHeaderContent, ArticleBodyContent } from "./Article";
import { SectionHeaderContent, SectionPagingContent } from "./Section";
import { inject, observer } from "mobx-react";
import Section from "@docspace/shared/components/section";
import withLoading from "SRC_DIR/HOCs/withLoading";

import SectionWrapper from "SRC_DIR/components/Section";

import { useParams } from "react-router-dom";
import HistoryHeader from "../categories/developer-tools/Webhooks/WebhookHistory/sub-components/HistoryHeader";
import DetailsNavigationHeader from "../categories/developer-tools/Webhooks/WebhookEventDetails/sub-components/DetailsNavigationHeader";
import OAuthSectionHeader from "../categories/developer-tools/OAuth/OAuthSectionHeader";
import ArticleWrapper from "SRC_DIR/components/ArticleWrapper";

const ArticleSettings = React.memo(({ showArticleLoader }) => {
  return (
    <ArticleWrapper showArticleLoader={showArticleLoader}>
      <Article.Header>
        <ArticleHeaderContent />
      </Article.Header>

      <Article.Body>
        <ArticleBodyContent />
      </Article.Body>
    </ArticleWrapper>
  );
});

const Layout = ({
  currentProductId,
  setCurrentProductId,
  language,
  children,
  addUsers,
  isGeneralPage,
  enablePlugins,
  isInitPlugins,
  initPlugins,

  isLoadedArticleBody,
}) => {
  useEffect(() => {
    currentProductId !== "settings" && setCurrentProductId("settings");
  }, [language, currentProductId, setCurrentProductId]);

  useEffect(() => {
    if (enablePlugins && !isInitPlugins) initPlugins();
  }, [enablePlugins, isInitPlugins, initPlugins]);

  const { id, eventId } = useParams();

  const webhookHistoryPath = `/portal-settings/developer-tools/webhooks/${id}`;
  const webhookDetailsPath = `/portal-settings/developer-tools/webhooks/${id}/${eventId}`;

  const oauthCreatePath = "/portal-settings/developer-tools/oauth/create";
  const oauthEditPath = `/portal-settings/developer-tools/oauth/${id}`;

  const currentPath = window.location.pathname;

  return (
    <>
      <ArticleSettings showArticleLoader={!isLoadedArticleBody} />
      {!isGeneralPage && (
        <SectionWrapper
          viewAs={"settings"}
          withBodyScroll={true}
          settingsStudio={true}
        >
          <Section.SectionHeader>
            {currentPath === oauthCreatePath ||
            currentPath === oauthEditPath ? (
              <OAuthSectionHeader isEdit={currentPath === oauthEditPath} />
            ) : currentPath === webhookHistoryPath ? (
              <HistoryHeader />
            ) : currentPath === webhookDetailsPath ? (
              <DetailsNavigationHeader />
            ) : (
              <SectionHeaderContent />
            )}
          </Section.SectionHeader>

          <Section.SectionBody>{children}</Section.SectionBody>
          {addUsers && (
            <Section.SectionPaging>
              <SectionPagingContent />
            </Section.SectionPaging>
          )}
        </SectionWrapper>
      )}
    </>
  );
};

export default inject(({ authStore, settingsStore, setup, pluginStore }) => {
  const { language } = authStore;
  const { addUsers } = setup.headerAction;

  const {
    setCurrentProductId,
    enablePlugins,

    isLoadedArticleBody,
  } = settingsStore;

  const { isInit: isInitPlugins, initPlugins } = pluginStore;

  return {
    language,
    setCurrentProductId,
    addUsers,

    enablePlugins,
    isInitPlugins,
    initPlugins,

    isLoadedArticleBody,
  };
})(withLoading(observer(Layout)));
