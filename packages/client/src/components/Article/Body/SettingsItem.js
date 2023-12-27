import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { ArticleItem } from "@docspace/shared/components";

import CatalogSettingsReactSvgUrl from "PUBLIC_DIR/images/catalog.settings.react.svg?url";

const PureSettingsItem = ({ t, showText, isActive, onClick }) => {
  const onClickAction = React.useCallback(() => {
    onClick && onClick("settings");
  }, [onClick]);

  return (
    <ArticleItem
      key="settings"
      text={t("Common:Settings")}
      icon={CatalogSettingsReactSvgUrl}
      showText={showText}
      onClick={onClickAction}
      isActive={isActive}
      folderId="document_catalog-settings"
    />
  );
};

const SettingsItem = withTranslation(["FilesSettings", "Common"])(
  PureSettingsItem
);

export default inject(({ auth }) => {
  return {
    showText: auth.settingsStore.showText,
  };
})(observer(SettingsItem));
