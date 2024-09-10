// (c) Copyright Ascensio System SIA 2009-2024
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

import { StyledBodyContent } from "./ReportDialog.styled";
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
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      onClose={onCloseAction}
      displayType={ModalDialogType.modal}
      isLarge
    >
      <ModalDialog.Header>{t("ErrorReport")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyContent>
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
            <Text
              as="div"
              fontWeight={600}
              noSelect
              className="report-filename"
            >
              {fileTitle}
              <Text fontWeight={600} noSelect color={globalColors.gray}>
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
        </StyledBodyContent>
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
    </ModalDialog>
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
