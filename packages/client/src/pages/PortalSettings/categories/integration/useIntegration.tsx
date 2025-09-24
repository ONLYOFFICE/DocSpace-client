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

import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import type { TDocServiceLocation } from "@docspace/shared/api/files/types";
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
    await updatePlugins?.(true);
  }, [updatePlugins]);

  const getThirdPartyData = useCallback(async () => {
    const urlParts = window.location.href.split("?");
    if (urlParts.length > 1 && isThirdPartyAvailable) {
      const queryValue = urlParts[1].split("=")[1];
      await fetchAndSetConsumers?.(queryValue).then((isConsumerExist) => {
        isConsumerExist && setOpenThirdPartyModal?.(true);
      });
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
    getSSOData,
    getPluginsData,
    getThirdPartyData,
    getSMTPSettingsData,
    getDocumentServiceData,
    getIntegrationInitialValue,
  };
};

export default useIntegration;
