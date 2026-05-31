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

import { CollapsibleCard } from "@docspace/ui-kit/components/collapsible-card";
import { Text } from "@docspace/ui-kit/components/text";
import { getBrandName } from "@docspace/shared/constants/brands";

import ArrowIcon from "PUBLIC_DIR/images/arrow2.react.svg";

import styles from "../Dashboard.module.scss";

type DevTool = {
  id: string;
  title: string;
  description: string;
  url?: string;
};

interface DevToolsCardProps {
  apiBasicLink?: string;
  sdkLink?: string;
  apiPluginSDKLink?: string;
  webhooksGuideUrl?: string;
  apiOAuthLink?: string;
  apiKeysUrl?: string;
}

const useDevTools = (props: DevToolsCardProps): DevTool[] => {
  const {
    apiBasicLink,
    sdkLink,
    apiPluginSDKLink,
    webhooksGuideUrl,
    apiOAuthLink,
    apiKeysUrl,
  } = props;

  const { t } = useTranslation([
    "Settings",
    "WebPlugins",
    "Webhooks",
    "OAuth",
    "Common",
  ]);

  const productName = getBrandName("ProductName");
  const organizationName = getBrandName("OrganizationName");

  return [
    {
      id: "rest-api",
      title: t("Settings:RestAPI"),
      description: t("Settings:RestAPIDescription", {
        organizationName,
        productName,
      }),
      url: apiBasicLink,
    },
    {
      id: "embed-sdk",
      title: t("Settings:EmbedSDK"),
      description: t("Settings:EmbedSDKDescription", { productName }),
      url: sdkLink,
    },
    {
      id: "plugins-sdk",
      title: t("WebPlugins:PluginSDK"),
      description: t("Settings:PluginDescription", { productName }),
      url: apiPluginSDKLink,
    },
    {
      id: "webhooks",
      title: t("Webhooks:Webhooks"),
      description: t("Settings:WebhooksDescription", {
        organizationName,
        productName,
      }),
      url: webhooksGuideUrl,
    },
    {
      id: "oauth",
      title: t("OAuth:OAuth"),
      description: t("Settings:OAuthDescription", {
        organizationName,
        productName,
      }),
      url: apiOAuthLink,
    },
    {
      id: "api-keys",
      title: t("Settings:ApiKeys"),
      description: t("Settings:ApiKeysCardDescription", {
        organizationName,
        productName,
      }),
      url: apiKeysUrl,
    },
  ];
};

const DevToolsCardComponent = (props: DevToolsCardProps) => {
  const { t } = useTranslation(["Common"]);
  const tools = useDevTools(props);
  const organizationName = getBrandName("OrganizationName");

  return (
    <CollapsibleCard
      title={t("Common:BuildWithProduct", { organizationName })}
      description={t("Common:BuildWithProductDescription")}
      defaultOpen
    >
      <div className={styles.devToolsGrid}>
        {tools.map((tool) => (
          <a
            key={tool.id}
            className={styles.devToolTile}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!tool.url}
          >
            <Text as="p" className={styles.devToolTitle} isBold>
              {tool.title}
            </Text>
            <Text as="p" className={styles.devToolDescription}>
              {tool.description}
            </Text>
            <span className={styles.devToolLink}>
              {t("Common:LearnMore")}
              <ArrowIcon
                aria-hidden="true"
                className={styles.integrationArrow}
              />
            </span>
          </a>
        ))}
      </div>
    </CollapsibleCard>
  );
};

export const DevToolsCard = inject<TStore>(({ settingsStore }) => ({
  apiBasicLink: settingsStore.apiBasicLink,
  sdkLink: settingsStore.sdkLink,
  apiPluginSDKLink: settingsStore.apiPluginSDKLink,
  webhooksGuideUrl: settingsStore.webhooksGuideUrl,
  apiOAuthLink: settingsStore.apiOAuthLink,
  apiKeysUrl: settingsStore.apiKeysUrl,
}))(observer(DevToolsCardComponent));

export default DevToolsCard;

