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

import { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject } from "mobx-react";

import { Consumer } from "@docspace/ui-kit/utils";
import { Table } from "./TableView/TableView";
import HistoryRowContainer from "./RowView/HistoryRowContainer";
import HistoryMainContent from "../sub-components/HistoryMainContent";

const LoginHistory = (props) => {
  const {
    t,
    // getLoginHistory,
    historyUsers,
    theme,
    viewAs,
    getLoginHistoryReport,
    // getLifetimeAuditSettings,
    setLifetimeAuditSettings,
    securityLifetime,
    isAuditAvailable,
    resetIsInit,
    tfaEnabled,
    currentColorScheme,
  } = props;

  useEffect(() => {
    setDocumentTitle(t("LoginHistoryTitle"));

    // getLoginHistory();

    //  getLifetimeAuditSettings();

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
        downloadReport={t("Common:DownloadReportBtnText")}
        downloadReportDescription={t("Common:ReportSaveLocation", {
          sectionName: t("Common:MyDocuments"),
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

