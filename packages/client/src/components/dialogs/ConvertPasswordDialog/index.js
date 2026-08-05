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

import React, { useState, useCallback, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { SimulatePassword } from "@docspace/shared/components/simulate-password";

import config from "PACKAGE_FILE";
import styles from "./ConvertPassword.module.scss";

const ConvertPasswordDialogComponent = (props) => {
  const {
    t,
    visible,
    setConvertPasswordDialogVisible,

    formCreationInfo,
    setFormCreationInfo,
    setPasswordEntryProcess,
  } = props;
  const inputRef = React.useRef(null);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);

  const onChangePassword = useCallback(
    (pwd) => {
      !passwordValid && setPasswordValid(true);
      setPassword(pwd);
    },
    [passwordValid],
  );

  const makeForm =
    formCreationInfo.fromExst === ".docxf" &&
    formCreationInfo.toExst === ".oform";

  const dialogHeading = makeForm
    ? t("Common:MakeForm")
    : t("Common:CreateMasterFormFromFile");

  const onClose = () => {
    setConvertPasswordDialogVisible(false);
    setFormCreationInfo(null);
  };
  const onConvert = () => {
    let hasError = false;

    const pass = password.trim();
    if (!pass) {
      hasError = true;
      setPasswordValid(false);
    }

    if (hasError) return;

    setIsLoading(true);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onConvert();
    }
  };

  useEffect(() => {
    const { newTitle, fileInfo, open } = formCreationInfo;
    const { id, folderId } = fileInfo;

    if (isLoading) {
      const searchParams = new URLSearchParams();

      searchParams.append("parentId", folderId);
      searchParams.append("fileTitle", newTitle);
      searchParams.append("open", open);
      searchParams.append("templateId", id);
      searchParams.append("password", password);
      searchParams.append("fromFile", true);

      searchParams.append("hash", new Date().getTime());

      const url = combineUrl(
        window.location.origin,
        window.ClientConfig?.proxy?.url,
        config.homepage,
        `/doceditor/create?${searchParams.toString()}`,
      );

      window.open(url, "_self");

      setIsLoading(false);
      onClose();
    }
  }, [isLoading]);

  useEffect(() => {
    setPasswordEntryProcess(true);

    return () => {
      setPasswordEntryProcess(false);
    };
  }, []);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      isLarge
      autoMaxHeight
      autoMaxWidth
    >
      <ModalDialog.Header>{dialogHeading}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.wrapper}>
          <div className="convert-password-dialog_content">
            <div className={styles.caption}>
              <Text>
                {makeForm
                  ? t("Translations:FileProtected").concat(
                      ". ",
                      t("ConversionPasswordMasterFormCaption"),
                    )
                  : t("Translations:FileProtected").concat(
                      ". ",
                      t("ConversionPasswordFormCaption"),
                    )}
              </Text>
            </div>
            <div className="password-input">
              <SimulatePassword
                inputMaxWidth="512px"
                inputBlockMaxWidth="536px"
                onChange={onChangePassword}
                onKeyDown={onKeyDown}
                hasError={!passwordValid}
                isDisabled={isLoading}
                forwardedRef={inputRef}
              />
            </div>
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          id="convert-password-dialog_button-accept"
          className="convert-password-dialog_button"
          key="ContinueButton"
          label={t("Common:SaveButton")}
          size="normal"
          scale
          primary
          onClick={onConvert}
          isLoading={isLoading}
        />
        <Button
          className="convert-password-dialog_button"
          key="CloseButton"
          label={t("Common:CloseButton")}
          scale
          size="normal"
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const ConvertPasswordDialog = withTranslation([
  "ConvertPasswordDialog",
  "Common",
  "Translations",
])(ConvertPasswordDialogComponent);

export default inject(
  ({
    filesStore,
    filesActionsStore,
    settingsStore,
    dialogsStore,
    uploadDataStore,
  }) => {
    const {
      convertPasswordDialogVisible: visible,
      setConvertPasswordDialogVisible,
      setFormCreationInfo,
      formCreationInfo,
    } = dialogsStore;
    const { copyAsAction, fileCopyAs } = uploadDataStore;
    const { setPasswordEntryProcess } = filesStore;
    const { completeAction } = filesActionsStore;

    const { isTabletView, isDesktopClient } = settingsStore;

    return {
      visible,
      setConvertPasswordDialogVisible,
      isTabletView,
      copyAsAction,
      fileCopyAs,
      formCreationInfo,
      setFormCreationInfo,
      setPasswordEntryProcess,
      isDesktop: isDesktopClient,
      completeAction,
    };
  },
)(observer(ConvertPasswordDialog));
