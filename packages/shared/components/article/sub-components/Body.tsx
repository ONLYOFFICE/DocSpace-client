import React from "react";
import { Scrollbar } from "../../scrollbar";

const ArticleBody = ({ children }: { children: React.ReactNode }) => {
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
