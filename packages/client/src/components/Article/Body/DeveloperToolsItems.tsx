// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "react-router";

import { DeviceType, PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";

import { ArticleItem } from "@docspace/ui-kit/components/article/item";

interface IDeveloperToolsItem {
  showText: boolean;
  identityServerEnabled: boolean;
  toggleArticleOpen: () => void;
  currentDeviceType: string;
}

const items = [
  {
    id: "devtools-overview",
    path: "/developer-tools/overview",
    pageType: PageType.devToolsOverview,
    // t("Settings:Overview") - already translated in the parent component
    translationKey: "Settings:Overview",
  },
  {
    id: "devtools-javascript-sdk",
    path: "/developer-tools/javascript-sdk",
    pageType: PageType.devToolsJavascriptSdk,
    translationKey: "Settings:EmbedSDK",
  },
  {
    id: "devtools-plugin-sdk",
    path: "/developer-tools/plugin-sdk",
    pageType: PageType.devToolsPluginSdk,
    translationKey: "WebPlugins:PluginSDK",
  },
  {
    id: "devtools-webhooks",
    path: "/developer-tools/webhooks",
    pageType: PageType.devToolsWebhooks,
    translationKey: "Webhooks:Webhooks",
  },
  {
    id: "devtools-oauth",
    path: "/developer-tools/oauth",
    pageType: PageType.devToolsOAuth,
    translationKey: "OAuth:OAuth",
    conditionalOnOAuth: true,
  },
  {
    id: "devtools-api-keys",
    path: "/developer-tools/api-keys",
    pageType: PageType.devToolsApiKeys,
    translationKey: "Settings:ApiKeys",
  },
];

const DeveloperToolsItems = ({
  showText,
  identityServerEnabled,
  toggleArticleOpen,
  currentDeviceType,
}: IDeveloperToolsItem) => {
  const { t } = useTranslation([
    "Settings",
    "JavascriptSdk",
    "WebPlugins",
    "Webhooks",
    "OAuth",
  ]);

  const location = useLocation();

  const isMobileView = currentDeviceType === DeviceType.mobile;

  const visibleItems = items.filter(
    (item) => !item.conditionalOnOAuth || identityServerEnabled,
  );

  const onSelect = () => {
    if (isMobileView) {
      toggleArticleOpen();
    }
  };

  return (
    <>
      {visibleItems.map((item, index) => {
        const isActive =
          location.pathname === item.path ||
          location.pathname.startsWith(`${item.path}/`);
        const isFirstChild = index === 0;
        const isLastChild = index === visibleItems.length - 1;
        const title = t(item.translationKey);

        return (
          <ArticleItem
            key={item.id}
            text={title}
            title={title}
            icon={getCatalogIconUrlByType(item.pageType)}
            showText={showText}
            isActive={isActive}
            onClick={onSelect}
            linkData={{ path: item.path, state: {} }}
            folderId={item.id}
            LinkRouter={Link}
            withAnimation={!isMobileView}
            isEndOfBlock={isFirstChild || isLastChild}
          />
        );
      })}
    </>
  );
};

export default inject(({ settingsStore, authStore }: TStore) => {
  const { showText, toggleArticleOpen, currentDeviceType } = settingsStore;
  const identityServerEnabled =
    authStore?.capabilities?.identityServerEnabled ?? false;

  return {
    showText,
    identityServerEnabled,
    toggleArticleOpen,
    currentDeviceType,
  };
})(observer(DeveloperToolsItems));
