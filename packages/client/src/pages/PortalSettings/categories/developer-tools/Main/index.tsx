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

import DevToolsSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-api.react.svg";
import EmbedSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-javascript-sdk.react.svg";
import PluginSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-plugin-sdk.react.svg";
import WebhookSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-webhooks.react.svg";
import OAuthSvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-oauth.react.svg";
import KeySvg from "PUBLIC_DIR/images/icons/16/catalog.devtools-api-keys.react.svg";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { globalColors } from "@docspace/ui-kit/providers";

import ConfirmWrapper from "SRC_DIR/components/ConfirmWrapper";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";

import Card from "./card";

import styles from "./main.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const Main = (props: { apiBasicLink: string }) => {
  const { t, ready } = useTranslation(["Common", "Settings", "JavascriptSdk", "WebPlugins", "Webhooks", "OAuth"]);
  const { apiBasicLink } = props;
  
  useEffect(() => {
    if (ready) setDocumentTitle(t("Common:DeveloperTools"));
  }, [ready]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".section-sticky-container, .section-header",
    );
    elements.forEach((el) => (el.style.display = "none"));
    return () => {
      elements.forEach((el) => (el.style.display = ""));
    };
  }, []);

  if (!ready) return null;

  return (
    <ConfirmWrapper height="100%">
      <div className={styles.main}>
        <div className={styles.header}>
          <Text fontSize="23px" fontWeight={700} lineHeight="28px">{t("Common:DeveloperTools")}</Text>
          <Text fontSize="13px" fontWeight={400} lineHeight="20px">{t("Settings:DeveloperToolsDescription", { organizationName: getBrandName("OrganizationName"), productName: getBrandName("ProductName") })}</Text>
        </div>
        <div className={styles.grid}>
          <Card 
            icon={<DevToolsSvg />} 
            title={t("Settings:RestAPI")} 
            description={t("Settings:RestAPIDescription", { organizationName: getBrandName("OrganizationName"), productName: getBrandName("ProductName") })} 
            url={apiBasicLink}
            color={globalColors.lightBlueMain}
            linkTitle={t("Common:LearnMore")} 
            isBlank
          />
          <Card 
            icon={<EmbedSvg />} 
            title={t("Settings:EmbedSDK")} 
            description={t("Settings:EmbedSDKDescription", { productName: getBrandName("ProductName") })} 
            url="/developer-tools/javascript-sdk" 
            color={globalColors.mainOrange}
            linkTitle={t("Settings:StartEmbedding")} 
          />
          <Card 
            icon={<PluginSvg />} 
            title={t("WebPlugins:PluginSDK")} 
            description={t("Settings:PluginDescription", { productName: getBrandName("ProductName") })} 
            url="/developer-tools/plugin-sdk" 
            color={globalColors.secondGreen}
            linkTitle={t("Common:ReadInstructions")} 
          />
          <Card
            icon={<WebhookSvg />}
            title={t("Webhooks:Webhooks")}
            description={t("Settings:WebhooksDescription", { organizationName: getBrandName("OrganizationName"), productName: getBrandName("ProductName") })}
            url="/developer-tools/webhooks?create=true"
            color={globalColors.mainRed}
            linkTitle={t("Webhooks:CreateWebhook")}
          />
          <Card
            icon={<OAuthSvg />}
            title={t("OAuth:OAuth")}
            description={t("Settings:OAuthDescription", { organizationName: getBrandName("OrganizationName"), productName: getBrandName("ProductName") })}
            url="/developer-tools/oauth/create"
            color={globalColors.purple}
            linkTitle={t("Settings:RegisterApp")}
          />
          <Card
            icon={<KeySvg />}
            title={t("Settings:ApiKeys")}
            description={t("Settings:ApiKeysCardDescription", { organizationName: getBrandName("OrganizationName"), productName: getBrandName("ProductName") })}
            url="/developer-tools/api-keys?create=true"
            color={globalColors.lightGrayDark}
            linkTitle={t("Settings:CreateKey")}
          />
        </div>
      </div>
    </ConfirmWrapper>
  );
};

export default inject(({ settingsStore }: TStore) => {
  const { apiBasicLink } = settingsStore;

  return {
    apiBasicLink,
  };
})(observer(Main));
