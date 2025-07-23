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

import { useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Button } from "@docspace/shared/components/button";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { Text } from "@docspace/shared/components/text";
import { saveSettingsThirdParty } from "@docspace/shared/api/files";
import { ComboBox } from "@docspace/shared/components/combobox";
import { toastr } from "@docspace/shared/components/toast";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { getOAuthToken } from "@docspace/shared/utils/common";
import { IconButton } from "@docspace/shared/components/icon-button";

import FilesSelectorInput from "SRC_DIR/components/FilesSelectorInput";
import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import DeleteThirdPartyDialog from "../../../../../../components/dialogs/DeleteThirdPartyDialog";
import { StyledBackup, StyledComboBoxItem } from "../StyledBackup";
import { ThirdPartyServicesUrlName } from "../../../../../../helpers/constants";

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
    (oldState, newState) => ({ ...oldState, ...newState }),
    initialState,
  );

  const { t } = useTranslation(["Translations", "Common"]);

  const saveSettings = async (
    token = "",
    urlValue = "",
    loginValue = "",
    passwordValue = "",
  ) => {
    const { label, key, provider_id } = selectedThirdPartyAccount;
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
        key,
        provider_id,
      );

      await setThirdPartyAccountsInfo(t);
    } catch (e) {
      toastr.error(e);
    }

    setState({ isLoading: false, isUpdatingInfo: false });
  };

  const onSetSettings = async () => {
    try {
      await setThirdPartyAccountsInfo(t);

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

    const { key, provider_link: directConnection } = selectedThirdPartyAccount;

    if (directConnection) {
      const authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020",
      );

      openConnectWindow(key, authModal)
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

  const onSelectAccount = (name) => () => {
    const account = accounts.find((a) => a.name === name);

    if (!account.connected) {
      setSelectedThirdPartyAccount({
        key: 0,
        label: selectedThirdPartyAccount?.label,
      });

      return window.open(
        `/portal-settings/integration/third-party-services?service=${ThirdPartyServicesUrlName[name]}`,
        "_blank",
      );
    }

    setSelectedThirdPartyAccount(account);
  };

  const onDisconnect = () => {
    clearLocalStorage();
    setDeleteThirdPartyDialogVisible(true);
  };
  const getContextOptions = () => {
    return [
      {
        key: "connection-settings",
        label: t("Common:Reconnect"),
        onClick: onConnect,
        disabled: false,
        icon: RefreshReactSvgUrl,
      },
      {
        key: "Disconnect-settings",
        label: t("Common:Disconnect"),
        onClick: onDisconnect,
        disabled: false,
        icon: AccessNoneReactSvgUrl,
      },
    ];
  };

  const { isLoading, isInitialLoading } = state;

  const isDisabledComponent =
    isDisabled || isInitialLoading || isLoading || accounts.length === 0;

  const isDisabledSelector = isLoading || isDisabled;

  const folderList = connectedThirdPartyAccount ?? {};

  const advancedOptions = accounts?.map((item) => {
    return (
      <StyledComboBoxItem
        isDisabled={item.disabled}
        key={`${item.key}_${item.name}`}
      >
        <DropDownItem
          onClick={onSelectAccount(item.name)}
          className={item.className}
          disabled={item.disabled}
        >
          <Text className="drop-down-item_text" fontWeight={600}>
            {item.title}
          </Text>

          {!item.disabled && !item.connected ? (
            <IconButton
              className="drop-down-item_icon"
              size="16"
              onClick={onSelectAccount(item.name)}
              iconName={ExternalLinkReactSvgUrl}
              isFill
            />
          ) : null}
        </DropDownItem>
      </StyledComboBoxItem>
    );
  });

  const updateInfo = async () => {
    setThirdPartyAccountsInfo(t);
  };

  return (
    <StyledBackup
      isConnectedAccount={
        connectedThirdPartyAccount ? isTheSameThirdPartyAccount : null
      }
      isMobileScale={isMobileScale}
    >
      <div className="backup_connection">
        <ComboBox
          className="thirdparty-combobox"
          selectedOption={{
            key: 0,
            label: selectedThirdPartyAccount?.label,
          }}
          options={[]}
          advancedOptions={advancedOptions}
          scaled
          size="content"
          manualWidth="auto"
          directionY="both"
          displaySelectedOption
          noBorder={false}
          isDefaultMode
          hideMobileView={false}
          forceCloseClickOutside
          scaledOptions
          showDisabledItems
          displayArrow
          isDisabled={isDisabledComponent}
        />

        {connectedThirdPartyAccount?.id &&
        selectedThirdPartyAccount &&
        isTheSameThirdPartyAccount ? (
          <ContextMenuButton
            zIndex={402}
            className="backup_third-party-context"
            iconName={VerticalDotsReactSvgUrl}
            size={15}
            getData={getContextOptions}
            isDisabled={isDisabledComponent}
            displayIconBorder
          />
        ) : null}
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
        folderList.id &&
        selectedThirdPartyAccount && (
          <FilesSelectorInput
            className="restore-backup_input"
            descriptionText={descriptionText}
            filterParam={filterParam}
            rootThirdPartyId={selectedThirdPartyAccount.id}
            onSelectFolder={onSelectFolder}
            onSelectFile={onSelectFile}
            id={id || folderList.id}
            withoutInitPath={withoutInitPath}
            isError={isError}
            isDisabled={isDisabledSelector}
            isThirdParty
            isSelectFolder={isSelectFolder}
            isSelect={isSelect}
            checkCreating={selectedThirdPartyAccount?.key === "WebDav"}
          />
        )
      )}
      {deleteThirdPartyDialogVisible ? (
        <DeleteThirdPartyDialog
          updateInfo={updateInfo}
          key="thirdparty-delete-dialog"
          isConnectionViaBackupModule
        />
      ) : null}
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
