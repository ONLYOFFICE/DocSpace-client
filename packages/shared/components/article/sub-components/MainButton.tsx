import React from "react";

import { StyledArticleMainButton } from "../Article.styled";

const ArticleMainButton = (props: { children: React.ReactNode }) => {
  return <StyledArticleMainButton {...props} />;
};

ArticleMainButton.displayName = "MainButton";

export default ArticleMainButton;
