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

import { useEffect, useState } from "react";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { useNavigate } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";

import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";

import SsoSettings from "./SingleSignOn";
import LdapSettings from "./LDAP";
import ThirdParty from "./ThirdPartyServicesSettings";
import SMTPSettings from "./SMTPSettings";
import DocumentService from "./DocumentService";
import PluginPage from "./Plugins";
import useIntegration from "./useIntegration";

import { createDefaultHookSettingsProps } from "../../utils/createDefaultHookSettingsProps";

const IntegrationWrapper = (props) => {
  const {
    t,
    currentDeviceType,
    standalone,
    enablePlugins,

    setup,
    currentQuotaStore,
    ssoFormStore,
    pluginStore,
    filesSettingsStore,
    ldapStore,
    clearAbortControllerArr,
  } = props;
  const navigate = useNavigate();

  const [currentTabId, setCurrentTabId] = useState();

  const defaultProps = createDefaultHookSettingsProps({
    setup,
    currentQuotaStore,
    ssoFormStore,
    pluginStore,
    filesSettingsStore,
    ldapStore,
  });

  const {
    getLDAPData,
    getSSOData,
    getPluginsData,
    getThirdPartyData,
    getSMTPSettingsData,
    getDocumentServiceData,
  } = useIntegration({
    ...defaultProps.integration,
  });

  const data = [
    {
      id: "ldap",
      name: t("Settings:LDAP"),
      content: <LdapSettings />,
      onClick: async () => {
        clearAbortControllerArr();
        await getLDAPData();
      },
    },
    {
      id: "sso",
      name: t("Settings:SingleSignOn"),
      content: <SsoSettings />,
      onClick: async () => {
        clearAbortControllerArr();
        await getSSOData();
      },
    },
    {
      id: "third-party-services",
      name: t("Translations:ThirdPartyTitle"),
      content: <ThirdParty />,
      onClick: async () => {
        clearAbortControllerArr();
        await getThirdPartyData();
      },
    },
    {
      id: "smtp-settings",
      name: t("Settings:SMTPSettings"),
      content: <SMTPSettings />,
      onClick: async () => {
        clearAbortControllerArr();
        await getSMTPSettingsData();
      },
    },
  ];

  if (standalone) {
    const documentServiceData = {
      id: "document-service",
      name: t("Settings:DocumentService"),
      content: <DocumentService />,
      onClick: async () => {
        clearAbortControllerArr();
        await getDocumentServiceData();
      },
    };

    data.push(documentServiceData);
  }

  if (enablePlugins) {
    const pluginLabel = (
      <div style={{ boxSizing: "border-box", display: "flex", gap: "8px" }}>
        {t("Common:Plugins")}
      </div>
    );

    data.splice(2, 0, {
      id: "plugins",
      name: pluginLabel,
      content: <PluginPage />,
      onClick: async () => {
        clearAbortControllerArr();
        await getPluginsData();
      },
    });
  }

  useEffect(() => {
    const path = window.location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    if (currentTab && data.length) setCurrentTabId(currentTab.id);
  }, [location.pathname]);

  const onSelect = (e) => {
    navigate(
      combineUrl(
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/portal-settings/integration/${e.id}`,
      ),
    );
  };

  return (
    <Tabs
      items={data}
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType]}
      withAnimation
    />
  );
};

export const Component = inject(
  ({
    settingsStore,
    ssoStore,
    currentQuotaStore,
    pluginStore,
    setup,
    filesSettingsStore,
    ldapStore,
  }) => {
    const {
      standalone,
      enablePlugins,
      currentDeviceType,
      clearAbortControllerArr,
    } = settingsStore;

    return {
      standalone,
      currentDeviceType,
      enablePlugins,

      setup,
      currentQuotaStore,
      ssoFormStore: ssoStore,
      pluginStore,
      filesSettingsStore,
      ldapStore,
      clearAbortControllerArr,
    };
  },
)(
  withTranslation([
    "SMTPSettings",
    "Settings",
    "SingleSignOn",
    "Translations",
    "WebPlugins",
    "Common",
  ])(observer(IntegrationWrapper)),
);
