import FileReactSvgUrl from "PUBLIC_DIR/images/icons/24/file.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Textarea } from "@docspace/shared/components/textarea";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { IconButton } from "@docspace/shared/components/icon-button";
import { toastr } from "@docspace/shared/components/toast";
import {
  getCrashReport,
  downloadJson,
  getCurrentDate,
} from "@docspace/shared/utils/crashReport";
import { DeviceType } from "@docspace/shared/enums";

const ModalDialogContainer = styled(ModalDialog)`
  #modal-dialog {
    width: auto;
    max-width: 520px;
    max-height: 560px;
  }

  .report-description {
    margin-bottom: 16px;
  }

  .report-wrapper {
    margin-top: 8px;
    height: 48px;
    display: flex;
    gap: 16px;
    align-items: center;

    .report-filename {
      display: flex;
    }

    .file-icon {
      width: 24px;
      user-select: none;
    }

    .icon-button {
      cursor: pointer;
    }
  }
`;

const ReportDialog = (props) => {
  const { t, ready } = useTranslation(["Common"]);
  const {
    visible,
    onClose,
    error,
    user,
    version,
    FirebaseHelper,
    currentDeviceType,
  } = props;
  const [report, setReport] = useState({});
  const [description, setDescription] = useState("");

  useEffect(() => {
    const report = getCrashReport(user.id, version, user.cultureName, error);
    setReport(report);
    console.log(report);
  }, []);

  const onChangeTextareaValue = (e) => {
    setDescription(e.target.value);
  };

  const onClickDownload = () => {
    downloadJson(report, fileTitle);
  };

  const onClickSend = async () => {
    try {
      const reportWithDescription = Object.assign(report, {
        description: description,
      });
      await FirebaseHelper.sendCrashReport(reportWithDescription);
      toastr.success(t("ErrorReportSuccess"));
      onCloseAction();
    } catch (e) {
      console.error(e);
      toastr.error(e);
    }
  };

  const onCloseAction = () => {
    setDescription("");
    onClose();
  };

  const fileTitle = t("ErrorReport") + " " + getCurrentDate();

  return (
    <ModalDialogContainer
      isLoading={!ready}
      visible={visible}
      onClose={onCloseAction}
      displayType="modal"
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
          <img src={FileReactSvgUrl} className="file-icon" />
          <Text as="div" fontWeight={600} noSelect className="report-filename">
            {fileTitle}
            <Text fontWeight={600} noSelect color="#A3A9AE">
              .json
            </Text>
          </Text>
          <IconButton
            className="icon-button"
            iconName={DownloadReactSvgUrl}
            size="16"
            isfill={true}
            onClick={onClickDownload}
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="SendButton"
          label={t("SendButton")}
          size="normal"
          primary
          scale={currentDeviceType === DeviceType.mobile}
          onClick={onClickSend}
        />
        <Button
          key="CancelButton"
          label={t("CancelButton")}
          size="normal"
          scale={currentDeviceType === DeviceType.mobile}
          onClick={onCloseAction}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default inject(({ authStore, settingsStore, userStore }) => {
  const { user } = userStore;
  const { firebaseHelper } = settingsStore;

  return {
    user,
    version: authStore.version,
    FirebaseHelper: firebaseHelper,
  };
})(observer(ReportDialog));
