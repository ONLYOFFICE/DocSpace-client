import React, { useState, useCallback, useEffect } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import SimulatePassword from "../../SimulatePassword";
import StyledComponent from "./StyledConvertPasswordDialog";
import config from "PACKAGE_FILE";
import { openDocEditor } from "@docspace/client/src/helpers/filesUtils";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

let tab, _isMounted;
const ConvertPasswordDialogComponent = (props) => {
  const {
    t,
    visible,
    setConvertPasswordDialogVisible,
    isTabletView,
    copyAsAction,
    formCreationInfo,
    setFormCreationInfo,
    setPasswordEntryProcess,
    isDesktop,
    completeAction,
    fileCopyAs,
  } = props;
  const inputRef = React.useRef(null);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(true);

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

  const focusInput = () => {
    if (inputRef) {
      inputRef.current.focus();
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

      const url = combineUrl(
        window.location.origin,
        window.DocSpaceConfig?.proxy?.url,
        config.homepage,
        `/doceditor/create?${searchParams.toString()}`,
      );

      window.open(
        url,
        window.DocSpaceConfig?.editor?.openOnNewPage ? "_blank" : "_self",
      );

      setIsLoading(false);
      onClose();
      return;
    }
  }, [isLoading]);

  useEffect(() => {
    _isMounted = true;
    setPasswordEntryProcess(true);

    return () => {
      _isMounted = false;
      setPasswordEntryProcess(false);
    };
  }, []);

  const onChangePassword = useCallback(
    (password) => {
      !passwordValid && setPasswordValid(true);
      setPassword(password);
    },
    [onChangePassword, passwordValid],
  );

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
                inputMaxWidth={"512px"}
                inputBlockMaxWidth={"536px"}
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
