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
import React from "react";
import isUndefined from "lodash/isUndefined";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link } from "@docspace/ui-kit/components/link";
import {
  deleteBackup,
  deleteBackupHistory,
  getBackupHistory,
  startRestore,
} from "../../../../../api/portal";
import { toastr } from "@docspace/ui-kit/components/toast";
import ListLoader from "../../../../../skeletons/list";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { isManagement } from "../../../../../utils/common";

import { TenantStatus } from "../../../../../enums";

import BackupListBody from "./BackupListBody";
import type {
  BackupListModalDialogProps,
  TBackupListState,
} from "./BackupList.types";
import { initState } from "./BackupList.constants";
import styles from "../../RestoreBackup.module.scss";
import { getBrandName } from "@docspace/shared/constants/brands";

const BackupListModalDialog = ({
  isNotify,
  isVisibleDialog,
  onModalClose,
  navigate,

  standalone,
  setTenantStatus,

  downloadingProgress,
}: BackupListModalDialogProps) => {
  const { t } = useTranslation(["Common"]);

  const [state, setState] = React.useState<TBackupListState>(() => initState);

  const isCopyingToLocal = downloadingProgress !== 100;

  React.useEffect(() => {
    getBackupHistory(isManagement())
      .then((filesList) =>
        setState((val) => ({ ...val, filesList, isLoading: false })),
      )
      .catch((error) => {
        setState((val) => ({ ...val, isLoading: false }));
        toastr.error(error);
        console.error(error);
      });
  }, []);

  const onSelectFile = (
    e: React.MouseEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const fileInfo = e.currentTarget.name;
    const fileArray = fileInfo.split("_");
    const id = fileArray.pop();
    const index = fileArray.shift();

    if (isUndefined(id) || isUndefined(index)) return console.error(id, index);

    setState((val) => ({
      ...val,
      selectedFileIndex: +index,
      selectedFileId: id,
    }));
  };

  const onCleanBackupList = () => {
    setState((val) => ({ ...val, isLoading: true }));
    deleteBackupHistory(isManagement())
      ?.then(() => getBackupHistory(isManagement()))
      .then((filesList) =>
        setState((val) => ({ ...val, filesList, isLoading: false })),
      )
      .catch((error) => {
        toastr.error(error);
        console.error(error);
        setState((val) => ({ ...val, isLoading: false }));
      });
  };

  const onDeleteBackup = (backupId: string) => {
    if (!backupId) return;

    setState((val) => ({ ...val, isLoading: true }));
    deleteBackup(backupId)
      ?.then(() => getBackupHistory(isManagement()))
      .then((filesList) =>
        setState((val) => ({
          ...val,
          filesList: filesList ?? [],
          isLoading: false,
          selectedFileIndex: null,
          selectedFileId: null,
        })),
      )
      .catch((error) => {
        toastr.error(error);
        console.error(error);
        setState((val) => ({ ...val, isLoading: false }));
      });
  };
  const onRestorePortal = () => {
    const { selectedFileId } = state;

    if (!selectedFileId) {
      toastr.error(t("Common:RecoveryFileNotSelected"));
      return;
    }
    setState((val) => ({ ...val, isLoading: true }));
    const backupId = selectedFileId;
    const storageType = "0";
    const storageParams = [
      {
        key: "fileId",
        value: backupId,
      },
    ];

    startRestore(backupId, storageType, storageParams, isNotify, isManagement())
      ?.then(() => setTenantStatus(TenantStatus.PortalRestore))
      .then(() => {
        SocketHelper?.emit(SocketCommands.RestoreBackup, {
          dump: isManagement(),
        });
      })
      .then(() => {
        navigate("/preparation-portal");
        // navigate(
        //   combineUrl(
        //     window.ClientConfig?.proxy?.url,
        //     config.homepage,
        //     "/preparation-portal",
        //   ),
        // ),
      })
      .catch((error) => {
        toastr.error(error);
        console.error(error);
      })
      .finally(() =>
        setState((val) => ({
          ...val,
          isLoading: false,
          selectedFileIndex: null,
          selectedFileId: null,
        })),
      );
  };

  const onChangeCheckbox = () => {
    setState((val) => ({ ...val, isChecked: !val.isChecked }));
  };

  const { filesList, isLoading, selectedFileIndex, isChecked } = state;

  const helpContent = () => (
    <Text
      className={classNames(
        styles.restoreBackupWarningDescription,
        "restore-backup_warning-description",
      )}
    >
      {t("Common:RestoreBackupWarningText", {
        productName: getBrandName("ProductName"),
      })}{" "}
      {!standalone ? (
        <Text
          as="span"
          className={classNames(
            styles.restoreBackupWarningLink,
            "restore-backup_warning-link",
          )}
        >
          {t("Common:RestoreBackupResetInfoWarningText", {
            productName: getBrandName("ProductName"),
          })}
        </Text>
      ) : null}
    </Text>
  );

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      visible={isVisibleDialog}
      onClose={onModalClose}
    >
      <ModalDialog.Header>{t("Common:BackupList")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.backupList} data-testid="backup-list-modal">
          <div
            className={classNames(
              styles.backupListContent,
              "backup-list_content",
            )}
          >
            {filesList.length > 0 ? (
              <div
                className={classNames(
                  styles.backupRestoreDialogHeader,
                  "backup-restore_dialog-header",
                )}
              >
                <Text fontSize="12px" style={{ marginBottom: "10px" }}>
                  {t("Common:BackupListWarningText")}
                </Text>
                <Link
                  id="delete-backups"
                  onClick={onCleanBackupList}
                  fontWeight={600}
                  style={{ textDecoration: "underline dotted" }}
                  dataTestId="delete_backups_link"
                >
                  {t("Common:ClearBackupList")}
                </Link>
              </div>
            ) : null}

            <div
              className={classNames(
                styles.backupRestoreDialogScrollBody,
                "backup-restore_dialog-scroll-body",
              )}
            >
              {!isLoading ? (
                filesList.length > 0 ? (
                  <BackupListBody
                    filesList={filesList}
                    onDeleteBackup={onDeleteBackup}
                    onSelectFile={onSelectFile}
                    selectedFileIndex={selectedFileIndex}
                  />
                ) : (
                  <Text
                    fontSize="12px"
                    textAlign="center"
                    className={classNames(
                      styles.backupRestoreEmptyList,
                      "backup-restore_empty-list",
                    )}
                  >
                    {t("Common:EmptyBackupList")}
                  </Text>
                )
              ) : (
                <div className="loader" key="loader">
                  <ListLoader count={7} />
                </div>
              )}
            </div>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <div className={classNames(styles.footerContent, "restore_footer")}>
          <div id="backup-list_help">
            <Checkbox
              truncate
              className="backup-list_checkbox"
              onChange={onChangeCheckbox}
              isChecked={isChecked}
              dataTestId="backup_list_agreement_checkbox"
            />
            <Text
              as="span"
              className={classNames(
                styles.backupListAgreementText,
                "backup-list_agreement-text",
              )}
            >
              {t("Common:UserAgreement")}
              <HelpButton
                className={classNames(
                  styles.backupListTooltip,
                  "backup-list_tooltip",
                )}
                offsetLeft={100}
                iconName={HelpReactSvgUrl}
                getContent={helpContent}
                tooltipMaxWidth="286px"
                dataTestId="backup_list_agreement_help_button"
              />
            </Text>
          </div>

          <div
            className={classNames(
              styles.restoreDialogButton,
              "restore_dialog-button",
            )}
          >
            <Button
              className="restore"
              primary
              size={ButtonSize.normal}
              label={t("Common:Restore")}
              onClick={onRestorePortal}
              isDisabled={
                isCopyingToLocal ||
                !isChecked ||
                filesList.length === 0 ||
                !state.selectedFileId
              }
              testId="backup_list_restore_button"
            />
            <Button
              className="close"
              size={ButtonSize.normal}
              label={t("Common:CloseButton")}
              onClick={onModalClose}
              testId="backup_list_close_button"
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default BackupListModalDialog;

