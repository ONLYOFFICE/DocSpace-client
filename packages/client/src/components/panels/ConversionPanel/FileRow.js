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

import React, { useState, useCallback, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import CheckReactSvg from "PUBLIC_DIR/images/check.edit.react.svg";
import {
  StyledFileRow,
  ErrorFile,
  FileActions,
} from "SRC_DIR/components/PanelComponents";

import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { Button } from "@docspace/shared/components/button";
import { SimulatePassword } from "@docspace/shared/components/simulate-password";

const FileRow = observer(
  ({
    item,
    fileIcon,
    ext,
    name,
    downloadInCurrentTab,
    updateRowsHeight,
    index,
    theme,
    convertFileFromFiles,
  }) => {
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(true);
    const inputRef = useRef(null);
    const { t } = useTranslation("UploadPanel");

    const onTextClick = useCallback(() => {
      const newState = !showPasswordInput;
      setShowPasswordInput(newState);
      updateRowsHeight && updateRowsHeight(index, newState);
    }, [showPasswordInput, updateRowsHeight, index]);

    const onChangePassword = useCallback(
      (newPassword) => {
        setPassword(newPassword);
        !passwordValid && setPasswordValid(true);
      },
      [passwordValid],
    );

    const hasError = useCallback(() => {
      const pass = password.trim();
      if (!pass) {
        setPasswordValid(false);
        return true;
      }
      return false;
    }, [password]);

    const onButtonClick = useCallback(() => {
      if (hasError()) return;

      const { fileId, toFolderId, fileInfo } = item;
      const newItem = {
        fileId,
        toFolderId,
        action: "convert",
        fileInfo,
        password,
        index,
      };

      onTextClick();
      convertFileFromFiles(newItem);
    }, [item, password, index, hasError, onTextClick, convertFileFromFiles]);

    const onKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter") {
          onButtonClick();
        }
      },
      [onButtonClick],
    );

    const fileExtension = ext ? (
      <Text as="span" fontWeight="600" className="file-exst">
        {ext}
      </Text>
    ) : null;

    const onFileClick = (url) => {
      if (!url) return;
      window.open(url, downloadInCurrentTab ? "_self" : "_blank");
    };

    console.log("item", item, item.error, !item.error);

    return (
      <StyledFileRow
        className="upload-row"
        key={item.uniqueId}
        checkbox={false}
        element={
          <img
            className={item.error ? "img_error" : null}
            src={fileIcon}
            alt=""
          />
        }
        showPasswordInput={showPasswordInput}
        withoutBorder
        isError={item.error}
      >
        <>
          <div className="upload-panel_file-name">
            <Link
              className="upload-panel-file-error_text"
              onClick={() =>
                onFileClick(item.fileInfo ? item.fileInfo.webUrl : "")
              }
              fontWeight="600"
              truncate
            >
              {name}
              {fileExtension}
            </Link>
          </div>

          {item.fileId && !item.error && item.action === "convert" ? (
            <FileActions item={item} />
          ) : item.error ? (
            <ErrorFile
              t={t}
              item={item}
              onTextClick={onTextClick}
              showPasswordInput={showPasswordInput}
              theme={theme}
            />
          ) : (
            <div className="actions-wrapper">
              <CheckReactSvg className="upload-panel_check-button" />
            </div>
          )}

          {showPasswordInput ? (
            <div className="password-input">
              <SimulatePassword
                onChange={onChangePassword}
                onKeyDown={onKeyDown}
                hasError={!passwordValid}
                forwardedRef={inputRef}
              />
              <Button
                className="conversion-button"
                size="small"
                scale
                primary
                label={t("Ready")}
                onClick={onButtonClick}
                isDisabled={!password}
              />
            </div>
          ) : null}
        </>
      </StyledFileRow>
    );
  },
);

export default inject(
  ({ uploadDataStore, filesSettingsStore, settingsStore }, { item }) => {
    const { theme } = settingsStore;
    const { canViewedDocs, getIconSrc, isArchive, openOnNewPage } =
      filesSettingsStore;
    const { uploaded, convertFileFromFiles } = uploadDataStore;

    const ext = item.fileInfo.fileExst;

    const title = item.fileInfo.title.split(".").slice(0, -1).join(".");

    const fileIcon = getIconSrc(ext, 32);

    const downloadInCurrentTab =
      !openOnNewPage || isArchive(ext) || !canViewedDocs(ext);

    return {
      theme,
      uploaded,
      fileIcon,
      ext,
      name: title,
      downloadInCurrentTab,
      convertFileFromFiles,
    };
  },
)(FileRow);
