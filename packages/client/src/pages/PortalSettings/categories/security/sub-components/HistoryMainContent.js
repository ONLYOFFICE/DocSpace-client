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

import { useEffect, useState, useMemo } from "react";
import { Text } from "@docspace/shared/components/text";
// import { TextInput } from "@docspace/shared/components/text-input";
// import { SaveCancelButtons } from "@docspace/shared/components/save-cancel-buttons";
import styled, { useTheme } from "styled-components";
import { Button } from "@docspace/shared/components/button";
import { CampaignsBanner } from "@docspace/shared/components/campaigns-banner";
import { getLoginHistoryConfig } from "@docspace/shared/components/campaigns-banner/campaign/LoginHistoryCampaign";
import NextStepReactSvg from "PUBLIC_DIR/images/arrow.right.react.svg?url";
// import { toastr } from "@docspace/shared/components/toast";
import { mobile, tablet, size } from "@docspace/shared/utils";
import { useInterfaceDirection } from "@docspace/shared/hooks/useInterfaceDirection";
import { Badge } from "@docspace/shared/components/badge";
import { globalColors } from "@docspace/shared/themes";
import { saveToSessionStorage } from "@docspace/shared/utils/saveToSessionStorage";
import { getFromSessionStorage } from "@docspace/shared/utils/getFromSessionStorage";
import { UnavailableStyles } from "../../../utils/commonSettingsStyles";

// const StyledTextInput = styled(TextInput)`
//   margin-top: 4px;
//   margin-bottom: 24px;
//   width: 350px;

//   @media ${mobile} {
//     width: 100%;
//   }
// `;

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

const CustomBannerWrapper = styled.div`
  max-width: 700px;
  margin-bottom: 20px;
  cursor: pointer;

  @media ${mobile} {
    margin-bottom: 16px;
  }

  & > div {
    display: flex;
    align-items: center;
    min-height: 72px !important;
    max-height: none !important;
    height: auto !important;
    &::before {
      border-radius: 6px !important;
    }

    & > div {
      padding: 12px !important;
      inset-inline-end: 2px !important;
      gap: 0px;
      top: auto !important;
      max-width: 100% !important;

      &:first-child {
        margin-inline-end: 24px;
      }

      .icon-button {
        ${(props) =>
          props.isRTL &&
          `
              transform: rotate(180deg);
          `}
      }
    }

    @media ${mobile} {
      & > div {
        top: auto !important;
      }
    }
  }
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
  } = props;

  const { isRTL } = useInterfaceDirection();

  const [loginLifeTime, setLoginLifeTime] = useState(String(lifetime) || "180");
  const [auditLifeTime, setAuditLifeTime] = useState(String(lifetime) || "180");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= size.mobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= size.mobile);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const theme = useTheme();
  const isBaseTheme = theme.isBase;

  const loginHistoryTranslates = {
    Header: t("LoginHistoryCampaignHeader", {
      productName: t("Common:ProductName"),
    }),
    SubHeader: t("LoginHistoryCampaignTitle"),
    Text: t("LoginHistoryCampaignText"),
    Link: "/portal-settings/security/access-portal/tfa",
  };

  const loginHistoryConfig = useMemo(
    () => getLoginHistoryConfig(isBaseTheme, isMobile),
    [isBaseTheme, isMobile],
  );

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

  const navigateTo2FA = () => {
    window.location.href = loginHistoryTranslates.Link;
  };

  return (
    <MainContainer isSettingNotPaid={isSettingNotPaid}>
      {!tfaEnabled && withCampaign ? (
        <CustomBannerWrapper onClick={navigateTo2FA} isRTL={isRTL}>
          <CampaignsBanner
            campaignConfig={loginHistoryConfig}
            campaignTranslate={loginHistoryTranslates}
            disableFitText
            actionIcon={NextStepReactSvg}
            onAction={(type) => {
              if (type === "2fa-settings") {
                navigateTo2FA();
              }
            }}
            onClose={(e) => {
              e && e.stopPropagation && e.stopPropagation();

              navigateTo2FA();
            }}
          />
        </CustomBannerWrapper>
      ) : null}
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
      <DownLoadWrapper>
        <Button
          className="download-report_button"
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
      </DownLoadWrapper>
    </MainContainer>
  );
};

export default HistoryMainContent;
