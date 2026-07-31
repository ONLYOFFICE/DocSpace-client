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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Cron, getNextSynchronization } from "@docspace/shared/components/cron";
import { toastr } from "@docspace/ui-kit/components/toast";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { useNavigate } from "react-router";
import { isMobile, isDesktop } from "@docspace/ui-kit/utils/device";
import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";
import StyledLdapPage from "../styled-containers/StyledLdapPage";
import { onChangeUrl } from "../utils";

const SyncContainer = ({
  isMobileView,
  syncLdap,
  saveCronLdap,
  onChangeCron,
  cron,
  serverCron,

  isLdapEnabledOnServer,
  isUIDisabled,
  isLdapAvailable,
}) => {
  const { t, ready } = useTranslation(["Ldap", "Common", "Settings"]);
  const navigate = useNavigate();

  const onCheckView = () => {
    if (!isMobile()) {
      const newUrl = onChangeUrl();
      if (newUrl) navigate(newUrl);
    }
  };

  React.useEffect(() => {
    isMobileView && setDocumentTitle(t("Ldap:LdapSyncTitle"));
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, []);

  const onSaveClick = React.useCallback(() => {
    saveCronLdap()
      .then(() => toastr.success(t("Common:SuccessfullySaveSettingsMessage")))
      .catch((e) => toastr.error(e));
  }, []);

  const onSync = React.useCallback(() => {
    syncLdap(t).catch((e) => toastr.error(e));
  }, []);

  const buttonSize = isDesktop() ? ButtonSize.small : ButtonSize.normal;

  const nextSyncDate = React.useMemo(() => {
    if (cron) return getNextSynchronization(cron);
  }, [cron]);

  const renderBody = () => (
    <div className="ldap_sync-container">
      {!isMobileView ? (
        <Text
          fontSize="16px"
          fontWeight={700}
          lineHeight="24px"
          className="settings_unavailable"
        >
          {t("LdapSyncTitle")}
        </Text>
      ) : null}
      <Text
        fontSize="12px"
        fontWeight={400}
        lineHeight="16px"
        className="settings_unavailable sync-description"
      >
        {t("LdapSyncDescription")}
      </Text>

      <Button
        tabIndex={-1}
        className="manual-sync-button"
        size={buttonSize}
        primary
        onClick={onSync}
        label={t("LdapSyncButton")}
        isDisabled={!isLdapEnabledOnServer || isUIDisabled}
        testId="manual_sync_button"
      />

      <ProgressContainer operation={LDAPOperation.Sync} />

      <ToggleAutoSync />

      {cron ? (
        <>
          {" "}
          <Text
            fontSize="13px"
            fontWeight={400}
            lineHeight="20px"
            className="ldap_cron-title"
          >
            {t("LdapSyncCronTitle")}
          </Text>
          <div className="ldap_cron-container">
            <Cron
              value={cron}
              setValue={onChangeCron}
              isDisabled={!isLdapEnabledOnServer || isUIDisabled}
              dataTestId="ldap_cron"
            />
          </div>
          <Text
            fontSize="12px"
            fontWeight={600}
            lineHeight="16px"
            dataTestId="next_sync_date"
          >
            {`${t("LdapNextSync")}: ${nextSyncDate?.toFormat("DDDD tt")} UTC`}
          </Text>
          <Button
            tabIndex={-1}
            className="auto-sync-button"
            size={buttonSize}
            primary
            onClick={onSaveClick}
            label={t("Common:SaveButton")}
            isDisabled={
              !isLdapEnabledOnServer || isUIDisabled || cron === serverCron
            }
            testId="auto_sync_save_button"
          />
        </>
      ) : null}
    </div>
  );

  if (!ready) return null;

  if (isMobileView) {
    return (
      <StyledLdapPage
        isMobileView={isMobileView}
        isSettingPaid={isLdapAvailable}
      >
        {renderBody()}
      </StyledLdapPage>
    );
  }

  return <>{renderBody()}</>;
};

export const SyncContainerSection = inject(
  ({ currentQuotaStore, settingsStore, ldapStore }) => {
    const { isLdapAvailable } = currentQuotaStore;
    const { currentDeviceType } = settingsStore;
    const {
      syncLdap,
      saveCronLdap,
      onChangeCron,
      cron,
      serverCron,

      isUIDisabled,

      serverSettings,
    } = ldapStore;

    const isMobileView = currentDeviceType === DeviceType.mobile;

    return {
      isMobileView,
      syncLdap,
      saveCronLdap,
      onChangeCron,
      cron,
      serverCron,

      isLdapEnabledOnServer: serverSettings.EnableLdapAuthentication,
      isUIDisabled,
      isLdapAvailable,
    };
  },
)(observer(SyncContainer));
