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

import { useEffect, useState } from "react";
import classNames from "classnames";
import { Text } from "@docspace/ui-kit/components/text";
import { Button } from "@docspace/ui-kit/components/button";
import { TwoFactorCampaignBanner } from "@docspace/shared/components/two-factor-campaign";
import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { Badge } from "@docspace/ui-kit/components/badge";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";

import styles from "./HistoryMainContent.module.scss";

const HistoryMainContent = (props) => {
  const {
    t,
    lifetime,
    subHeader,
    content,
    downloadReport,
    downloadReportDescription,
    getReport,
    isSettingNotPaid,
    isLoadingDownloadReport,
    tfaEnabled,
    withCampaign,
    currentColorScheme,
    loginHistory,
  } = props;

  const [loginLifeTime, setLoginLifeTime] = useState(String(lifetime) || "180");
  const [auditLifeTime, setAuditLifeTime] = useState(String(lifetime) || "180");

  const theme = useTheme();

  const getSettings = () => {
    const storagePeriodSettings = getFromSessionStorage("storagePeriod");
    const defaultData = {
      loginHistoryLifeTime: String(lifetime),
      auditTrailLifeTime: String(lifetime),
    };

    saveToSessionStorage("defaultStoragePeriod", defaultData);
    if (storagePeriodSettings) {
      setLoginLifeTime(storagePeriodSettings.loginHistoryLifeTime);
      setAuditLifeTime(storagePeriodSettings.auditTrailLifeTime);
    } else {
      setLoginLifeTime(String(lifetime));
      setAuditLifeTime(String(lifetime));
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    const newSettings = {
      loginHistoryLifeTime: loginLifeTime,
      auditTrailLifeTime: auditLifeTime,
    };
    saveToSessionStorage("storagePeriod", newSettings);
  }, [loginLifeTime, auditLifeTime]);

  const handleMouseDown = (e) => {
    if (e.button === 0 || e.button === 1) {
      getReport();
      e.preventDefault();
    }
  };

  return (
    <div
      className={classNames(styles["main-container"], {
        [styles.unavailable]: isSettingNotPaid,
      })}
    >
      <TwoFactorCampaignBanner
        tfaEnabled={tfaEnabled}
        currentColorScheme={currentColorScheme}
        withCampaign={withCampaign}
        style={{ marginBottom: "20px" }}
      />
      {isSettingNotPaid ? (
        <Badge
          className="paid-badge"
          fontWeight="700"
          backgroundColor={
            theme.isBase
              ? globalColors.favoritesStatus
              : globalColors.favoriteStatusDark
          }
          label={t("Common:Paid")}
          isPaidBadge
        />
      ) : null}
      <div className="main-wrapper">
        <Text fontSize="13px" className="login-history-description">
          {subHeader}
        </Text>

        {/*  
        // This part is commented out because it is not used in the current version of the application
        <Text className="latest-text settings_unavailable">{latestText} </Text>

        <label
          className="storage-label settings_unavailable"
          htmlFor="storage-period"
        >
          {storagePeriod}
        </label>
        {isLoginHistoryPage ? (
          <>
            <StyledTextInput
              onChange={onChangeLoginLifeTime}
              value={loginLifeTime}
              size="base"
              id="login-history-period"
              type="text"
              isDisabled={isSettingNotPaid}
            />
            <SaveCancelButtons
              className="save-cancel"
              onSaveClick={setLifeTimeSettings}
              onCancelClick={onCancelLoginLifeTime}
              saveButtonLabel={saveButtonLabel}
              cancelButtonLabel={cancelButtonLabel}
              showReminder={loginLifeTimeReminder}
              reminderText={t("Common:YouHaveUnsavedChanges")}
              displaySettings={true}
              hasScroll={false}
              isDisabled={isSettingNotPaid}
            />
          </>
        ) : (
          <>
            <StyledTextInput
              onChange={onChangeAuditLifeTime}
              value={auditLifeTime}
              size="base"
              id="audit-history-period"
              type="text"
              isDisabled={isSettingNotPaid}
            />
            <SaveCancelButtons
              className="save-cancel"
              onSaveClick={setLifeTimeSettings}
              onCancelClick={onCancelAuditLifeTime}
              saveButtonLabel={saveButtonLabel}
              cancelButtonLabel={cancelButtonLabel}
              showReminder={auditLifeTimeReminder}
              reminderText={t("Common:YouHaveUnsavedChanges")}
              displaySettings={true}
              hasScroll={false}
              isDisabled={isSettingNotPaid}
            />
          </>
        )} */}
      </div>
      {content}
      <div className={styles["download-wrapper"]}>
        <Button
          className="download-report_button"
          dataTestId={
            loginHistory
              ? "login_history_download_report_button"
              : "audit_trail_download_report_button"
          }
          primary
          label={downloadReport}
          size="normal"
          minWidth="auto"
          onMouseDown={handleMouseDown}
          isDisabled={isSettingNotPaid}
          isLoading={isLoadingDownloadReport}
        />
        <span className="download-report_description">
          {downloadReportDescription}
        </span>
      </div>
    </div>
  );
};

export default HistoryMainContent;
