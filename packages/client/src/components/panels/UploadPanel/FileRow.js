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

import React, { Component } from "react";
import styled, { css } from "styled-components";
import { Row } from "@docspace/shared/components/rows";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMobile } from "react-device-detect";
import { NoUserSelect } from "@docspace/shared/utils";
import { Button } from "@docspace/shared/components/button";
import { ProgressBar } from "@docspace/shared/components/progress-bar";
import { IconButton } from "@docspace/shared/components/icon-button";

import CloseSvgUrl from "PUBLIC_DIR/images/icons/12/cross.react.svg?url";

import ActionsUploadedFile from "./SubComponents/ActionsUploadedFile";
import ErrorFileUpload from "./SubComponents/ErrorFileUpload";
import SimulatePassword from "../../SimulatePassword";

const StyledFileRow = styled(Row)`
  width: 100%;
  box-sizing: border-box;

  .row_context-menu-wrapper {
    width: auto;
    display: none;
  }

  ${!isMobile && "min-height: 48px;"}

  height: 100%;

  padding-inline-end: 16px;

  .styled-element,
  .row_content {
    ${(props) =>
      props.showPasswordInput &&
      css`
        margin-top: -36px;
      `}
  }

  .styled-element {
    margin-inline-end: 8px !important;
  }

  .upload-panel_file-name {
    max-width: 412px;
    overflow: hidden;
    text-overflow: ellipsis;
    align-items: center;
    display: flex;
  }

  .enter-password {
    white-space: nowrap;
    max-width: 97px;
    overflow: hidden;
    ${NoUserSelect}
  }
  .password-input {
    position: absolute;
    top: 37px;
    ${(props) =>
      props.showPasswordInput &&
      css`
        top: 48px;
      `}
    inset-inline: 0;
    max-width: 470px;
    width: calc(100% - 16px);
    display: flex;
  }

  #conversion-button {
    margin-inline-start: 8px;
    width: 100%;
    max-width: 78px;
  }
  .row_content > a,
  .row_content > p {
    margin: auto 0;
    line-height: 16px;
  }

  .upload_panel-icon {
    margin-inline-start: auto;
    padding-inline-start: 16px;

    line-height: 24px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;

    svg {
      width: 16px;
      height: 16px;
    }

    .enter-password {
      color: ${(props) => props.theme.filesPanels.upload.color};
      margin-inline-end: 8px;
      text-decoration: underline dashed;
      cursor: pointer;
    }
  }

  .img_error {
    filter: grayscale(1);
  }

  .convert_icon {
    color: ${(props) => props.theme.filesPanels.upload.iconFill};
    padding-inline-end: 12px;
  }

  .upload-panel_file-row-link {
    ${(props) =>
      !props.isMediaActive &&
      css`
        cursor: default;
      `}
    :hover {
      cursor: pointer;
    }
  }

  .upload-panel-file-error_text {
    ${(props) =>
      props.isError &&
      css`
        color: ${props.theme.filesPanels.upload.color};
      `}
  }

  .file-exst {
    color: ${(props) => props.theme.filesPanels.upload.color};
  }

  .actions-wrapper {
    display: flex;
    margin-inline-start: auto;
    padding-inline-start: 16px;

    align-items: center;

    .upload-panel_percent-text {
      margin-left: 16px;
    }
    .upload-panel_close-button,
    .upload-panel_check-button {
      margin-left: 16px;
    }
    .upload-panel_check-button {
      path {
        fill: ${(props) => props.theme.filesPanels.upload.positiveStatusColor};
      }
    }
  }
`;
class FileRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPasswordInput: false,
      password: "",
      passwordValid: true,
    };
    this.inputRef = React.createRef();
    this.onChangePassword = this.onChangePassword.bind(this);
  }

  onTextClick = () => {
    const { showPasswordInput } = this.state;
    const { updateRowsHeight, index } = this.props;

    const newState = !showPasswordInput;

    this.setState({ showPasswordInput: newState }, () => {
      updateRowsHeight && updateRowsHeight(index, newState);
    });
  };

  onCancelCurrentUpload = (e) => {
    // console.log("cancel upload ", e);
    const { id, action, fileId } = e.currentTarget.dataset;
    const { t, cancelCurrentUpload, cancelCurrentFileConversion } = this.props;

    return action === "convert"
      ? cancelCurrentFileConversion(fileId)
      : cancelCurrentUpload(id, t);
  };

  onMediaClick = (id) => {
    const {
      setMediaViewerData,
      setUploadPanelVisible,

      isMediaActive,
      setCurrentItem,
      item,
    } = this.props;
    if (!isMediaActive) setCurrentItem(item);

    const data = { visible: true, id };
    setMediaViewerData(data);
    setUploadPanelVisible(false);
  };

  onButtonClick = () => {
    const { password } = this.state;
    const { removeFileFromList, convertFile, item, uploadedFiles } = this.props;
    const { fileId, toFolderId, fileInfo } = item;

    if (this.hasError()) return;

    const index = uploadedFiles.findIndex((f) => f.fileId === fileId);

    const newItem = {
      fileId,
      toFolderId,
      action: "convert",
      fileInfo,
      password,
      index,
    };

    this.onTextClick();
    removeFileFromList(fileId);
    convertFile(newItem);
  };

  onChangePassword(password) {
    this.setState((prevState) => ({
      password,
      ...(!prevState.passwordValid && { passwordValid: true }),
    }));
  }

  hasError = () => {
    const { password } = this.state;
    const pass = password.trim();
    if (!pass) {
      this.setState({ passwordValid: false });
      return true;
    }

    return false;
  };

  onKeyDown = (e) => {
    if (e.key === "Enter") {
      this.onButtonClick();
    }
  };

  render() {
    const {
      t,
      item,
      uploaded,
      fileIcon,
      isMedia,
      ext,
      name,
      isMediaActive,
      downloadInCurrentTab,
      isPlugin,
      onPluginClick,
      theme,
    } = this.props;

    const { showPasswordInput, password, passwordValid } = this.state;

    const fileExtension = ext ? (
      <Text as="span" fontWeight="600" className="file-exst">
        {ext}
      </Text>
    ) : null;

    const onMediaClick = () => this.onMediaClick(item.fileId);

    const onFileClick = (url) => {
      if (!url) return;
      window.open(url, downloadInCurrentTab ? "_self" : "_blank");
    };

    return (
      <StyledFileRow
        className="download-row"
        key={item.uniqueId}
        checkbox={false}
        element={
          <img
            className={item.error ? "img_error" : null}
            src={fileIcon}
            alt=""
          />
        }
        isMediaActive={isMediaActive}
        showPasswordInput={showPasswordInput}
        withoutBorder
        isError={item.error}
      >
        <>
          {item.fileId ? (
            isMedia || (isPlugin && onPluginClick) ? (
              <Link
                className="upload-panel_file-row-link upload-panel-file-error_text"
                fontWeight="600"
                truncate
                onClick={isMedia ? onMediaClick : onPluginClick}
              >
                {name}
                {fileExtension}
              </Link>
            ) : (
              <div className="upload-panel_file-name">
                <Link
                  className="upload-panel-file-error_text"
                  onClick={() =>
                    onFileClick(item.fileInfo ? item.fileInfo.webUrl : "")
                  }
                  fontWeight="600"
                  truncate
                  // href={item.fileInfo ? item.fileInfo.webUrl : ""}
                  // target={downloadInCurrentTab ? "_self" : "_blank"}
                >
                  {name}
                  {fileExtension}
                </Link>
              </div>
            )
          ) : (
            <div className="upload-panel_file-name">
              <Text
                fontWeight="600"
                truncate
                className="upload-panel-file-error_text"
              >
                {name}
                {fileExtension}
              </Text>
            </div>
          )}

          {item.fileId && !item.error ? (
            <ActionsUploadedFile
              item={item}
              onCancelCurrentUpload={this.onCancelCurrentUpload}
            />
          ) : item.error || (!item.fileId && uploaded) ? (
            <ErrorFileUpload
              t={t}
              item={item}
              theme={theme}
              onTextClick={this.onTextClick}
              showPasswordInput={showPasswordInput}
            />
          ) : (
            <>
              <div className="actions-wrapper">
                {item.percent ? (
                  <Text className="upload-panel_percent-text">
                    {Math.trunc(item.percent)}&#37;
                  </Text>
                ) : null}
                <IconButton
                  data-id={item.uniqueId}
                  data-action={item.action}
                  data-file-id={item.fileId}
                  iconName={CloseSvgUrl}
                  size={16}
                  className="upload-panel_close-button"
                  onClick={this.onCancelCurrentUpload}
                />
              </div>
              {item.action !== "convert" ? (
                <div className="password-input">
                  <ProgressBar
                    style={{ width: "100%" }}
                    percent={item.percent}
                  />
                </div>
              ) : null}
            </>
          )}

          {showPasswordInput ? (
            <div className="password-input">
              <SimulatePassword
                onChange={this.onChangePassword}
                onKeyDown={this.onKeyDown}
                hasError={!passwordValid}
                forwardedRef={this.inputRef}
              />
              <Button
                id="conversion-button"
                className="conversion-password_button"
                size="small"
                scale
                primary
                label={t("Ready")}
                onClick={this.onButtonClick}
                isDisabled={!password}
              />
            </div>
          ) : null}
        </>
      </StyledFileRow>
    );
  }
}
export default inject(
  (
    {
      filesSettingsStore,
      uploadDataStore,
      mediaViewerDataStore,
      settingsStore,
      pluginStore,
    },
    { item },
  ) => {
    let ext;
    let splitted;

    if (item.file) {
      const infoExt = item?.fileInfo?.fileExst;
      splitted = item.file.name.split(".");

      if (infoExt) {
        ext = infoExt;
        splitted.splice(-1);
      } else {
        ext = splitted.length > 1 ? `.${splitted.pop()}` : "";
      }
    } else {
      ext = item?.fileInfo?.fileExst;
      splitted = item.fileInfo?.title?.split(".");
      if (ext) splitted.splice(-1);
    }

    const { fileItemsList } = pluginStore;
    const { enablePlugins, currentDeviceType } = settingsStore;

    let isPlugin = false;
    let onPluginClick = null;

    if (fileItemsList && enablePlugins) {
      let currPluginItem = null;

      fileItemsList.forEach((i) => {
        if (i.key === item?.fileInfo?.fileExst) currPluginItem = i.value;
      });

      if (currPluginItem) {
        const correctDevice = currPluginItem.devices
          ? currPluginItem.devices.includes(currentDeviceType)
          : true;
        if (correctDevice) {
          isPlugin = true;
          onPluginClick = () =>
            currPluginItem.onClick({ ...item, ...item.fileInfo });
        }
      }
    }

    const name = splitted?.join(".");

    const { theme } = settingsStore;
    const { canViewedDocs, getIconSrc, isArchive, openOnNewPage } =
      filesSettingsStore;
    const {
      uploaded,
      cancelCurrentUpload,
      cancelCurrentFileConversion,
      setUploadPanelVisible,
      removeFileFromList,
      convertFile,
      files: uploadedFiles,
    } = uploadDataStore;
    const { playlist, setMediaViewerData, setCurrentItem } =
      mediaViewerDataStore;

    const isMedia =
      item.fileInfo?.viewAccessibility?.ImageView ||
      item.fileInfo?.viewAccessibility?.MediaView;

    const isMediaActive =
      playlist.findIndex((el) => el.fileId === item.fileId) !== -1;

    const fileIcon = getIconSrc(ext, 32);

    const downloadInCurrentTab =
      !openOnNewPage || isArchive(ext) || !canViewedDocs(ext);

    return {
      theme,
      uploaded,
      isMedia: !!isMedia,
      fileIcon,
      ext,
      name,
      isMediaActive,
      downloadInCurrentTab,
      removeFileFromList,
      convertFile,
      uploadedFiles,

      cancelCurrentUpload,
      cancelCurrentFileConversion,
      setMediaViewerData,
      setUploadPanelVisible,

      setCurrentItem,

      isPlugin,
      onPluginClick,
    };
  },
)(withTranslation("UploadPanel")(observer(FileRow)));
