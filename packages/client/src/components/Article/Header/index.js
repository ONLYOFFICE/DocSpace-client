import React from "react";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import withLoader from "../../../HOCs/withLoader";
import { ArticleHeaderLoader } from "@docspace/shared/skeletons/article";

const ArticleHeaderContent = ({ currentModuleName }) => {
  return <>{currentModuleName}</>;
};

export default inject(({ authStore }) => {
  return {
    currentModuleName: (authStore.product && authStore.product.title) || "",
  };
})(
  withTranslation([])(
    withLoader(observer(ArticleHeaderContent))(<ArticleHeaderLoader />)
  )
);
