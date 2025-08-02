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

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable jsx-a11y/tabindex-no-positive */

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";

import { toastr } from "../../components/toast";
import { Button, ButtonSize } from "../../components/button";
import { ModalDialog, ModalDialogType } from "../../components/modal-dialog";
import { InputSize, InputType, TextInput } from "../../components/text-input";
import { PasswordInput } from "../../components/password-input";
import { FieldContainer } from "../../components/field-container";
import { getOAuthToken } from "../../utils/common";
import { saveSettingsThirdParty } from "../../api/files";
import type { ConnectDialogProps } from "./ConnectDialog.types";

const ConnectDialog = ({
  visible,
  // t,
  // tReady,
  item,
  fetchThirdPartyProviders,
  providers,
  // selectedFolderId,
  // selectedFolderFolders,
  saveThirdParty,
  openConnectWindow,
  setConnectDialogVisible,
  folderFormValidation,
  isConnectionViaBackupModule,
  roomCreation,
  setSaveThirdpartyResponse,
  isConnectDialogReconnect,
  setIsConnectDialogReconnect,
  saveAfterReconnectOAuth,
  setSaveAfterReconnectOAuth,
  setThirdPartyAccountsInfo,
  connectingStorages,
}: ConnectDialogProps) => {
  const { t, ready } = useTranslation(["Common"]);

  const {
    title,
    link,
    token = "",
    provider_id = "",
    provider_key = "",
    key = "",
  } = item ?? {};

  const connectItem = connectingStorages.find(
    (el) => el.providerKey === provider_key,
  );

  const provider = providers.find((el) => el.provider_id === item?.provider_id);
  const folderTitle = provider ? provider.customer_title : title;

  const [urlValue, setUrlValue] = useState("");
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [customerTitle, setCustomerTitleValue] = useState(folderTitle ?? "");

  const [oAuthToken, setToken] = useState(token ?? "");

  const [isTitleValid, setIsTitleValid] = useState(true);
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [isLoginValid, setIsLoginValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const isAccount = !!link;
  const showUrlField = !!connectItem?.requiredConnectionUrl;

  const header = isConnectDialogReconnect
    ? t("Common:ReconnectStorage")
    : t("Common:ConnectingAccount");

  const onChangeUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUrlValid(true);
    setUrlValue(e.target.value);
  };
  const onChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoginValid(true);
    setLoginValue(e.target.value);
  };
  const onChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPasswordValid(true);
    setPasswordValue(e.target.value);
  };
  const onChangeFolderName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsTitleValid(true);
    let newTitle = e.target.value;
    // const chars = '*+:"<>?|/'; TODO: think how to solve problem with interpolation escape values in i18n translate

    if (newTitle.match(folderFormValidation)) {
      toastr.warning(t("Common:ContainsSpecCharacter"));
    }
    newTitle = newTitle.replace(folderFormValidation, "_");

    setCustomerTitleValue(newTitle);
  };

  const onClose = useCallback(() => {
    if (!isLoading) setConnectDialogVisible(false);

    if (isConnectDialogReconnect) {
      setIsConnectDialogReconnect(false);
    }
  }, [
    isLoading,
    setConnectDialogVisible,
    isConnectDialogReconnect,
    setIsConnectDialogReconnect,
  ]);

  const onSave = useCallback(() => {
    const isTitleValidCheck = !!customerTitle.trim();
    const isUrlValidCheck = !!urlValue.trim();
    const isLoginValidCheck = !!loginValue.trim();
    const isPasswordValidCheck = !!passwordValue.trim();

    if (link) {
      if (!isTitleValidCheck) {
        setIsTitleValid(!!customerTitle.trim());
        return;
      }
    } else if (
      !isTitleValidCheck ||
      !isLoginValidCheck ||
      !isPasswordValidCheck ||
      (showUrlField && !isUrlValidCheck)
    ) {
      setIsTitleValid(isTitleValidCheck);
      if (showUrlField) setIsUrlValid(isUrlValidCheck);
      setIsLoginValid(isLoginValidCheck);
      setIsPasswordValid(isPasswordValidCheck);
      return;
    }

    setIsLoading(true);

    if (isConnectionViaBackupModule) {
      saveSettingsThirdParty(
        urlValue,
        loginValue,
        passwordValue,
        oAuthToken,
        false,
        customerTitle,
        provider_key,
        provider_id,
      )
        ?.then(async () => {
          await setThirdPartyAccountsInfo(t);
        })
        .catch((err) => {
          toastr.error(err);
        })
        .finally(() => {
          setIsLoading(false);
          onClose();
        });

      return;
    }

    saveThirdParty(
      urlValue,
      loginValue,
      passwordValue,
      oAuthToken,
      false,
      customerTitle,
      provider_key || key.toString(),
      provider_id,
      roomCreation,
    )
      .then(async (res) => {
        setSaveThirdpartyResponse?.(res);
        toastr.success(t("Common:SuccessfulConnectionOfAThirdParty"));
        await fetchThirdPartyProviders();
      })
      .catch((err) => {
        onClose();
        toastr.error(err);
        setIsLoading(false);
      })
      .finally(() => {
        onClose();
        setIsLoading(false);
        setSaveAfterReconnectOAuth(false);
      });
  }, [
    customerTitle,
    urlValue,
    loginValue,
    passwordValue,
    link,
    showUrlField,
    isConnectionViaBackupModule,
    saveThirdParty,
    oAuthToken,
    provider_key,
    key,
    provider_id,
    roomCreation,
    setThirdPartyAccountsInfo,
    t,
    onClose,
    setSaveThirdpartyResponse,
    fetchThirdPartyProviders,
    setSaveAfterReconnectOAuth,
  ]);

  const onReconnect = () => {
    const authModal = window.open(
      "",
      t("Common:Authorization"),
      "height=600, width=1020",
    );
    openConnectWindow(provider_key, authModal).then((modal) =>
      getOAuthToken(modal).then((accessToken) => {
        authModal?.close();
        setToken(accessToken);
      }),
    );
  };

  const onKeyUpHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter") onSave();
    },
    [onSave],
  );

  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  useEffect(() => {
    window.addEventListener("keyup", onKeyUpHandler);
    return () => window.removeEventListener("keyup", onKeyUpHandler);
  }, [onKeyUpHandler]);

  useEffect(() => {
    return setToken(token);
  }, [setToken, token]);

  useEffect(() => {
    if (saveAfterReconnectOAuth) {
      saveRef.current();
    }
  }, [saveAfterReconnectOAuth]);

  return (
    <ModalDialog
      isLoading={!ready}
      visible={visible}
      zIndex={310}
      isLarge={!isAccount}
      autoMaxHeight
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        {isAccount ? (
          <FieldContainer
            style={roomCreation ? { margin: "0" } : {}}
            labelVisible
            labelText={t("Common:Account")}
            isVertical
          >
            <Button
              label={t("Common:Reconnect")}
              size={ButtonSize.normal}
              onClick={onReconnect}
              scale
              isDisabled={isLoading}
              testId="reconnect_account_button"
            />
          </FieldContainer>
        ) : (
          <>
            {showUrlField ? (
              <FieldContainer
                labelVisible
                isRequired
                labelText={t("Common:ConnectionUrl")}
                isVertical
                hasError={!isUrlValid}
                errorMessage={t("Common:RequiredField")}
              >
                <TextInput
                  id="connection-url-input"
                  isAutoFocussed
                  hasError={!isUrlValid}
                  isDisabled={isLoading}
                  tabIndex={1}
                  scale
                  value={urlValue}
                  onChange={onChangeUrl}
                  type={InputType.text}
                  size={InputSize.base}
                  testId="connection_account_url_input"
                />
              </FieldContainer>
            ) : null}

            <FieldContainer
              labelVisible
              labelText={t("Common:Login")}
              isRequired
              isVertical
              hasError={!isLoginValid}
              errorMessage={t("Common:RequiredField")}
            >
              <TextInput
                id="login-input"
                isAutoFocussed={!showUrlField}
                hasError={!isLoginValid}
                isDisabled={isLoading}
                tabIndex={2}
                scale
                value={loginValue}
                onChange={onChangeLogin}
                type={InputType.text}
                size={InputSize.base}
                testId="connection_account_login_input"
              />
            </FieldContainer>
            <FieldContainer
              labelVisible
              labelText={t("Common:Password")}
              isRequired
              isVertical
              hasError={!isPasswordValid}
              errorMessage={t("Common:RequiredField")}
              style={roomCreation ? { margin: "0" } : {}}
            >
              <PasswordInput
                id="password-input"
                hasError={!isPasswordValid}
                isDisabled={isLoading}
                tabIndex={3}
                simpleView
                passwordSettings={{ minLength: 0 }}
                // value={passwordValue}
                onChange={onChangePassword}
                size={InputSize.base}
                testId="connection_account_password_input"
              />
            </FieldContainer>
          </>
        )}
        {!(isConnectionViaBackupModule || roomCreation) ? (
          <FieldContainer
            labelText={t("Common:ConnectFolderTitle")}
            isRequired
            isVertical
            hasError={!isTitleValid}
            errorMessage={t("Common:RequiredField")}
          >
            <TextInput
              hasError={!isTitleValid}
              isDisabled={isLoading}
              tabIndex={4}
              scale
              value={`${customerTitle}`}
              onChange={onChangeFolderName}
              type={InputType.text}
              size={InputSize.base}
              testId="connection_account_folder_input"
            />
          </FieldContainer>
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="save"
          tabIndex={5}
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          primary
          scale={isAccount}
          onClick={onSave}
          isDisabled={isLoading}
          isLoading={isLoading}
          testId="connection_account_save_button"
        />
        <Button
          id="cancel"
          tabIndex={5}
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale={isAccount}
          onClick={onClose}
          isDisabled={isLoading}
          testId="connection_account_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default ConnectDialog;

// const ConnectDialog = withTranslation([
//   "ConnectDialog",
//   "Common",
//   "Translations",
//   "Files",
// ])(PureConnectDialogContainer);

// export default inject(
//   ({
//     settingsStore,
//     filesSettingsStore,
//     selectedFolderStore,
//     dialogsStore,
//     backup,
//   }) => {
//     const {
//       providers,
//       saveThirdParty,
//       openConnectWindow,
//       fetchThirdPartyProviders,
//       connectingStorages,
//     } = filesSettingsStore.thirdPartyStore;
//     const { folderFormValidation } = settingsStore;

//     const { id, folders } = selectedFolderStore;
//     const {
//       selectedThirdPartyAccount: backupConnectionItem,
//       setThirdPartyAccountsInfo,
//     } = backup;
//     const {
//       connectDialogVisible: visible,
//       setConnectDialogVisible,
//       connectItem,
//       roomCreation,
//       setSaveThirdpartyResponse,
//       isConnectDialogReconnect,
//       setIsConnectDialogReconnect,
//       saveAfterReconnectOAuth,
//       setSaveAfterReconnectOAuth,
//     } = dialogsStore;

//     const item = backupConnectionItem ?? connectItem;
//     const isConnectionViaBackupModule = backupConnectionItem ? true : false;

//     return {
//       selectedFolderId: id,
//       selectedFolderFolders: folders,
//       providers,
//       visible,
//       item,
//       roomCreation,
//       setSaveThirdpartyResponse,
//       folderFormValidation,
//       isConnectionViaBackupModule,
//       saveThirdParty,
//       openConnectWindow,
//       fetchThirdPartyProviders,
//       setConnectDialogVisible,
//       isConnectDialogReconnect,
//       saveAfterReconnectOAuth,
//       setSaveAfterReconnectOAuth,
//       setIsConnectDialogReconnect,
//       setThirdPartyAccountsInfo,
//       connectingStorages,
//     };
//   },
// )(observer(ConnectDialog));
