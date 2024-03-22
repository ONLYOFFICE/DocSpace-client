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

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/vertical-dots.react.svg?url";
import ClearActiveReactSvgUrl from "PUBLIC_DIR/images/clear.active.react.svg?url";
import ButtonCancelReactSvgUrl from "PUBLIC_DIR/images/button.cancel.react.svg?url";
import React from "react";
import { IconButton } from "@docspace/shared/components/icon-button";
import { Backdrop } from "@docspace/shared/components/backdrop";
import { Heading } from "@docspace/shared/components/heading";
import { Aside } from "@docspace/shared/components/aside";
import { withTranslation } from "react-i18next";
import {
  StyledAsidePanel,
  StyledContent,
  StyledHeaderContent,
  StyledBody,
} from "../StyledPanels";
import FileList from "./FileList";
import { inject, observer } from "mobx-react";
import { DialogAsideSkeleton } from "@docspace/shared/skeletons/dialog";
import withLoader from "../../../HOCs/withLoader";

class UploadPanelComponent extends React.Component {
  constructor(props) {
    super(props);

    this.ref = React.createRef();
    this.scrollRef = React.createRef();
  }

  onClose = () => {
    const {
      uploaded,
      converted,
      clearUploadData,
      uploadPanelVisible,
      clearUploadedFiles,
      setUploadPanelVisible,
      clearPrimaryProgressData,
    } = this.props;

    setUploadPanelVisible(!uploadPanelVisible);

    if (uploaded) {
      if (converted) {
        clearUploadData();
        clearPrimaryProgressData();
      } else {
        clearUploadedFiles();
      }
    }
  };
  componentDidMount() {
    document.addEventListener("keyup", this.onKeyPress);
  }
  componentWillUnmount() {
    document.removeEventListener("keyup", this.onKeyPress);
  }

  onKeyPress = (event) => {
    if (event.key === "Esc" || event.key === "Escape") {
      this.onClose();
    }
  };

  clearUploadPanel = () => {
    this.props.clearUploadData();
    this.onClose();
  };

  onCancelUpload = () => {
    this.props.cancelUpload(this.props.t);
  };

  render() {
    //console.log("UploadPanel render");
    const {
      t,
      uploadPanelVisible,
      uploaded,
      converted,
      uploadDataFiles,
      cancelConversion,
      isUploading,
      isUploadingAndConversion,
      theme,
    } = this.props;

    const visible = uploadPanelVisible;
    const zIndex = 310;

    const title = isUploading
      ? t("Uploads")
      : isUploadingAndConversion
        ? t("UploadAndConvert")
        : t("Files:Convert");

    return (
      <StyledAsidePanel visible={visible}>
        <Backdrop
          onClick={this.onClose}
          visible={visible}
          zIndex={zIndex}
          isAside={true}
        />
        <Aside
          className="header_aside-panel"
          visible={visible}
          withoutBodyScroll
          onClose={this.onClose}
        >
          <StyledContent>
            <StyledHeaderContent className="upload-panel_header-content">
              <Heading className="upload_panel-header" size="medium" truncate>
                {title}
              </Heading>
              <div className="upload_panel-icons-container">
                <div className="upload_panel-remove-icon">
                  {uploaded && converted ? (
                    <IconButton
                      size="20"
                      iconName={ClearActiveReactSvgUrl}
                      // color={theme.filesPanels.upload.color}
                      isClickable
                      onClick={this.clearUploadPanel}
                    />
                  ) : (
                    <IconButton
                      size="20"
                      iconName={ButtonCancelReactSvgUrl}
                      // color={theme.filesPanels.upload.color}
                      isClickable
                      onClick={
                        uploaded ? cancelConversion : this.onCancelUpload
                      }
                    />
                  )}
                </div>
                {/*<div className="upload_panel-vertical-dots-icon">
                  <IconButton
                    size="20"
                    iconName={VerticalDotsReactSvgUrl}
                    color="#A3A9AE"
                  />
                  </div>*/}
              </div>
            </StyledHeaderContent>
            <StyledBody className="upload-panel_body">
              <FileList />
            </StyledBody>
          </StyledContent>
        </Aside>
      </StyledAsidePanel>
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
    clearUploadedFiles,
    uploadPanelVisible,
    setUploadPanelVisible,
    files,
    primaryProgressDataStore,
    isUploading,
    isUploadingAndConversion,
  } = uploadDataStore;

  const { clearPrimaryProgressData } = primaryProgressDataStore;

  return {
    uploadPanelVisible,
    uploaded,
    converted,

    setUploadPanelVisible,
    clearUploadData,
    cancelUpload,
    cancelConversion,
    clearUploadedFiles,
    uploadDataFiles: files,
    clearPrimaryProgressData,
    isUploading,
    isUploadingAndConversion,

    theme: settingsStore.theme,
  };
})(observer(UploadPanel));
