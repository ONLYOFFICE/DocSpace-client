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

import React, { useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import { inject } from "mobx-react";

import { Consumer } from "@docspace/shared/utils";
import { EmptyScreenContainer } from "@docspace/shared/components/empty-screen-container";

import EmptyScreenRecentUrl from "PUBLIC_DIR/images/empty_screen_recent.svg?url";
import EmptyScreenRecentDarkUrl from "PUBLIC_DIR/images/empty_screen_recent_dark.svg?url";
import { Table } from "./TableView/TableView";
import AuditRowContainer from "./RowView/AuditRowContainer";
import HistoryMainContent from "../sub-components/HistoryMainContent";

import AuditTrailLoader from "./AuditTrailLoader";

let timerId = null;
const AuditTrail = (props) => {
  const {
    t,
    getAuditTrail,
    auditTrailUsers,
    theme,
    viewAs,
    setLifetimeAuditSettings,
    getLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isAuditAvailable,
    isLoadingDownloadReport,
    resetIsInit,
  } = props;

  const [isLoading, setIsLoading] = useState(!auditTrailUsers.length);
  const [isShowLoader, setIShowLoader] = useState(false);
  const initAudit = async () => {
    timerId = setTimeout(() => {
      if (!auditTrailUsers.length) setIShowLoader(true);
    }, 500);

    await getAuditTrail();

    clearTimeout(timerId);
    timerId = null;
    setIShowLoader(false);
    setIsLoading(false);
  };

  useEffect(() => {
    setDocumentTitle(t("AuditTrailNav"));
    initAudit();
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

  if (isShowLoader) {
    return <AuditTrailLoader />;
  }

  if (isLoading) return null;

  if (auditTrailUsers.length === 0) {
    return (
      <EmptyScreenContainer
        descriptionText={t("AuditSubheader", {
          productName: t("Common:ProductName"),
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
          productName: t("Common:ProductName"),
        })}
        latestText={t("LoginLatestText")}
        storagePeriod={t("StoragePeriod")}
        saveButtonLabel={t("Common:SaveButton")}
        cancelButtonLabel={t("Common:CancelButton")}
        securityLifetime={securityLifetime}
        lifetime={securityLifetime.auditTrailLifeTime}
        setLifetimeAuditSettings={setLifetimeAuditSettings}
        content={getContent()}
        downloadReport={t("DownloadReportBtnText")}
        downloadReportDescription={t("ReportSaveLocation", {
          sectionName: t("Common:MyFilesSection"),
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
    getAuditTrail,
    security,
    viewAs,
    getLifetimeAuditSettings,
    setLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isLoadingDownloadReport,
    resetIsInit,
  } = setup;

  const { theme } = settingsStore;
  const { isAuditAvailable } = currentQuotaStore;
  return {
    getAuditTrail,
    auditTrailUsers: security.auditTrail.users,
    theme,
    viewAs,
    getLifetimeAuditSettings,
    setLifetimeAuditSettings,
    getAuditTrailReport,
    securityLifetime,
    isAuditAvailable,
    isLoadingDownloadReport,
    resetIsInit,
  };
})(withTranslation("Settings")(AuditTrail));
