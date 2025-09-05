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
      console.log("here");
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
