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

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import SetupStore from "SRC_DIR/store/SettingsSetupStore";
import SsoFormStore from "SRC_DIR/store/SsoFormStore";
import PluginStore from "SRC_DIR/store/PluginStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import LdapFormStore from "SRC_DIR/store/LdapFormStore";

export type UseIntegrationProps = {
  isSSOAvailable?: CurrentQuotasStore["isSSOAvailable"];
  init?: SsoFormStore["init"];
  isInit?: SsoFormStore["isInit"];
  isPluginsInit?: PluginStore["isInit"];
  updatePlugins?: PluginStore["updatePlugins"];
  getConsumers?: SetupStore["getConsumers"];
  fetchAndSetConsumers?: SetupStore["fetchAndSetConsumers"];
  setInitSMTPSettings?: SetupStore["setInitSMTPSettings"];
  getDocumentServiceLocation?: FilesSettingsStore["getDocumentServiceLocation"];
  setDocumentServiceLocation?: FilesSettingsStore["setDocumentServiceLocation"];
  loadLDAP?: LdapFormStore["load"];
  isLdapAvailable?: CurrentQuotasStore["isLdapAvailable"];
  isThirdPartyAvailable?: CurrentQuotasStore["isThirdPartyAvailable"];
  setOpenThirdPartyModal?: SetupStore["setOpenThirdPartyModal"];
};

const useIntegration = ({
  isSSOAvailable,
  init,
  isInit,
  isPluginsInit,
  updatePlugins,
  getConsumers,
  fetchAndSetConsumers,
  setInitSMTPSettings,
  getDocumentServiceLocation,
  setDocumentServiceLocation,
  loadLDAP,
  isLdapAvailable,
  isThirdPartyAvailable,
  setOpenThirdPartyModal,
}: UseIntegrationProps) => {
  const { t } = useTranslation(["Ldap", "Settings", "Common"]);

  const getLDAPData = useCallback(async () => {
    isLdapAvailable && (await loadLDAP?.(t));
  }, [isLdapAvailable, loadLDAP, t]);

  const getSSOData = useCallback(async () => {
    isSSOAvailable && !isInit && (await init?.());
  }, [isSSOAvailable, isInit, init]);

  const getPluginsData = useCallback(async () => {
    isPluginsInit && (await updatePlugins?.(true));
  }, [isPluginsInit, updatePlugins]);

  const getThirdPartyData = useCallback(async () => {
    const urlParts = window.location.href.split("?");
    if (urlParts.length > 1) {
      const queryValue = urlParts[1].split("=")[1];
      await fetchAndSetConsumers?.(queryValue, isThirdPartyAvailable).then(
        (isConsumerExist) => {
          console.log("isConsumerExist:", isConsumerExist);
          isConsumerExist && setOpenThirdPartyModal?.(true);
        },
      );
    } else {
      await getConsumers?.();
    }
  }, [getConsumers, fetchAndSetConsumers]);

  const getSMTPSettingsData = useCallback(async () => {
    await setInitSMTPSettings?.();
  }, [setInitSMTPSettings]);

  const getDocumentServiceData = useCallback(async () => {
    await getDocumentServiceLocation?.().then((result) => {
      setDocumentServiceLocation?.(result);
    });
  }, [getDocumentServiceLocation]);

  const getIntegrationInitialValue = useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("ldap")) actions.push(getLDAPData());

    if (window.location.pathname.includes("sso")) actions.push(getSSOData());

    if (window.location.pathname.includes("plugins"))
      actions.push(getPluginsData());

    if (window.location.pathname.includes("third-party-services"))
      actions.push(getThirdPartyData());

    if (window.location.pathname.includes("smtp-settings"))
      actions.push(getSMTPSettingsData());

    if (window.location.pathname.includes("document-service"))
      actions.push(getDocumentServiceData());

    await Promise.all(actions);
  }, [
    getLDAPData,
    getSSOData,
    getPluginsData,
    getThirdPartyData,
    getSMTPSettingsData,
    getDocumentServiceData,
  ]);

  return {
    getLDAPData,
    getSSOData,
    getPluginsData,
    getThirdPartyData,
    getSMTPSettingsData,
    getDocumentServiceData,
    getIntegrationInitialValue,
  };
};

export default useIntegration;
