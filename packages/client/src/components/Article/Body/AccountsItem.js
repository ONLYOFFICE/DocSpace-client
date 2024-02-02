﻿import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import { ArticleItem } from "@docspace/shared/components/article-item";

const PureAccountsItem = ({ showText, isActive, onClick, t }) => {
  const onClickAction = React.useCallback(() => {
    onClick && onClick("accounts");
  }, [onClick]);

  const icon = getCatalogIconUrlByType(PageType.account);

  return (
    <ArticleItem
      key="accounts"
      text={t("Accounts")}
      icon={icon}
      showText={showText}
      onClick={onClickAction}
      isActive={isActive}
      folderId="document_catalog-accounts"
    />
  );
};

const AccountsItem = withTranslation(["Common"])(PureAccountsItem);

export default inject(({ settingsStore }) => {
  const { showText } = settingsStore;

  return {
    showText,
  };
})(observer(AccountsItem));
