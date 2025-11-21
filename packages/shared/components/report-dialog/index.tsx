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

import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import FileReactSvgUrl from "PUBLIC_DIR/images/icons/32/file.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/icons/16/download.react.svg?url";

import {
  getCrashReport,
  downloadJson,
  getCurrentDate,
} from "../../utils/crashReport";
import { DeviceType } from "../../enums";

import { Text } from "../text";
import { toastr } from "../toast";
import { Button, ButtonSize } from "../button";
import { Textarea } from "../textarea";
import { IconButton } from "../icon-button";
import { ModalDialogType, ModalDialog } from "../modal-dialog";

import styles from "./ReportDialog.module.scss";
import type { ReportDialogProps } from "./ReportDialog.types";
import { globalColors } from "../../themes";

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
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
      isLarge
      aria-labelledby="report-dialog-title"
      data-id="report-dialog"
    >
      <ModalDialog.Header>{t("ErrorReport")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.bodyContent}>
          <Text className={styles.reportDescription}>
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
            aria-label="Report description"
            data-id="report-description"
          />
          <div className={styles.reportWrapper} data-id="report-file">
            <img
              src={FileReactSvgUrl}
              className={styles.fileIcon}
              alt="report-file"
            />
            <Text as="div" fontWeight={600} className={styles.reportFilename}>
              {fileTitle}
              <Text fontWeight={600} color={globalColors.gray}>
                .json
              </Text>
            </Text>
            <IconButton
              isFill
              size={16}
              className={styles.iconButton}
              onClick={onClickDownload}
              iconName={DownloadReactSvgUrl}
              aria-label="download-report"
              data-id="download-report"
            />
          </div>
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
          data-id="send-report"
        />
        <Button
          key="CancelButton"
          onClick={onCloseAction}
          size={ButtonSize.normal}
          label={t("CancelButton")}
          scale={currentDeviceType === DeviceType.mobile}
          data-id="cancel-report"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ReportDialog;
