// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useState } from "react";
import { Text } from "@docspace/shared/components/text";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import { TextInput } from "@docspace/shared/components/text-input";
import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import styled, { useTheme } from "styled-components";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { UnavailableStyles } from "../../../utils/commonSettingsStyles";
import { mobile, tablet } from "@docspace/shared/utils";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";

const StyledTextInput = styled(TextInput)`
  margin-top: 4px;
  margin-bottom: 24px;
  width: 350px;

  @media ${mobile} {
    width: 100%;
  }
`;

const MainContainer = styled.div`
  width: 100%;

  .main-wrapper {
    max-width: 700px;
  }

  .paid-badge {
    cursor: auto;
    margin-bottom: 8px;
    margin-inline-start: -2px;
  }

  .login-history-description {
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
    padding-bottom: 24px;
  }

  .save-cancel {
    padding: 0;
    position: static;

    .buttons-flex {
      padding: 0;
    }
  }

  .login-subheader {
    font-size: 13px;
    color: ${(props) =>
      props.theme.client.settings.security.loginHistory.subheaderColor};
  }

  .latest-text {
    font-size: 13px;
    padding: 20px 0 16px;
  }

  .storage-label {
    font-weight: 600;
  }

  .content-wrapper {
    margin-top: 16px;
    margin-bottom: 24px;
    .table-container_header {
      position: absolute;
      z-index: 1 !important;
    }

    .history-row-container {
      max-width: 700px;
    }
  }

  ${(props) => props.isSettingNotPaid && UnavailableStyles}
`;

const DownLoadWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  padding-block: 16px 30px;
  position: sticky;
  bottom: 0;
  margin-top: 32px;
  background-color: ${({ theme }) => theme.backgroundColor};

  @media ${mobile} {
    position: fixed;
    padding-inline: 16px;
    inset-inline: 0;
  }

  .download-report_button {
    width: auto;
    height: auto;
    font-size: 13px;
    line-height: 20px;
    padding-top: 5px;
    padding-bottom: 5px;

    @media ${tablet} {
      font-size: 14px;
      line-height: 16px;
      padding-top: 11px;
      padding-bottom: 11px;
    }

    @media ${mobile} {
      width: 100%;
    }
  }

  .download-report_description {
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;

    height: 16px;

    margin: 0;
    color: ${(props) =>
      props.theme.client.settings.security.auditTrail
        .downloadReportDescriptionColor};
  }

  @media ${mobile} {
    flex-direction: column-reverse;
  }
