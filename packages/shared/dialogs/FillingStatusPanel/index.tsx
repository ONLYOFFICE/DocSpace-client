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

"use client";

import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { match } from "ts-pattern";

import PDFIcon from "PUBLIC_DIR/images/icons/24/pdf.svg";
import InfoSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";

import {
  getFillingStatusLabel,
  getFillingStatusTitle,
  getTitleWithoutExtension,
} from "../../utils";
import { FILLING_FORM_STATUS_COLORS } from "../../constants";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { FileFillingFormStatus } from "../../enums";

import { Text } from "../../components/text";
import { toastr } from "../../components/toast";
import PublicRoomBar from "../../components/public-room-bar";
import { Heading, HeadingLevel } from "../../components/heading";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { FillingRoleProcess } from "../../components/filling-role-process";
import { Button, ButtonSize } from "../../components/button";
import { getFormFillingStatus as getFormFillingStatusApi } from "../../api/files";
import type { TFileFillingFormStatus } from "../../api/files/types";
import { createLoader } from "../../utils/createLoader";

import styles from "./FillingStatusPanel.module.scss";
import type { FillingStatusPanelProps } from "./FillingStatusPanel.types";

export const FillingStatusPanel = ({
  visible,
  onClose,
  onFill,
  onStopFilling,
  file,
  user,
  onDelete,
  onResetFilling,
  withBorder,
}: FillingStatusPanelProps) => {
  const { t } = useTranslation(["Common"]);
  const [value, setValue] = useLocalStorage(
    `fillingStatusBarPanel-${user.id}`,
    true,
  );
  const [formFillingStatus, setFormFillingStatus] = useState<
    TFileFillingFormStatus[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const fileName = getTitleWithoutExtension(file, false);
  const fillingStatus = file.formFillingStatus!;

  const color = FILLING_FORM_STATUS_COLORS[fillingStatus];

  const { fileStatusTitle, fileStatusLabel } = useMemo(() => {
    const label = getFillingStatusLabel(fillingStatus, t);
    const title = getFillingStatusTitle(fillingStatus, t);

    return {
      fileStatusTitle: title,
      fileStatusLabel: label,
    };
  }, [fillingStatus, t]);

  const getFormFillingStatus = useCallback(async () => {
    const { startLoader, endLoader } = createLoader();

    startLoader(() => setIsLoading(true));

    const res = await getFormFillingStatusApi(file.id).catch((err) => {
      console.log(err);
      toastr.error(err);
    });
    setFormFillingStatus(res ?? []);

    endLoader(() => setIsLoading(false));
  }, [file.id]);

  useEffect(() => {
    getFormFillingStatus();
  }, [getFormFillingStatus]);

  return (
    <ModalDialog
      withBodyScroll
      visible={visible}
      onClose={onClose}
      isLoading={isLoading}
      displayType={ModalDialogType.aside}
      withBorder={withBorder}
    >
      <ModalDialog.Header>{t("Common:FillingStatus")}</ModalDialog.Header>
      <ModalDialog.Body>
        {value ? (
          <PublicRoomBar
            headerText={t("Common:FillingStatusBarTitle")}
            bodyText={t("Common:FillingStatusBarDescription")}
            iconName={InfoSvgUrl}
            onClose={() => setValue(false)}
            className={styles.infoBar}
          />
        ) : null}
        <div className={styles.fileInfo}>
          <PDFIcon className={styles.pdfIcon} />
          <Text title={fileName} truncate className={styles.fileName}>
            {fileName}
          </Text>
          {fillingStatus ? (
            <div
              title={fileStatusTitle}
              className={styles.fileStatus}
              style={{ backgroundColor: color }}
            >
              <span>{fileStatusLabel}</span>
            </div>
          ) : null}
        </div>
        <div className={styles.processContainer}>
          <Heading
            fontSize="14px"
            className={styles.processTitle}
            level={HeadingLevel.h5}
          >
            {t("Common:ProcessDetails")}
          </Heading>
          <FillingRoleProcess
            fileStatus={fillingStatus}
            processDetails={formFillingStatus}
            currentUserId={user.id}
          />
        </div>
      </ModalDialog.Body>

      {match(fillingStatus)
        .with(FileFillingFormStatus.YourTurn, () => {
          if (!(onFill || file.security.StopFilling)) return null;

          return (
            <ModalDialog.Footer>
              {onFill ? (
                <Button
                  scale
                  primary
                  onClick={() => onFill?.(file)}
                  id="panel_button_fill"
                  key="panel_button_fill"
                  label={t("Common:FillFormButton")}
                  size={ButtonSize.normal}
                />
              ) : null}
              {file.security.StopFilling ? (
                <Button
                  id="panel_button_stop"
                  key="panel_button_stop"
                  onClick={() => onStopFilling(file)}
                  label={t("Common:StopFilling")}
                  size={ButtonSize.normal}
                  scale
                />
              ) : null}
            </ModalDialog.Footer>
          );
        })
        .with(FileFillingFormStatus.Stopped, () => {
          if (
            !(
              file.security?.ResetFilling ||
              (file.security?.Delete && onDelete)
            )
          )
            return null;

          return (
            <ModalDialog.Footer>
              {file.security?.ResetFilling ? (
                <Button
                  scale
                  primary
                  onClick={() => onResetFilling(file)}
                  id="panel_button_reset-and-start"
                  key="panel_button_reset-and-start"
                  label={t("Common:ResetAndStartFilling")}
                  size={ButtonSize.normal}
                />
              ) : null}
              {file.security?.Delete && onDelete ? (
                <Button
                  id="panel_button_file-delete"
                  key="panel_button_file-delete"
                  onClick={() => onDelete(file)}
                  label={t("Common:ButtonDeleteFile")}
                  size={ButtonSize.normal}
                  scale
                />
              ) : null}
            </ModalDialog.Footer>
          );
        })
        .with(FileFillingFormStatus.Completed, () => null)
        .otherwise(() => {
          return file.security.StopFilling ? (
            <ModalDialog.Footer>
              <Button
                id="panel_button_stop"
                key="panel_button_stop"
                label={t("Common:StopFilling")}
                size={ButtonSize.normal}
                scale
                onClick={() => onStopFilling(file)}
              />
            </ModalDialog.Footer>
          ) : null;
        })}
    </ModalDialog>
  );
};
