import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { FolderType } from "@docspace/common/constants";

import CatalogItem from "@docspace/components/catalog-item";

import { getCatalogIconByFolderType } from "./Items.helper";

const PureAccountsItem = ({ showText, isActive, onClick, t }) => {
  const onClickAction = React.useCallback(() => {
    onClick && onClick("accounts");
  }, [onClick]);

  const icon = getCatalogIconByFolderType(FolderType.Account);

  return (
    <CatalogItem
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

export default inject(({ auth }) => {
  const { showText } = auth.settingsStore;

  return {
    showText,
  };
})(observer(AccountsItem));
