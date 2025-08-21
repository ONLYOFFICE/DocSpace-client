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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Cron, getNextSynchronization } from "@docspace/shared/components/cron";
import { toastr } from "@docspace/shared/components/toast";

import { DeviceType, LDAPOperation } from "@docspace/shared/enums";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { useNavigate } from "react-router";
import { isMobile, isDesktop } from "@docspace/shared/utils/device";
import ProgressContainer from "./ProgressContainer";
import ToggleAutoSync from "./ToggleAutoSync";
import StyledLdapPage from "../styled-components/StyledLdapPage";
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
  const { t } = useTranslation(["Ldap", "Common", "Settings"]);
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
