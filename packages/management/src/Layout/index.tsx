import React from "react";
import { observer } from "mobx-react";
import Article from "@docspace/common/components/Article";
import ArticleWrapper from "@docspace/common/components/Article/ArticleWrapper";
import { ArticleHeaderContent, ArticleBodyContent } from "./Article";

import Section from "./Section";

type TLayoutProps = {
  children: React.ReactNode;
};

const ArticleSettings = React.memo(() => {
  return (
    <ArticleWrapper
      hideProfileBlock
      hideAppsBlock
      withCustomArticleHeader
      hideAlerts
    >
      <Article.Header>
        <ArticleHeaderContent />
      </Article.Header>

      <Article.Body>
        <ArticleBodyContent />
      </Article.Body>
    </ArticleWrapper>
  );
});

const MainLayout = ({ children }: TLayoutProps) => {
  return (
    <>
      <ArticleSettings />
      <Section children={children} />
    </>
  );
};

export default observer(MainLayout);
