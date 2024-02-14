import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import FileReactSvgUrl from "PUBLIC_DIR/images/icons/24/file.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";

import {
  getCrashReport,
  downloadJson,
  getCurrentDate,
} from "@docspace/shared/utils/crashReport";
import { DeviceType } from "@docspace/shared/enums";

import { Text } from "../text";
import { toastr } from "../toast";
import { Button, ButtonSize } from "../button";
import { Textarea } from "../textarea";
import { IconButton } from "../icon-button";
import { ModalDialogType, ModalDialog } from "../modal-dialog";

import { ModalDialogContainer } from "./ReportDialog.styled";
import type { ReportDialogProps } from "./ReportDialog.types";

const ReportDialog = (props: ReportDialogProps) => {
  const { t, ready } = useTranslation(["Common"]);
  const {
    visible,
    onClose,
    error,
    user,
    version,
    firebaseHelper,
    currentDeviceType,
  } = props;

  const report = useMemo(() => {
    return getCrashReport(user.id, version, user.cultureName, error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [description, setDescription] = useState("");

  const fileTitle = useMemo(
    () => `${t("ErrorReport")} ${getCurrentDate()}`,
    [t],
  );

  const onChangeTextareaValue = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  };

  const onClickDownload = () => {
    downloadJson(report, fileTitle);
  };

  const onCloseAction = () => {
    setDescription("");
    onClose();
  };

  const onClickSend = async () => {
    try {
      const reportWithDescription = Object.assign(report, {
        description,
      });
      await firebaseHelper.sendCrashReport(reportWithDescription);
      toastr.success(t("ErrorReportSuccess"));
      onCloseAction();
    } catch (err) {
      toastr.error(err as Error);
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <ModalDialogContainer
      isLoading={!ready}
      visible={visible}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("ErrorReport")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text className="report-description" noSelect>
          {t("ErrorReportDescription")}
        </Text>
        <Textarea
          placeholder={t("RecoverDescribeYourProblemPlaceholder")}
          value={description}
          onChange={onChangeTextareaValue}
          autoFocus
          areaSelect
          heightTextArea="72px"
          fontSize={13}
        />
        <div className="report-wrapper">
          <img src={FileReactSvgUrl} className="file-icon" alt="" />
          <Text as="div" fontWeight={600} noSelect className="report-filename">
            {fileTitle}
            <Text fontWeight={600} noSelect color="#A3A9AE">
              .json
            </Text>
          </Text>
          <IconButton
            isFill
            size={16}
            className="icon-button"
            onClick={onClickDownload}
            iconName={DownloadReactSvgUrl}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          primary
          key="SendButton"
          onClick={onClickSend}
          label={t("SendButton")}
          size={ButtonSize.normal}
          scale={currentDeviceType === DeviceType.mobile}
        />
        <Button
          key="CancelButton"
          onClick={onCloseAction}
          size={ButtonSize.normal}
          label={t("CancelButton")}
          scale={currentDeviceType === DeviceType.mobile}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default ReportDialog;

// export default inject(({ authStore, settingsStore, userStore }) => {
//   const { user } = userStore;
//   const { firebaseHelper } = settingsStore;

//   return {
//     user,
//     version: authStore.version,
//     FirebaseHelper: firebaseHelper,
//   };
// })(observer(ReportDialog));