`;

const HistoryMainContent = (props) => {
  const {
    t,
    loginHistory,
    latestText,
    subHeader,
    storagePeriod,
    lifetime,
    saveButtonLabel,
    cancelButtonLabel,
    setLifetimeAuditSettings,
    securityLifetime,
    content,
    downloadReport,
    downloadReportDescription,
    getReport,
    isSettingNotPaid,
    isLoadingDownloadReport,
  } = props;

  const [loginLifeTime, setLoginLifeTime] = useState(String(lifetime) || "180");
  const [auditLifeTime, setAuditLifeTime] = useState(String(lifetime) || "180");
  const [loginLifeTimeReminder, setLoginLifeTimeReminder] = useState(false);
  const [auditLifeTimeReminder, setAuditLifeTimeReminder] = useState(false);

  const isLoginHistoryPage = window.location.pathname.includes("login-history");

  const theme = useTheme();

  useEffect(() => {
    getSettings();
  }, []);

  useEffect(() => {
    const newSettings = {
      loginHistoryLifeTime: loginLifeTime,
      auditTrailLifeTime: auditLifeTime,
    };
    saveToSessionStorage("storagePeriod", newSettings);

    if (loginLifeTime === String(lifetime)) {
      setLoginLifeTimeReminder(false);
    } else {
      setLoginLifeTimeReminder(true);
    }
  }, [loginLifeTime]);

  useEffect(() => {
    const newSettings = {
      loginHistoryLifeTime: loginLifeTime,
      auditTrailLifeTime: auditLifeTime,
    };
    saveToSessionStorage("storagePeriod", newSettings);

    if (auditLifeTime === String(lifetime)) {
      setAuditLifeTimeReminder(false);
    } else {
      setAuditLifeTimeReminder(true);
    }
  }, [auditLifeTime]);

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

  const setLifeTimeSettings = async () => {
    if (loginHistory) {
      const data = {
        settings: {
          loginHistoryLifeTime: loginLifeTime,
          auditTrailLifeTime: securityLifetime.auditTrailLifeTime,
        },
      };
      try {
        await setLifetimeAuditSettings(data);
        saveToSessionStorage("defaultStoragePeriod", {
          loginHistoryLifeTime: loginLifeTime,
          auditTrailLifeTime: securityLifetime.auditTrailLifeTime,
        });
        setLoginLifeTimeReminder(false);
        toastr.success(t("SuccessfullySaveSettingsMessage"));
      } catch (error) {
        console.error(error);
        toastr.error(error);
      }
    } else {
      const data = {
        settings: {
          loginHistoryLifeTime: securityLifetime.loginHistoryLifeTime,
          auditTrailLifeTime: auditLifeTime,
        },
      };

      try {
        await setLifetimeAuditSettings(data);
        saveToSessionStorage("defaultStoragePeriod", {
          loginHistoryLifeTime: securityLifetime.loginHistoryLifeTime,
          auditTrailLifeTime: auditLifeTime,
        });
        setAuditLifeTimeReminder(false);
        toastr.success(t("SuccessfullySaveSettingsMessage"));
      } catch (error) {
        console.error(error);
        toastr.error(error);
      }
    }
  };

  const onChangeLoginLifeTime = (e) => {
    const reg = new RegExp(/^(\d){1,3}$/g);
    const condition = e.target.value === "";
    if ((e.target.value.match(reg) && e.target.value <= 180) || condition) {
      setLoginLifeTime(e.target.value);
    }
  };

  const onChangeAuditLifeTime = (e) => {
    const reg = new RegExp(/^(\d){1,3}$/g);
    const condition = e.target.value === "";
    if ((e.target.value.match(reg) && e.target.value <= 180) || condition) {
      setAuditLifeTime(e.target.value);
    }
  };

  const onCancelLoginLifeTime = () => {
    const defaultSettings = getFromSessionStorage("defaultStoragePeriod");
    setLoginLifeTime(String(defaultSettings.loginHistoryLifeTime));
  };

  const onCancelAuditLifeTime = () => {
    const defaultSettings = getFromSessionStorage("defaultStoragePeriod");
    setAuditLifeTime(String(defaultSettings.auditTrailLifeTime));
  };

  return (
    <MainContainer isSettingNotPaid={isSettingNotPaid}>
      {isSettingNotPaid && (
        <Badge
          className="paid-badge"
          fontWeight="700"
          backgroundColor={
            theme.isBase
              ? globalColors.favoritesStatus
              : globalColors.favoriteStatusDark
          }
          label={t("Common:Paid")}
          isPaidBadge={true}
        />
      )}
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
              reminderText={t("YouHaveUnsavedChanges")}
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
              reminderText={t("YouHaveUnsavedChanges")}
              displaySettings={true}
              hasScroll={false}
              isDisabled={isSettingNotPaid}
            />
          </>
        )} */}
      </div>
      {content}
      <DownLoadWrapper>
        <Button
          className="download-report_button"
          primary
          label={downloadReport}
          size="normal"
          minWidth="auto"
          onClick={() => getReport()}
          isDisabled={isSettingNotPaid}
          isLoading={isLoadingDownloadReport}
        />
        <span className="download-report_description">
          {downloadReportDescription}
        </span>
      </DownLoadWrapper>
    </MainContainer>
  );
};

export default HistoryMainContent;
