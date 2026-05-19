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

import React, { useEffect } from "react";
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject } from "mobx-react";

import { Consumer } from "@docspace/ui-kit/utils";
import { EmptyScreenContainer } from "@docspace/ui-kit/components/empty-screen-container";

import EmptyScreenRecentUrl from "PUBLIC_DIR/images/emptyview/empty.history.light.svg?url";
import EmptyScreenRecentDarkUrl from "PUBLIC_DIR/images/emptyview/empty.history.dark.svg?url";
import { Table } from "./TableView/TableView";
import AuditRowContainer from "./RowView/AuditRowContainer";
import HistoryMainContent from "../sub-components/HistoryMainContent";
import { getBrandName } from "@docspace/shared/constants/brands";

const AuditTrail = (props) => {
  const {
    t,
    auditTrailUsers,
    theme,
    viewAs,
    setLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isAuditAvailable,
    isLoadingDownloadReport,
    resetIsInit,
  } = props;

  useEffect(() => {
    setDocumentTitle(t("AuditTrailNav"));

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
                auditTrailUsers={auditTrailUsers}
                sectionWidth={context.sectionWidth}
                isSettingNotPaid={!isAuditAvailable}
              />
            ) : (
              <AuditRowContainer
                sectionWidth={context.sectionWidth}
                isSettingNotPaid={!isAuditAvailable}
              />
            )
          }
        </Consumer>
      </div>
    );
  };

  if (auditTrailUsers.length === 0) {
    return (
      <EmptyScreenContainer
        descriptionText={t("AuditSubheader", {
          productName: getBrandName("ProductName"),
        })}
        imageSrc={
          theme.isBase ? EmptyScreenRecentUrl : EmptyScreenRecentDarkUrl
        }
        headerText={t("NoEventsHereYet")}
      />
    );
  }

  return (
    securityLifetime &&
    securityLifetime.auditTrailLifeTime && (
      <HistoryMainContent
        t={t}
        subHeader={t("AuditSubheader", {
          productName: getBrandName("ProductName"),
        })}
        latestText={t("LoginLatestText")}
        storagePeriod={t("StoragePeriod")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        securityLifetime={securityLifetime}
        lifetime={securityLifetime.auditTrailLifeTime}
        setLifetimeAuditSettings={setLifetimeAuditSettings}
        content={getContent()}
        downloadReport={t("Common:DownloadReportBtnText")}
        downloadReportDescription={t("Common:ReportSaveLocation", {
          sectionName: t("Common:MyDocuments"),
        })}
        getReport={getAuditTrailReport}
        isSettingNotPaid={!isAuditAvailable}
        isLoadingDownloadReport={isLoadingDownloadReport}
      />
    )
  );
};

export default inject(({ setup, settingsStore, currentQuotaStore }) => {
  const {
    security,
    viewAs,
    setLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isLoadingDownloadReport,
    resetIsInit,
  } = setup;

  const { theme } = settingsStore;
  const { isAuditAvailable } = currentQuotaStore;
  return {
    auditTrailUsers: security.auditTrail.users,
    theme,
    viewAs,
    setLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isAuditAvailable,
    isLoadingDownloadReport,
    resetIsInit,
  };
})(withTranslation("Settings")(AuditTrail));

