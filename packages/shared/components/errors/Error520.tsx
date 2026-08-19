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

import React, { useState, useEffect } from "react";
import { i18n } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";

import { getCrashReport } from "../../utils/crashReport";

import { Link, LinkType } from "@docspace/ui-kit/components/link";
import ReportDialog from "../report-dialog";
import ErrorContainer from "@docspace/ui-kit/components/error-container/ErrorContainer";
import { zendeskAPI } from "../zendesk/Zendesk.utils";

import styles from "./Errors.module.scss";
import type { Error520Props } from "./Errors.types";

const Error520 = ({
  user,
  version,
  errorLog,
  firebaseHelper,
  currentDeviceType,
  currentColorScheme,
}: Error520Props) => {
  const { t } = useTranslation(["Common"]);

  const [reportDialogVisible, setReportDialogVisible] = useState(false);
  const [customErrorLog, setCustomErrorLog] = useState<Error>({} as Error);

  const autoSendReport = async () => {
    const report = getCrashReport(user.id, version, user.cultureName, errorLog);
    const reportWithDescription = Object.assign(report, {
      description: "AUTO SEND",
    });
    await firebaseHelper?.sendCrashReport(reportWithDescription);
  };

  useEffect(() => {
    if (firebaseHelper?.isEnabledDB) autoSendReport();
  }, []);

  useEffect(() => {
    const errorString = window.sessionStorage.getItem("errorLog");

    if (!errorString) return;

    const error = JSON.parse(errorString) as Error;

    if (error) {
      setCustomErrorLog(error);
      console.log(error.stack);
    }
  }, []);

  const closeDialog = () => {
    setReportDialogVisible(false);
  };

  const onReloadClick = () => {
    window.location.reload();
  };

  zendeskAPI.addChanges("webWidget", "show");

  if (!firebaseHelper?.isEnabledDB)
    return (
      <ErrorContainer
        headerText={t("SomethingWentWrong")}
        customizedBodyText={errorLog?.message ?? customErrorLog?.message}
      />
    );

  return (
    <div className={styles.error520Wrapper}>
      <ErrorContainer
        className="container"
        isPrimaryButton={false}
        headerText={t("SomethingWentWrong")}
        customizedBodyText={errorLog?.message ?? customErrorLog?.message}
      >
        <Link
          isHovered
          className="link"
          fontWeight={600}
          type={LinkType.action}
          onClick={onReloadClick}
          color={currentColorScheme?.main?.accent ?? undefined}
        >
          {t("ReloadPage")}
        </Link>
      </ErrorContainer>

      <ReportDialog
        user={user}
        error={errorLog ?? customErrorLog}
        version={version}
        onClose={closeDialog}
        visible={reportDialogVisible}
        firebaseHelper={firebaseHelper}
        currentDeviceType={currentDeviceType}
      />
    </div>
  );
};

export default Error520;

export const Error520SSR = ({
  i18nProp,
  ...rest
}: {
  i18nProp: i18n;
} & Error520Props) => {
  if (!i18nProp.language) return null;
  return (
    <I18nextProvider i18n={i18nProp}>
      <Error520 {...rest} />
    </I18nextProvider>
  );
};
