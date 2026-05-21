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

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import React from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
  DialogAsideSkeleton,
} from "@docspace/ui-kit/components/modal-dialog";
import { LoadingButton } from "@docspace/ui-kit/components/loading-button";

import styles from "./UploadPanel.module.scss";
import FileList from "./FileList";
import withLoader from "../../../HOCs/withLoader";

class UploadPanelComponent extends React.Component {
  componentDidMount() {
    const { setNeedErrorChecking } = this.props;

    document.addEventListener("keyup", this.onKeyPress);
    setNeedErrorChecking(true, OPERATIONS_NAME.upload);
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  onClose = () => {
    const { uploadPanelVisible, setUploadPanelVisible, setNeedErrorChecking } =
      this.props;

    setUploadPanelVisible(!uploadPanelVisible);
    setNeedErrorChecking(false, OPERATIONS_NAME.upload);
  };

  onKeyPress = (event) => {
    if (event.key === "Esc" || event.key === "Escape") {
      this.onClose();
    }
  };

  clearUploadPanel = () => {
    const { clearUploadData, clearPrimaryProgressData } = this.props;
    clearUploadData();
    clearPrimaryProgressData(OPERATIONS_NAME.upload);
    this.onClose();
  };

  onCancelUpload = () => {
    const { cancelUpload } = this.props;
    cancelUpload();
  };

  getHeaderContent = () => {
    const { hideHeaderButton, uploadPercent, uploaded, converted } = this.props;
    const allProcessesFinished = uploaded && converted;

    if (hideHeaderButton) return {};

    if (allProcessesFinished) {
      return {
        headerIcons: [
          {
            key: "upload-panel",
            url: ClearReactSvgUrl,
            onClick: this.clearUploadPanel,
          },
        ],
      };
    }

    if (!uploaded) {
      return {
        headerComponent: (
          <LoadingButton
            percent={uploadPercent}
            onClick={this.onCancelUpload}
            isDefaultMode
          />
        ),
      };
    }

    return {};
  };

  render() {
    const { t, uploadPanelVisible, isUploadingAndConversion, isUploading } =
      this.props;

    const visible = uploadPanelVisible;

    const title = isUploading
      ? t("Common:Uploading")
      : isUploadingAndConversion
        ? t("UploadingAndConversion")
        : t("Files:Conversion");

    return (
      <ModalDialog
        visible={visible}
        onClose={this.onClose}
        displayType={ModalDialogType.aside}
        {...this.getHeaderContent()}
      >
        <ModalDialog.Header>{title}</ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.uploadBody}>
            <FileList />
          </div>
        </ModalDialog.Body>
      </ModalDialog>
    );
  }
}

const UploadPanel = withTranslation(["UploadPanel", "Files", "Common"])(
  withLoader(UploadPanelComponent)(<DialogAsideSkeleton isPanel />),
);

export default inject(({ settingsStore, uploadDataStore }) => {
  const {
    uploaded,
    converted,
    clearUploadData,
    cancelUpload,
    cancelConversion,
    uploadPanelVisible,
    setUploadPanelVisible,
    files,
    primaryProgressDataStore,
    isUploading,
    isUploadingAndConversion,
    uploadedFilesHistory,
  } = uploadDataStore;

  const {
    clearPrimaryProgressData,
    setNeedErrorChecking,
    primaryOperationsArray,
  } = primaryProgressDataStore;

  const uploadPercent = primaryOperationsArray.find(
    (operation) => operation.operation === OPERATIONS_NAME.upload,
  )?.percent;

  const filesWithConvert = uploadedFilesHistory.filter(
    (file) => file.action === "convert",
  );
  const hideHeaderButton =
    filesWithConvert.length > 0 &&
    filesWithConvert.every((file) => file.inConversion);

  return {
    uploadPanelVisible,
    uploaded,
    converted,

    setUploadPanelVisible,
    clearUploadData,
    cancelUpload,
    cancelConversion,
    uploadDataFiles: files,
    clearPrimaryProgressData,
    isUploading,
    isUploadingAndConversion,

    theme: settingsStore.theme,
    setNeedErrorChecking,
    hideHeaderButton,
    uploadPercent,
  };
})(observer(UploadPanel));

