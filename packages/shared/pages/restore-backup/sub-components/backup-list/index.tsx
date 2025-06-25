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
import React from "react";
import isUndefined from "lodash/isUndefined";
import { useTranslation } from "react-i18next";

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import SocketHelper, { SocketCommands } from "../../../../utils/socket";
import {
  ModalDialog,
  ModalDialogType,
} from "../../../../components/modal-dialog";
import { Text } from "../../../../components/text";
import { Button, ButtonSize } from "../../../../components/button";
import { Link } from "../../../../components/link";
import {
  deleteBackup,
  deleteBackupHistory,
  getBackupHistory,
  startRestore,
} from "../../../../api/portal";
import { toastr } from "../../../../components/toast";
import ListLoader from "../../../../skeletons/list";
import { Checkbox } from "../../../../components/checkbox";
import { HelpButton } from "../../../../components/help-button";
import { isManagement } from "../../../../utils/common";

import { TenantStatus } from "../../../../enums";

// import config from "PACKAGE_FILE";
import { StyledBackupList } from "../../RestoreBackup.styled";

import BackupListBody from "./BackupListBody";
import { StyledFooterContent } from "./BackupList.styled";
import type {
  BackupListModalDialogProps,
  TBackupListState,
} from "./BackupList.types";
import { initState } from "./BackupList.constants";

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
        SocketHelper.emit(SocketCommands.RestoreBackup, {
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
    <Text className="restore-backup_warning-description">
      {t("Common:RestoreBackupWarningText", {
        productName: t("Common:ProductName"),
      })}{" "}
      {!standalone ? (
        <Text as="span" className="restore-backup_warning-link">
          {t("Common:RestoreBackupResetInfoWarningText", {
            productName: t("Common:ProductName"),
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
        <StyledBackupList>
          <div className="backup-list_content">
            {filesList.length > 0 ? (
              <div className="backup-restore_dialog-header">
                <Text fontSize="12px" style={{ marginBottom: "10px" }}>
                  {t("Common:BackupListWarningText")}
                </Text>
                <Link
                  id="delete-backups"
                  onClick={onCleanBackupList}
                  fontWeight={600}
                  style={{ textDecoration: "underline dotted" }}
                >
                  {t("Common:ClearBackupList")}
                </Link>
              </div>
            ) : null}

            <div className="backup-restore_dialog-scroll-body">
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
                    className="backup-restore_empty-list"
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
        </StyledBackupList>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <StyledFooterContent className="restore_footer">
          <div id="backup-list_help">
            <Checkbox
              truncate
              className="backup-list_checkbox"
              onChange={onChangeCheckbox}
              isChecked={isChecked}
            />
            <Text as="span" className="backup-list_agreement-text">
              {t("Common:UserAgreement")}
              <HelpButton
                className="backup-list_tooltip"
                offsetLeft={100}
                iconName={HelpReactSvgUrl}
                getContent={helpContent}
                tooltipMaxWidth="286px"
              />
            </Text>
          </div>

          <div className="restore_dialog-button">
            <Button
              className="restore"
              primary
              size={ButtonSize.normal}
              label={t("Common:Restore")}
              onClick={onRestorePortal}
              isDisabled={isCopyingToLocal || !isChecked}
            />
            <Button
              className="close"
              size={ButtonSize.normal}
              label={t("Common:CloseButton")}
              onClick={onModalClose}
            />
          </div>
        </StyledFooterContent>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default BackupListModalDialog;

// export default inject(({ settingsStore, backup }) => {
//   const { downloadingProgress } = backup;
//   const { theme, setTenantStatus, standalone } = settingsStore;
//   const isCopyingToLocal = downloadingProgress !== 100;

//   return {
//     setTenantStatus,
//     theme,
//     isCopyingToLocal,
//     standalone,
//   };
// })(
//   withTranslation(["Settings", "Common", "Translations"])(
//     observer(BackupListModalDialog),
//   ),
// );
