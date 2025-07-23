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

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import React from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import SocketHelper, { SocketCommands } from "@docspace/shared/utils/socket";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { Link } from "@docspace/shared/components/link";
import {
  deleteBackup,
  deleteBackupHistory,
  getBackupHistory,
  startRestore,
} from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import ListLoader from "@docspace/shared/skeletons/list";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { HelpButton } from "@docspace/shared/components/help-button";
import { isManagement } from "@docspace/shared/utils/common";

import config from "PACKAGE_FILE";
import { TenantStatus } from "@docspace/shared/enums";
import styled from "styled-components";
import { StyledBackupList } from "../../../StyledBackup";
import BackupListBody from "./BackupListBody";

const StyledFooterContent = styled.div`
  width: 100%;
  .restore_dialog-button {
    display: flex;
    button:first-child {
      margin-inline-end: 10px;
      width: 50%;
    }
    button:last-child {
      width: 50%;
    }
  }
  #backup-list_help {
    display: flex;
    background-color: ${(props) => props.theme.backgroundColor};
    margin-bottom: 16px;
  }

  .backup-list_agreement-text {
    user-select: none;
    div:first-child {
      display: inline-block;
    }
  }

  .backup-list_tooltip {
    margin-inline-start: 8px;
  }
`;

const BackupListModalDialog = (props) => {
  const [state, setState] = React.useState({
    isLoading: true,
    filesList: [],
    selectedFileIndex: null,
    selectedFileId: null,
    isChecked: false,
  });

  const navigate = useNavigate();

  React.useEffect(() => {
    getBackupHistory(isManagement())
      .then((filesList) =>
        setState((val) => ({ ...val, filesList, isLoading: false })),
      )
      .catch(() => setState((val) => ({ ...val, isLoading: false })));
  }, []);

  const onSelectFile = (e) => {
    const fileInfo = e.target.name;
    const fileArray = fileInfo.split("_");
    const id = fileArray.pop();
    const index = fileArray.shift();

    setState((val) => ({
      ...val,
      selectedFileIndex: +index,
      selectedFileId: id,
    }));
  };

  const onCleanBackupList = () => {
    setState((val) => ({ ...val, isLoading: true }));
    deleteBackupHistory(isManagement())
      .then(() => getBackupHistory(isManagement()))
      .then((filesList) =>
        setState((val) => ({ ...val, filesList, isLoading: false })),
      )
      .catch((error) => {
        toastr.error(error);
        setState((val) => ({ ...val, isLoading: false }));
      });
  };
  const onDeleteBackup = (backupId) => {
    if (!backupId) return;

    setState((val) => ({ ...val, isLoading: true }));
    deleteBackup(backupId)
      .then(() => getBackupHistory(isManagement()))
      .then((filesList) =>
        setState((val) => ({
          ...val,
          filesList,
          isLoading: false,
          selectedFileIndex: null,
          selectedFileId: null,
        })),
      )
      .catch((error) => {
        toastr.error(error);
        setState((val) => ({ ...val, isLoading: false }));
      });
  };
  const onRestorePortal = () => {
    const { selectedFileId } = state;
    const { isNotify, t, setTenantStatus } = props;

    if (!selectedFileId) {
      toastr.error(t("RecoveryFileNotSelected"));
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

    startRestore(backupId, storageType, storageParams, isNotify)
      .then(() => setTenantStatus(TenantStatus.PortalRestore))
      .then(() => {
        SocketHelper.emit(SocketCommands.RestoreBackup, {
          dump: isManagement(),
        });
      })
      .then(() =>
        navigate(
          combineUrl(
            window.ClientConfig?.proxy?.url,
            config.homepage,
            "/preparation-portal",
          ),
        ),
      )
      .catch((error) => toastr.error(error))
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

  const {
    onModalClose,
    isVisibleDialog,
    t,
    isCopyingToLocal,
    theme,
    standalone,
  } = props;
  const { filesList, isLoading, selectedFileIndex, isChecked } = state;

  const helpContent = () => (
    <Text className="restore-backup_warning-description">
      {t("RestoreBackupWarningText", {
        productName: t("Common:ProductName"),
      })}{" "}
      {!standalone ? (
        <Text as="span" className="restore-backup_warning-link">
          {t("RestoreBackupResetInfoWarningText", {
            productName: t("Common:ProductName"),
          })}
        </Text>
      ) : null}
    </Text>
  );

  return (
    <ModalDialog
      displayType="aside"
      visible={isVisibleDialog}
      onClose={onModalClose}
    >
      <ModalDialog.Header>{t("BackupList")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBackupList
          isCopyingToLocal={isCopyingToLocal}
          isEmpty={filesList?.length === 0}
          theme={theme}
        >
          <div className="backup-list_content">
            {filesList.length > 0 ? (
              <div className="backup-restore_dialog-header">
                <Text fontSize="12px" style={{ marginBottom: "10px" }}>
                  {t("BackupListWarningText")}
                </Text>
                <Link
                  id="delete-backups"
                  onClick={onCleanBackupList}
                  fontWeight={600}
                  style={{ textDecoration: "underline dotted" }}
                >
                  {t("ClearBackupList")}
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
                    {t("EmptyBackupList")}
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
              {t("UserAgreement")}
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
              size="normal"
              label={t("Common:Restore")}
              onClick={onRestorePortal}
              isDisabled={isCopyingToLocal || !isChecked}
            />
            <Button
              className="close"
              size="normal"
              label={t("Common:CloseButton")}
              onClick={onModalClose}
            />
          </div>
        </StyledFooterContent>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

BackupListModalDialog.propTypes = {
  onModalClose: PropTypes.func.isRequired,
  isVisibleDialog: PropTypes.bool.isRequired,
};

export default inject(({ settingsStore, backup }) => {
  const { downloadingProgress } = backup;
  const { theme, setTenantStatus, standalone } = settingsStore;
  const isCopyingToLocal = downloadingProgress !== 100;

  return {
    setTenantStatus,
    theme,
    isCopyingToLocal,
    standalone,
  };
})(
  withTranslation(["Settings", "Common", "Translations"])(
    observer(BackupListModalDialog),
  ),
);
