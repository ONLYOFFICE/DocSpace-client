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

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import React from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { DialogAsideSkeleton } from "@docspace/shared/skeletons/dialog";
import { LoadingButton } from "@docspace/shared/components/loading-button";

import { StyledUploadBody } from "../StyledPanels";
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
    const { cancelUpload, t } = this.props;
    cancelUpload(t);
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
      ? t("Files:Uploading")
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
          <StyledUploadBody>
            <FileList />
          </StyledUploadBody>
        </ModalDialog.Body>
      </ModalDialog>
    );
  }
}

const UploadPanel = withTranslation(["UploadPanel", "Files"])(
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
