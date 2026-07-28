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

import { Text } from "@docspace/ui-kit/components/text";
import { TooltipContainer } from "@docspace/ui-kit/components/tooltip";
import { toastr } from "@docspace/ui-kit/components/toast";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { FillingRoleProcess } from "../../components/filling-role-process";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
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
            headerText={t("Common:StartFillingBarHeader")}
            bodyText={t("Common:StartFillingBarDescription")}
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
            <TooltipContainer
              as="div"
              title={fileStatusTitle}
              className={styles.fileStatus}
              style={{ backgroundColor: color }}
            >
              <span>{fileStatusLabel}</span>
            </TooltipContainer>
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
