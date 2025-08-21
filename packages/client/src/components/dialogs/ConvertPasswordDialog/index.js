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

import React, { useState, useCallback, useEffect } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { SimulatePassword } from "@docspace/shared/components/simulate-password";

import config from "PACKAGE_FILE";
import StyledComponent from "./StyledConvertPasswordDialog";

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
        <StyledComponent>
          <div className="convert-password-dialog_content">
            <div className="convert-password-dialog_caption">
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
        </StyledComponent>
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
