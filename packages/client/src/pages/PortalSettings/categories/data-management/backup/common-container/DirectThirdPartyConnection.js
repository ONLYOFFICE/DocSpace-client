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
import RefreshReactSvgUrl from "PUBLIC_DIR/images/refresh.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import React, { useEffect, useReducer } from "react";
import { Button } from "@docspace/shared/components/button";
import { saveSettingsThirdParty } from "@docspace/shared/api/files";
import { StyledBackup } from "../StyledBackup";
import { ComboBox } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";
import { inject, observer } from "mobx-react";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import DeleteThirdPartyDialog from "../../../../../../components/dialogs/DeleteThirdPartyDialog";
import { getOAuthToken } from "@docspace/shared/utils/common";
import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import { useTranslation } from "react-i18next";

const initialState = {
  folderList: {},
  isLoading: false,
  isInitialLoading: true,
  isUpdatingInfo: false,
};
const DirectThirdPartyConnection = (props) => {
  const {
    openConnectWindow,
    onSelectFolder,
    isDisabled,
    isError,
    id,
    withoutInitPath,
    connectDialogVisible,
    setConnectDialogVisible,
    setDeleteThirdPartyDialogVisible,
    deleteThirdPartyDialogVisible,
    clearLocalStorage,
    setSelectedThirdPartyAccount,
    connectedThirdPartyAccount,
    selectedThirdPartyAccount,
    buttonSize,
    isTheSameThirdPartyAccount,
    onSelectFile,
    filterParam,
    descriptionText,
    isMobileScale,
    accounts,
    setThirdPartyAccountsInfo,
    isSelect,
    isSelectFolder,
  } = props;

  const [state, setState] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState,
  );

  const { t } = useTranslation("Translations");

  const onSetSettings = async () => {
    try {
      await setThirdPartyAccountsInfo();

      setState({
        isLoading: false,
        isUpdatingInfo: false,
        isInitialLoading: false,
      });
    } catch (e) {
      if (!e) return;
      toastr.error(e);
    }
  };

  useEffect(() => {
    onSetSettings();

    return () => {
      setSelectedThirdPartyAccount(null);
    };
  }, []);

  const onConnect = () => {
    clearLocalStorage();
    onSelectFolder && onSelectFolder("");

    const { provider_key, provider_link: directConnection } =
      selectedThirdPartyAccount;

    if (directConnection) {
      let authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020",
      );

      openConnectWindow(provider_key, authModal)
        .then((modal) => getOAuthToken(modal))
        .then((token) => {
          authModal.close();
          saveSettings(token);
        })
        .catch((e) => {
          if (!e) return;
          toastr.error(e);
          console.error(e);
        });
    } else {
      setConnectDialogVisible(true);
    }
  };

  const saveSettings = async (
    token = "",
    urlValue = "",
    loginValue = "",
    passwordValue = "",
  ) => {
    const { label, provider_key, provider_id } = selectedThirdPartyAccount;
    setState({ isLoading: true, isUpdatingInfo: true });
    connectDialogVisible && setConnectDialogVisible(false);
    onSelectFolder && onSelectFolder("");

    try {
      await saveSettingsThirdParty(
        urlValue,
        loginValue,
        passwordValue,
        token,
        false,
        label,
        provider_key,
        provider_id,
      );

      await setThirdPartyAccountsInfo();
    } catch (e) {
      toastr.error(e);
    }

    setState({ isLoading: false, isUpdatingInfo: false });
  };

  const onSelectAccount = (options) => {
    const key = options.key;
    setSelectedThirdPartyAccount({ ...accounts[+key] });
  };

  const onDisconnect = () => {
    clearLocalStorage();
    setDeleteThirdPartyDialogVisible(true);
  };
  const getContextOptions = () => {
    return [
      {
        key: "connection-settings",
        label: t("Reconnect"),
        onClick: onConnect,
        disabled: false,
        icon: RefreshReactSvgUrl,
      },
      {
        key: "Disconnect-settings",
        label: t("Common:Disconnect"),
        onClick: onDisconnect,
        disabled: selectedThirdPartyAccount?.connected ? false : true,
        icon: AccessNoneReactSvgUrl,
      },
    ];
  };

  const { isLoading, isInitialLoading } = state;

  const isDisabledComponent =
    isDisabled || isInitialLoading || isLoading || accounts.length === 0;

  const isDisabledSelector = isLoading || isDisabled;

  const folderList = connectedThirdPartyAccount ?? {};
  return (
    <StyledBackup
      isConnectedAccount={
        connectedThirdPartyAccount && isTheSameThirdPartyAccount
      }
      isMobileScale={isMobileScale}
    >
      <div className="backup_connection">
        <ComboBox
          options={accounts}
          selectedOption={{
            key: 0,
            label: selectedThirdPartyAccount?.label,
          }}
          onSelect={onSelectAccount}
          noBorder={false}
          scaledOptions
          dropDownMaxHeight={300}
          tabIndex={1}
          showDisabledItems
          isDisabled={isDisabledComponent}
        />

        {connectedThirdPartyAccount?.id &&
          selectedThirdPartyAccount &&
          isTheSameThirdPartyAccount && (
            <ContextMenuButton
              zIndex={402}
              className="backup_third-party-context"
              iconName={VerticalDotsReactSvgUrl}
              size={15}
              getData={getContextOptions}
              isDisabled={isDisabledComponent}
              displayIconBorder
            />
          )}
      </div>

      {!connectedThirdPartyAccount?.id || !isTheSameThirdPartyAccount ? (
        <Button
          id="connect-button"
          primary
          label={t("Common:Connect")}
          onClick={onConnect}
          size={buttonSize}
          isDisabled={isDisabledComponent}
        />
      ) : (
        <>
          {folderList.id && selectedThirdPartyAccount && (
            <FilesSelectorInput
              className={"restore-backup_input"}
              descriptionText={descriptionText}
              filterParam={filterParam}
              rootThirdPartyId={selectedThirdPartyAccount.id}
              onSelectFolder={onSelectFolder}
              onSelectFile={onSelectFile}
              id={id ? id : folderList.id}
              withoutInitPath={withoutInitPath}
              isError={isError}
              isDisabled={isDisabledSelector}
              isThirdParty
              isSelectFolder={isSelectFolder}
              isSelect={isSelect}
            />
          )}
        </>
      )}
      {deleteThirdPartyDialogVisible && (
        <DeleteThirdPartyDialog
          updateInfo={setThirdPartyAccountsInfo}
          key="thirdparty-delete-dialog"
          isConnectionViaBackupModule
        />
      )}
    </StyledBackup>
  );
};

export default inject(({ backup, dialogsStore, filesSettingsStore }) => {
  const {
    clearLocalStorage,
    setSelectedThirdPartyAccount,
    selectedThirdPartyAccount,
    connectedThirdPartyAccount,
    isTheSameThirdPartyAccount,

    accounts,
    setThirdPartyAccountsInfo,
  } = backup;
  const { openConnectWindow } = filesSettingsStore.thirdPartyStore;

  const {
    connectDialogVisible,
    setConnectDialogVisible,
    setDeleteThirdPartyDialogVisible,
    deleteThirdPartyDialogVisible,
  } = dialogsStore;

  return {
    isTheSameThirdPartyAccount,
    clearLocalStorage,
    openConnectWindow,
    setConnectDialogVisible,
    connectDialogVisible,
    setDeleteThirdPartyDialogVisible,
    deleteThirdPartyDialogVisible,
    setSelectedThirdPartyAccount,
    selectedThirdPartyAccount,
    connectedThirdPartyAccount,

    accounts,
    setThirdPartyAccountsInfo,
  };
})(observer(DirectThirdPartyConnection));
