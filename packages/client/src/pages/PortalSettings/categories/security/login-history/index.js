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
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject } from "mobx-react";

import { Consumer } from "@docspace/shared/utils";
import { Table } from "./TableView/TableView";
import HistoryRowContainer from "./RowView/HistoryRowContainer";
import HistoryMainContent from "../sub-components/HistoryMainContent";

const LoginHistory = (props) => {
  const {
    t,
    getLoginHistory,
    historyUsers,
    theme,
    viewAs,
    getLoginHistoryReport,
    getLifetimeAuditSettings,
    setLifetimeAuditSettings,
    securityLifetime,
    isAuditAvailable,
    resetIsInit,
    tfaEnabled,
    currentColorScheme,
  } = props;

  useEffect(() => {
    setDocumentTitle(t("LoginHistoryTitle"));

    getLoginHistory();

    getLifetimeAuditSettings();

    return () => resetIsInit();
  }, []);

  const getContent = () => {
    return (
      <div className="content-wrapper">
        <Consumer>
          {(context) =>
            viewAs === "table" ? (
              <Table
                theme={theme}
                historyUsers={historyUsers}
                sectionWidth={context.sectionWidth}
              />
            ) : (
              <HistoryRowContainer sectionWidth={context.sectionWidth} />
            )
          }
        </Consumer>
      </div>
    );
  };

  return (
    securityLifetime &&
    securityLifetime.loginHistoryLifeTime && (
      <HistoryMainContent
        t={t}
        loginHistory
        subHeader={t("LoginSubheaderTitle")}
        latestText={t("LoginLatestText")}
        storagePeriod={t("StoragePeriod")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        lifetime={securityLifetime.loginHistoryLifeTime}
        securityLifetime={securityLifetime}
        setLifetimeAuditSettings={setLifetimeAuditSettings}
        content={getContent()}
        downloadReport={t("DownloadReportBtnText")}
        downloadReportDescription={t("ReportSaveLocation", {
          sectionName: t("Common:MyFilesSection"),
        })}
        getReport={getLoginHistoryReport}
        isSettingNotPaid={!isAuditAvailable}
        tfaEnabled={tfaEnabled}
        currentColorScheme={currentColorScheme}
        withCampaign
      />
    )
  );
};

export default inject(
  ({ setup, settingsStore, currentQuotaStore, tfaStore }) => {
    const {
      getLoginHistory,
      security,
      viewAs,
      getLoginHistoryReport,
      getLifetimeAuditSettings,
      setLifetimeAuditSettings,
      securityLifetime,
      resetIsInit,
    } = setup;
    const { theme, currentColorScheme } = settingsStore;

    const { isAuditAvailable } = currentQuotaStore;

    const { tfaSettings } = tfaStore || {};
    const tfaEnabled = tfaSettings && tfaSettings !== "none";

    return {
      getLoginHistory,
      getLifetimeAuditSettings,
      setLifetimeAuditSettings,
      securityLifetime,
      historyUsers: security.loginHistory.users,
      theme,
      currentColorScheme,
      viewAs,
      getLoginHistoryReport,
      isAuditAvailable,
      resetIsInit,
      tfaEnabled,
    };
  },
)(withTranslation("Settings")(LoginHistory));
