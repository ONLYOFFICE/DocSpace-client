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

import React, { useState, useEffect } from "react";
import { i18n } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";

import { getCrashReport } from "../../utils/crashReport";

import { Link, LinkType } from "../link";
import ReportDialog from "../report-dialog";
import ErrorContainer from "../error-container/ErrorContainer";
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
    await firebaseHelper.sendCrashReport(reportWithDescription);
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
          color={currentColorScheme?.main?.accent}
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
