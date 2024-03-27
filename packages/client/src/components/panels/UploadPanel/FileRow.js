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
import { Row } from "@docspace/shared/components/row";
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import LoadingButton from "./SubComponents/LoadingButton";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import SimulatePassword from "../../../components/SimulatePassword";
import ErrorFileUpload from "./SubComponents/ErrorFileUpload.js";
import ActionsUploadedFile from "./SubComponents/ActionsUploadedFile";
import { isMobile } from "react-device-detect";
import { NoUserSelect } from "@docspace/shared/utils";
import { Button } from "@docspace/shared/components/button";
import { tablet } from "@docspace/shared/utils";

const StyledFileRow = styled(Row)`
  width: calc(100% - 16px);
  box-sizing: border-box;
  ${(props) =>
    props.theme.interfaceDirection === "rtl"
      ? css`
          padding-right: 16px;
        `
      : css`
          padding-left: 16px;
        `}
  max-width: 484px;

  .row_context-menu-wrapper {
    width: auto;
    display: none;
  }
  ::after {
    max-width: 468px;
    width: calc(100% - 16px);
  }

  ${!isMobile && "min-height: 48px;"}

  height: 100%;

  .styled-element,
  .row_content {
    ${(props) =>
      props.showPasswordInput &&
      css`
        margin-top: -40px;

        @media ${tablet} {
          margin-top: -44px;
        }
      `}
  }

  .styled-element {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-left: 8px !important;
          `
        : css`
            margin-right: 8px !important;
          `}
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
    top: 48px;
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            right: 16px;
          `
        : css`
            left: 16px;
          `}
    max-width: 470px;
    width: calc(100% - 16px);
    display: flex;
  }

  #conversion-button {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: 8px;
          `
        : css`
            margin-left: 8px;
          `}

    width: 100%;
    max-width: 78px;
  }
  .row_content > a,
  .row_content > p {
    margin: auto 0;
    line-height: 16px;
  }

  .upload_panel-icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin-right: auto;
            padding-right: 16px;
          `
        : css`
            margin-left: auto;
            padding-left: 16px;
          `}

    line-height: 24px;
    display: flex;
    align-items: center;
    flex-direction: row-reverse;

    svg {
      width: 16px;
      height: 16px;
    }

    .enter-password {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 8px;
            `
          : css`
              margin-right: 8px;
            `}

      text-decoration: underline dashed;
      cursor: pointer;
    }
  }

  .img_error {
    filter: grayscale(1);
  }

  .convert_icon {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            padding-left: 12px;
          `
        : css`
            padding-right: 12px;
          `}
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
`;
class FileRow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showPasswordInput: false,
      password: "",
      passwordValid: true,
    };

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
    //console.log("cancel upload ", e);
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
      clearUploadedFilesHistory,
      isMediaActive,
      setCurrentItem,
      item,
      uploaded,
    } = this.props;
    if (!isMediaActive) setCurrentItem(item);

    const data = { visible: true, id: id };
    setMediaViewerData(data);
    setUploadPanelVisible(false);

    if (uploaded) {
      clearUploadedFilesHistory();
    }
  };

  hasError = () => {
    const { password } = this.state;
    const pass = password.trim();
    if (!pass) {
      this.setState({ passwordValid: false });
      return true;
    }

    return false;
  };

  onButtonClick = () => {
    const { password } = this.state;
    const { removeFileFromList, convertFile, item, uploadedFiles } = this.props;
    const { fileId, toFolderId, fileInfo } = item;

    if (this.hasError()) return;

    let index;

    uploadedFiles.reduce((acc, rec, id) => {
      if (rec.fileId === fileId) index = id;
    }, []);

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
    this.setState({
      password,
      ...(!this.state.passwordValid && { passwordValid: true }),
    });
  }

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
      isPersonal,
      isMediaActive,
      downloadInCurrentTab,
    } = this.props;

    const { showPasswordInput, password, passwordValid } = this.state;

    const fileExtension = ext ? (
      <Text as="span" fontWeight="600" color="#A3A9AE">
        {ext}
      </Text>
    ) : (
      <></>
    );

    const onMediaClick = () => this.onMediaClick(item.fileId);

    return (
      <>
        <StyledFileRow
          className="download-row"
          key={item.uniqueId}
          checkbox={false}
          element={
            <img className={item.error && "img_error"} src={fileIcon} alt="" />
          }
          isMediaActive={isMediaActive}
          showPasswordInput={showPasswordInput}
          withoutBorder
        >
          <>
            {item.fileId ? (
              isMedia ? (
                <Link
                  className="upload-panel_file-row-link"
                  fontWeight="600"
                  color={item.error && "#A3A9AE"}
                  truncate
                  onClick={onMediaClick}
                >
                  {name}
                  {fileExtension}
                </Link>
              ) : (
                <div className="upload-panel_file-name">
                  <Link
                    fontWeight="600"
                    color={item.error && "#A3A9AE"}
                    truncate
                    href={item.fileInfo ? item.fileInfo.webUrl : ""}
                    target={downloadInCurrentTab ? "_self" : "_blank"}
                  >
                    {name}
                    {fileExtension}
                  </Link>
                </div>
              )
            ) : (
              <div className="upload-panel_file-name">
                <Text fontWeight="600" color={item.error && "#A3A9AE"} truncate>
                  {name}
                  {fileExtension}
                </Text>
              </div>
            )}

            {item.fileId && !item.error ? (
              <ActionsUploadedFile
                item={item}
                isPersonal={isPersonal}
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
              <div
                className="upload_panel-icon"
                data-id={item.uniqueId}
                onClick={this.onCancelCurrentUpload}
              >
                <LoadingButton item={item} />
              </div>
            )}
            {showPasswordInput && (
              <div className="password-input">
                <SimulatePassword
                  onChange={this.onChangePassword}
                  onKeyDown={this.onKeyDown}
                  hasError={!passwordValid}
                />
                <Button
                  id="conversion-button"
                  className="conversion-password_button"
                  size={"small"}
                  scale
                  primary
                  label={t("Ready")}
                  onClick={this.onButtonClick}
                  isDisabled={!password}
                />
              </div>
            )}
          </>
        </StyledFileRow>
      </>
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
    },
    { item },
  ) => {
    let ext;
    let name;
    let splitted;

    if (item.file) {
      const infoExt = item?.fileInfo?.fileExst;
      splitted = item.file.name.split(".");

      if (!!infoExt) {
        ext = infoExt;
        splitted.splice(-1);
      } else {
        ext = splitted.length > 1 ? "." + splitted.pop() : "";
      }
    } else {
      ext = item.fileInfo.fileExst;
      splitted = item.fileInfo.title.split(".");
      if (!!ext) splitted.splice(-1);
    }

    name = splitted.join(".");

    const { personal, theme } = settingsStore;
    const { canViewedDocs, getIconSrc, isArchive } = filesSettingsStore;
    const {
      uploaded,
      cancelCurrentUpload,
      cancelCurrentFileConversion,
      setUploadPanelVisible,
      removeFileFromList,
      convertFile,
      files: uploadedFiles,
      clearUploadedFilesHistory,
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
      window.DocSpaceConfig?.editor?.openOnNewPage === false ||
      isArchive(ext) ||
      !canViewedDocs(ext);

    return {
      isPersonal: personal,
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
      clearUploadedFilesHistory,
    };
  },
)(withTranslation("UploadPanel")(observer(FileRow)));
