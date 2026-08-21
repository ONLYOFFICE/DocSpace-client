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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { CollapsibleCard } from "@docspace/ui-kit/components/collapsible-card";
import { Text } from "@docspace/ui-kit/components/text";
import { getBrandName } from "@docspace/shared/constants/brands";
import { hasDevToolsAccess } from "@docspace/shared/utils/devToolsAccess";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";

import styles from "../Dashboard.module.scss";

type DevTool = {
  id: string;
  title: string;
  description: string;
  path?: string;
  url?: string;
  featured?: boolean;
  linkTitle: string;
};

interface DevToolsCardProps {
  apiBasicLink?: string;
  // The card's tiles lead into /developer-tools, which the route guard closes
  // for guests and - when the portal limits access - for room admins and users.
  // Hide the whole card for them rather than show links that answer with a 403.
  showDevTools?: boolean;
}

const useDevTools = (props: DevToolsCardProps): DevTool[] => {
  const { apiBasicLink } = props;

  const { t } = useTranslation([
    "Settings",
    "WebPlugins",
    "Webhooks",
    "OAuth",
    "Common",
    "DocsConnect",
  ]);

  const productName = getBrandName("ProductName");
  const organizationName = getBrandName("OrganizationName");
  const docsName = `${organizationName} ${getBrandName("ProductEditorsName")}`;

  return [
    {
      id: "docs-connect",
      title: t("DocsConnect:DocsConnect"),
      description: t("DocsConnect:CardDescription", { productName: docsName }),
      path: "/developer-tools/docs-connect",
      featured: true,
      linkTitle: t("DocsConnect:GetStarted"),
    },
    {
      id: "rest-api",
      title: t("Settings:RestAPI"),
      description: t("Settings:RestAPIDescription", {
        organizationName,
        productName,
      }),
      url: apiBasicLink,
      linkTitle: t("Common:LearnMore"),
    },
    {
      id: "embed-sdk",
      title: t("Settings:EmbedSDK"),
      description: t("Settings:EmbedSDKDescription"),
      path: "/developer-tools/javascript-sdk",
      linkTitle: t("Common:LearnMore"),
    },
    {
      id: "plugins-sdk",
      title: t("WebPlugins:PluginSDK"),
      description: t("Settings:PluginDescription"),
      path: "/developer-tools/plugin-sdk",
      linkTitle: t("Common:LearnMore"),
    },
    {
      id: "webhooks",
      title: t("Webhooks:Webhooks"),
      description: t("Settings:WebhooksDescription", {
        organizationName,
        productName,
      }),
      path: "/developer-tools/webhooks",
      linkTitle: t("Common:LearnMore"),
    },
    {
      id: "oauth",
      title: t("OAuth:OAuth"),
      description: t("Settings:OAuthDescription", {
        organizationName,
        productName,
      }),
      path: "/developer-tools/oauth",
      linkTitle: t("Common:LearnMore"),
    },
    {
      id: "api-keys",
      title: t("Settings:ApiKeys"),
      description: t("Settings:ApiKeysCardDescription", {
        organizationName,
        productName,
      }),
      path: "/developer-tools/api-keys",
      linkTitle: t("Common:LearnMore"),
    },
  ];
};

const DevToolTile = ({ tool }: { tool: DevTool }) => {
  const className = tool.featured
    ? `${styles.devToolTile} ${styles.devToolTileFeatured}`
    : styles.devToolTile;

  const content = (
    <>
      <Text as="p" className={styles.devToolTitle}>
        {tool.title}
      </Text>
      <Text as="p" className={styles.devToolDescription}>
        {tool.description}
      </Text>
      <span className={styles.devToolLink}>
        {tool.linkTitle}
        <ArrowIcon aria-hidden="true" className={styles.integrationArrow} />
      </span>
    </>
  );

  if (tool.path) {
    return (
      <Link className={className} to={tool.path}>
        {content}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={!tool.url}
    >
      {content}
    </a>
  );
};

const DevToolsCardComponent = (props: DevToolsCardProps) => {
  const { showDevTools } = props;
  const { t } = useTranslation(["Common"]);
  const tools = useDevTools(props);
  const organizationName = getBrandName("OrganizationName");

  // The dashboard tour reads its anchors from the DOM, so the dev-tools step
  // drops itself once this returns nothing - no tour change needed here.
  if (!showDevTools) return null;

  return (
    // Anchor for the dashboard tour, on a wrapper rather than on the card, for
    // the same reason as `IntegrationsCard`'s: `CollapsibleCard` takes a fixed
    // set of props and forwards no `data-*`. The wrapper stays put when the card
    // is collapsed, so the spotlight follows the card down to its header
    // instead of the step disappearing.
    <div data-tour-id="dashboard-devtools">
      <CollapsibleCard
        title={t("Common:BuildWithProduct", { organizationName })}
        description={t("Common:BuildWithProductDescription")}
        defaultOpen
      >
        <div className={styles.devToolsGrid}>
          {tools.map((tool) => (
            <DevToolTile key={tool.id} tool={tool} />
          ))}
        </div>
      </CollapsibleCard>
    </div>
  );
};

export const DevToolsCard = inject<TStore>(({ settingsStore, userStore }) => ({
  apiBasicLink: settingsStore.apiBasicLink,
  showDevTools: hasDevToolsAccess(
    userStore.user,
    settingsStore.limitedAccessDevToolsForUsers,
  ),
}))(observer(DevToolsCardComponent));

export default DevToolsCard;

