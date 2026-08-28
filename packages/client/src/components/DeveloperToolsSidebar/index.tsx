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
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type { NavMenuGroup, NavMenuItem } from "@docspace/ui-kit/components/nav-menu";
import { PageType } from "@docspace/shared/enums";
import { getCatalogIconUrlByType } from "@docspace/shared/utils/catalogIconHelper";
import { canOpenDocsConnect } from "@docspace/shared/utils/devToolsAccess";

import AppsSidebar from "SRC_DIR/components/AppsSidebar";

type DeveloperToolsSidebarProps = {
  identityServerEnabled: boolean;
  canOpenDocsConnect: boolean;
};

const ITEMS = [
  {
    id: "devtools-overview",
    path: "/developer-tools/overview",
    pageType: PageType.devToolsOverview,
    translationKey: "Common:Overview" as const,
  },
  {
    id: "devtools-docs-connect",
    path: "/developer-tools/docs-connect",
    pageType: PageType.devToolsDocsConnect,
    translationKey: "DocsConnect:DocsConnect" as const,
    conditionalOnDocsConnect: true,
  },
  {
    id: "devtools-javascript-sdk",
    path: "/developer-tools/javascript-sdk",
    pageType: PageType.devToolsJavascriptSdk,
    translationKey: "Settings:EmbedSDK" as const,
  },
  {
    id: "devtools-plugin-sdk",
    path: "/developer-tools/plugin-sdk",
    pageType: PageType.devToolsPluginSdk,
    translationKey: "WebPlugins:PluginSDK" as const,
  },
  {
    id: "devtools-webhooks",
    path: "/developer-tools/webhooks",
    pageType: PageType.devToolsWebhooks,
    translationKey: "Webhooks:Webhooks" as const,
  },
  {
    id: "devtools-oauth",
    path: "/developer-tools/oauth",
    pageType: PageType.devToolsOAuth,
    translationKey: "OAuth:OAuth" as const,
    conditionalOnOAuth: true,
  },
  {
    id: "devtools-api-keys",
    path: "/developer-tools/api-keys",
    pageType: PageType.devToolsApiKeys,
    translationKey: "Settings:ApiKeys" as const,
  },
];

const DeveloperToolsSidebar = ({
  identityServerEnabled,
  canOpenDocsConnect,
}: DeveloperToolsSidebarProps) => {
  const { t } = useTranslation([
    "Common",
    "Settings",
    "WebPlugins",
    "Webhooks",
    "OAuth",
    "DocsConnect",
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  const visibleItems = ITEMS.filter((item) => {
    if (item.conditionalOnOAuth && !identityServerEnabled) return false;
    if (item.conditionalOnDocsConnect && !canOpenDocsConnect) return false;
    return true;
  });

  const activeId = React.useMemo(() => {
    const { pathname } = location;
    const found = visibleItems.find(
      (item) =>
        pathname === item.path || pathname.startsWith(`${item.path}/`),
    );
    return found?.id;
  }, [location, visibleItems]);

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const items: NavMenuItem[] = visibleItems.map((item) => ({
      id: item.id,
      // biome-ignore lint/plugin/no-dynamic-i18n-key: literals captured by locales scanner
      label: t(item.translationKey),
      icon: getCatalogIconUrlByType(item.pageType),
      // linkData renders the item as a real router link, so right-click /
      // Ctrl-click / middle-click can open the section in a new tab.
      linkData: { path: item.path },
      onClick: () => navigate(item.path),
    }));
    return [{ id: "developer-tools", items }];
  }, [t, navigate, visibleItems]);

  return (
    <AppsSidebar groups={groups} activeId={activeId} variant="secondary" />
  );
};

export default inject(({ authStore, userStore, settingsStore }: TStore) => ({
  identityServerEnabled:
    authStore?.capabilities?.identityServerEnabled ?? false,
  // Docs Connect is SaaS-only and admin/owner-only - see
  // `canOpenDocsConnect`.
  canOpenDocsConnect: canOpenDocsConnect(
    userStore?.user,
    settingsStore?.standalone,
    settingsStore?.limitedAccessDevToolsForUsers,
  ),
}))(observer(DeveloperToolsSidebar));
