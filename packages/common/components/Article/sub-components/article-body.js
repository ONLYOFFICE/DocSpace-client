import React from "react";
import { Scrollbar } from "@docspace/shared/components";

const ArticleBody = ({ children, className }) => {
  return (
    <Scrollbar
      className="article-body__scrollbar"
      scrollclass="article-scroller"
    >
      {children}
    </Scrollbar>
  );
};

ArticleBody.displayName = "Body";

export default React.memo(ArticleBody);
