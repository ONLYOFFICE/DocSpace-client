/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
        // biome-ignore lint/plugin/no-dynamic-i18n-key: translationKey literals on items[] are captured by the locales scanner
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
