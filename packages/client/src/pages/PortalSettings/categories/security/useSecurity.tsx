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

import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";

import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";

export type UseSecurityProps = {
  getPortalPasswordSettings?: SettingsStore["getPortalPasswordSettings"];
  getTfaType?: TfaStore["getTfaType"];
  getInvitationSettings?: SettingsStore["getInvitationSettings"];
  getIpRestrictionsEnable?: SettingsStore["getIpRestrictionsEnable"];
  getIpRestrictions?: SettingsStore["getIpRestrictions"];
  getBruteForceProtection?: SettingsStore["getBruteForceProtection"];
  getSessionLifetime?: SettingsStore["getSessionLifetime"];
  getLoginHistory?: SettingsSetupStore["getLoginHistory"];
  getLifetimeAuditSettings?: SettingsSetupStore["getLifetimeAuditSettings"];
  getAuditTrail?: SettingsSetupStore["getAuditTrail"];
  initSettings?: SettingsSetupStore["initSettings"];
  isInit?: SettingsSetupStore["isInit"];
};

const useSecurity = ({
  getPortalPasswordSettings,
  getTfaType,
  getInvitationSettings,
  getIpRestrictionsEnable,
  getIpRestrictions,
  getBruteForceProtection,
  getSessionLifetime,
  getLoginHistory,
  getLifetimeAuditSettings,
  getAuditTrail,
  initSettings,
  isInit,
}: UseSecurityProps) => {
  const getAccessPortalData = useCallback(async () => {
    await initSettings?.();
  }, [initSettings]);

  const getLoginHistoryData = useCallback(async () => {
    await Promise.all([getLoginHistory?.(), getLifetimeAuditSettings?.()]);
  }, [getLoginHistory, getLifetimeAuditSettings]);

  const getAuditTrailData = useCallback(async () => {
    await Promise.all([getAuditTrail?.(), getLifetimeAuditSettings?.()]);
  }, [getAuditTrail, getLifetimeAuditSettings]);

  const getSecurityInitialValue = useCallback(async () => {
    const actions = [];
    if (window.location.pathname.includes("password") && !isInit) {
      actions.push(getPortalPasswordSettings?.());
    }

    if (window.location.pathname.includes("tfa") && !isInit) {
      actions.push(getTfaType?.());
    }

    if (window.location.pathname.includes("invitation-settings") && !isInit) {
      actions.push(getInvitationSettings?.());
    }

    if (window.location.pathname.includes("ip") && !isInit) {
      actions.push(getIpRestrictionsEnable?.(), getIpRestrictions?.());
    }

    if (
      window.location.pathname.includes("brute-force-protection") &&
      !isInit
    ) {
      actions.push(getBruteForceProtection?.());
    }

    if (window.location.pathname.includes("lifetime") && !isInit) {
      actions.push(getSessionLifetime?.());
    }

    if (window.location.pathname.includes("access-portal"))
      actions.push(getAccessPortalData?.());

    if (window.location.pathname.includes("login-history"))
      actions.push(getLoginHistoryData?.());

    if (window.location.pathname.includes("audit-trail"))
      actions.push(getAuditTrailData?.());

    await Promise.all(actions);
  }, [getAccessPortalData, getLoginHistoryData, getAuditTrailData]);

  return {
    getAccessPortalData,
    getLoginHistoryData,
    getAuditTrailData,
    getSecurityInitialValue,
  };
};

export default useSecurity;
