import React, { useEffect } from "react";
import Article from "@docspace/common/components/Article";
import { ArticleHeaderContent, ArticleBodyContent } from "./Article";
import { SectionHeaderContent, SectionPagingContent } from "./Section";
import { inject, observer } from "mobx-react";
import Section from "@docspace/common/components/Section";
import withLoading from "SRC_DIR/HOCs/withLoading";
//import commonIconsStyles from "@docspace/components/utils/common-icons-style";

import { useParams } from "react-router-dom";
import HistoryHeader from "../categories/developer-tools/Webhooks/WebhookHistory/sub-components/HistoryHeader";
import DetailsNavigationHeader from "../categories/developer-tools/Webhooks/WebhookEventDetails/sub-components/DetailsNavigationHeader";
import OAuthSectionHeader from "../categories/developer-tools/OAuth/OAuthSectionHeader";

const ArticleSettings = React.memo(({ showArticleLoader }) => {
  return (
    <Article showArticleLoader={showArticleLoader}>
      <Article.Header>
        <ArticleHeaderContent />
      </Article.Header>

      <Article.Body>
        <ArticleBodyContent />
      </Article.Body>
    </Article>
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
        <Section
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
        </Section>
      )}
    </>
  );
};

export default inject(({ auth, setup, pluginStore }) => {
  const { language, settingsStore } = auth;
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
