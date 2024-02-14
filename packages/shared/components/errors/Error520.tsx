import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { getCrashReport } from "@docspace/shared/utils/crashReport";

import { ZendeskAPI } from "../zendesk";
import { Link, LinkType } from "../link";
import ReportDialog from "../report-dialog";
import ErrorContainer from "../error-container/ErrorContainer";
import DocspaceLogo from "../docspace-logo/DocspaceLogo";

import { Error520Wrapper } from "./Errors.styled";
import type { Error520Props } from "./Errors.types";

const Error520 = ({
  user,
  version,
  errorLog,
  firebaseHelper,
  currentDeviceType,
  currentColorScheme,
  whiteLabelLogoUrls,
}: Error520Props) => {
  const { t } = useTranslation(["Common"]);

  const [reportDialogVisible, setReportDialogVisible] = useState(false);

  const autoSendReport = async () => {
    const report = getCrashReport(user.id, version, user.cultureName, errorLog);
    const reportWithDescription = Object.assign(report, {
      description: "AUTO SEND",
    });
    await firebaseHelper.sendCrashReport(reportWithDescription);
  };

  useEffect(() => {
    if (firebaseHelper.isEnabledDB) autoSendReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // const showDialog = () => {
  //   setReportDialogVisible(true);
  // };

  const closeDialog = () => {
    setReportDialogVisible(false);
  };

  const onReloadClick = () => {
    window.location.reload();
  };

  ZendeskAPI("webWidget", "show");

  if (!firebaseHelper.isEnabledDB)
    return <ErrorContainer headerText={t("SomethingWentWrong")} />;

  return (
    <Error520Wrapper>
      <DocspaceLogo className="logo" whiteLabelLogoUrls={whiteLabelLogoUrls} />
      <ErrorContainer
        isPrimaryButton={false}
        headerText={t("SomethingWentWrong")}
      />
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
      <ReportDialog
        user={user}
        error={errorLog}
        version={version}
        onClose={closeDialog}
        visible={reportDialogVisible}
        firebaseHelper={firebaseHelper}
        currentDeviceType={currentDeviceType}
      />
    </Error520Wrapper>
  );
};

export default Error520;

// const Error520Wrapper = inject(({ authStore, settingsStore, userStore }) => {
//   const { currentColorScheme, firebaseHelper } = settingsStore;
//   const { user } = userStore;

//   return {
//     currentColorScheme,
//     FirebaseHelper: firebaseHelper,
//     user,
//     version: authStore.version,
//   };
// })(observer(Error520));
