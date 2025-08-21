// (c) Copyright Ascensio System SIA 2009-2025
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

import { useEffect } from "react";
import { Tabs } from "@docspace/shared/components/tabs";
import { useNavigate } from "react-router";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import config from "PACKAGE_FILE";

import { SECTION_HEADER_HEIGHT } from "@docspace/shared/components/section/Section.constants";

import SSO from "./SingleSignOn";
import LDAP from "./LDAP";
import ThirdParty from "./ThirdPartyServicesSettings";

import SMTPSettings from "./SMTPSettings";
import DocumentService from "./DocumentService";
import PluginPage from "./Plugins";

const IntegrationWrapper = (props) => {
  const {
    t,
    currentDeviceType,
    toDefault,
    isSSOAvailable,
    standalone,
    enablePlugins,
  } = props;
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      isSSOAvailable &&
        !window.location.pathname.includes("sso") &&
        toDefault();
    };
  }, []);

  const data = [
    {
      id: "ldap",
      name: t("LDAP"),
      content: <LDAP />,
    },
    {
      id: "sso",
      name: t("SingleSignOn"),
      content: <SSO />,
    },
    {
      id: "third-party-services",
      name: t("Translations:ThirdPartyTitle"),
      content: <ThirdParty />,
    },
    {
      id: "smtp-settings",
      name: t("SMTPSettings"),
      content: <SMTPSettings />,
    },
  ];

  if (standalone) {
    const documentServiceData = {
      id: "document-service",
      name: t("DocumentService"),
      content: <DocumentService />,
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
    });
  }

  const getCurrentTabId = () => {
    const path = window.location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const currentTabId = getCurrentTabId();

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
    />
  );
};

export const Component = inject(
  ({ settingsStore, ssoStore, currentQuotaStore }) => {
    const { standalone, enablePlugins, currentDeviceType } = settingsStore;
    const { load: toDefault } = ssoStore;

    const { isSSOAvailable } = currentQuotaStore;

    return {
      toDefault,
      isSSOAvailable,
      standalone,
      currentDeviceType,
      enablePlugins,
    };
  },
)(
  withTranslation([
    "Settings",
    "SingleSignOn",
    "Translations",
    "WebPlugins",
    "Common",
  ])(observer(IntegrationWrapper)),
);
