import React from "react";
import { observer } from "mobx-react";

import Section from "./Section";
import ArticleWrapper from "./Article";

type TLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: TLayoutProps) => {
  return (
    <>
      <ArticleWrapper />
      <Section children={children} />
    </>
  );
};

export default observer(MainLayout);
