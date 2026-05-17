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

import React, { useState, useCallback, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import CheckReactSvg from "PUBLIC_DIR/images/check.edit.react.svg";
import {
  StyledFileRow,
  ErrorFile,
  FileActions,
} from "SRC_DIR/components/PanelComponents";

import { Text } from "@docspace/ui-kit/components/text";
import { Link } from "@docspace/ui-kit/components/link";
import { Button } from "@docspace/ui-kit/components/button";
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
    retryConvertFiles,
  }) => {
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordValid, setPasswordValid] = useState(true);
    const inputRef = useRef(null);
    const { t } = useTranslation("UploadPanel");

    const onRetryClick = () => {
      const { fileId } = item;

      retryConvertFiles(t, fileId);
    };

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
              onRetryClick={onRetryClick}
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
    const { uploaded, convertFileFromFiles, retryConvertFiles } =
      uploadDataStore;

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
      retryConvertFiles,
    };
  },
)(FileRow);
