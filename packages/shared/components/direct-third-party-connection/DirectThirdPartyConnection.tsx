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

/* eslint-disable @typescript-eslint/naming-convention */

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { ReactSVG } from "react-svg";
import { Reducer, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";
import { Button } from "@docspace/shared/components/button";
import { getOAuthToken } from "@docspace/shared/utils/common";
import { ComboBox, ComboBoxSize } from "@docspace/shared/components/combobox";
import { saveSettingsThirdParty } from "@docspace/shared/api/files";
import { ThirdPartyServicesUrlName } from "@docspace/shared/constants";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { ContextMenuButton } from "@docspace/shared/components/context-menu-button";
import { DeleteThirdPartyDialog } from "@docspace/shared/dialogs/delete-third-party";
import { FilesSelectorInput } from "@docspace/shared/components/files-selector-input";
import { isNullOrUndefined } from "@docspace/shared/utils/typeGuards";
import type { ConnectedThirdPartyAccountType } from "@docspace/shared/types";

import {
  StyledBackup,
  StyledComboBoxItem,
} from "./DirectThirdPartyConnection.styled";
import { initialState } from "./DirectThirdPartyConnection.constants";
import {
  DirectThirdPartyConnectionProps,
  DirectThirdPartyConnectionState,
} from "./DirectThirdPartyConnection.types";

const DirectThirdPartyConnection = ({
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

  // DeleteThirdPartyDialog
  deleteThirdParty,
  setConnectedThirdPartyAccount,
  setThirdPartyProviders,
  providers,
  removeItem,

  // FilesSelectorInput
  filesSelectorSettings,
  basePath,
  isErrorPath,
  newPath,
  setBasePath,
  setNewPath,
  toDefault,
}: DirectThirdPartyConnectionProps) => {
  const [state, setState] = useReducer<
    Reducer<
      DirectThirdPartyConnectionState,
      Partial<DirectThirdPartyConnectionState>
    >
  >((prevState, newState) => ({ ...prevState, ...newState }), initialState);

  const { t } = useTranslation(["Translations", "Common"]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async (
    token = "",
    urlValue = "",
    loginValue = "",
    passwordValue = "",
  ) => {
    if (isNullOrUndefined(selectedThirdPartyAccount)) return;

    const { label, provider_key, provider_id } = selectedThirdPartyAccount;

    setState({ isLoading: true, isUpdatingInfo: true });
    if (connectDialogVisible) setConnectDialogVisible(false);
    onSelectFolder?.("");

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

      await setThirdPartyAccountsInfo(t);
    } catch (e) {
      toastr.error(e as Error);
    }

    setState({ isLoading: false, isUpdatingInfo: false });
  };

  const onConnect = () => {
    clearLocalStorage();
    onSelectFolder?.("");

    if (isNullOrUndefined(selectedThirdPartyAccount)) return;

    const { provider_key, provider_link: directConnection } =
      selectedThirdPartyAccount;

    if (directConnection) {
      const authModal = window.open(
        "",
        t("Common:Authorization"),
        "height=600, width=1020",
      );

      openConnectWindow(provider_key, authModal)
        .then((modal) => getOAuthToken(modal))
        .then((token) => {
          authModal?.close();
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

  const onSelectAccount = (
    event: React.MouseEvent<HTMLElement> | React.ChangeEvent<HTMLInputElement>,
  ) => {
    const data = event.currentTarget.dataset;

    const account = accounts.find((acc) => acc.key === data.thirdPartyKey);

    if (!account?.connected) {
      setSelectedThirdPartyAccount({
        key: 0,
        label: selectedThirdPartyAccount?.label,
      });

      const thirdPartyKey = data.thirdPartyKey;

      if (!thirdPartyKey) return;
      window.open(
        `/portal-settings/integration/third-party-services?service=${ThirdPartyServicesUrlName[thirdPartyKey as keyof typeof ThirdPartyServicesUrlName]}`,
        "_blank",
      );
      return;
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
        disabled: !selectedThirdPartyAccount?.storageIsConnected,
        icon: AccessNoneReactSvgUrl,
      },
    ];
  };

  const { isLoading, isInitialLoading } = state;

  const isDisabledComponent =
    isDisabled || isInitialLoading || isLoading || accounts.length === 0;

  const isDisabledSelector = isLoading || isDisabled;

  const folderList: Partial<ConnectedThirdPartyAccountType> =
    connectedThirdPartyAccount ?? {};

  const advancedOptions = accounts?.map((item) => {
    return (
      <StyledComboBoxItem isDisabled={item.disabled} key={item.key}>
        <DropDownItem
          onClick={onSelectAccount}
          className={item.className}
          data-third-party-key={item.key}
          disabled={item.disabled}
        >
          <Text className="drop-down-item_text" fontWeight={600}>
            {item.title}
          </Text>

          {!item.disabled && !item.connected ? (
            <ReactSVG
              src={ExternalLinkReactSvgUrl}
              className="drop-down-item_icon"
            />
          ) : null}
        </DropDownItem>
      </StyledComboBoxItem>
    );
  });

  const isConnectedAccount =
    Boolean(connectedThirdPartyAccount) && isTheSameThirdPartyAccount;

  return (
    <StyledBackup
      isConnectedAccount={isConnectedAccount}
      isMobileScale={isMobileScale}
    >
      <div className="backup_connection">
        <ComboBox
          scaled
          options={[]}
          displayArrow
          scaledOptions
          isDefaultMode
          noBorder={false}
          showDisabledItems
          directionY="both"
          manualWidth="auto"
          onSelect={() => {}}
          displaySelectedOption
          hideMobileView={false}
          forceCloseClickOutside
          size={ComboBoxSize.content}
          className="thirdparty-combobox"
          advancedOptions={advancedOptions}
          selectedOption={{
            key: 0,
            label: selectedThirdPartyAccount?.label ?? "",
          }}
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
            id={id ?? folderList.id}
            withoutInitPath={withoutInitPath}
            isError={isError}
            isDisabled={isDisabledSelector}
            isThirdParty
            isSelectFolder={isSelectFolder}
            isSelect={isSelect}
            checkCreating={selectedThirdPartyAccount?.provider_key === "WebDav"}
            filesSelectorSettings={filesSelectorSettings}
            newPath={newPath}
            basePath={basePath}
            isErrorPath={isErrorPath}
            setBasePath={setBasePath}
            toDefault={toDefault}
            setNewPath={setNewPath}
          />
        )
      )}
      {deleteThirdPartyDialogVisible ? (
        <DeleteThirdPartyDialog
          updateInfo={() => setThirdPartyAccountsInfo(t)}
          key="thirdparty-delete-dialog"
          isConnectionViaBackupModule
          visible={deleteThirdPartyDialogVisible}
          deleteThirdParty={deleteThirdParty}
          setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
          setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
          setThirdPartyProviders={setThirdPartyProviders}
          providers={providers}
          removeItem={removeItem}
        />
      ) : null}
    </StyledBackup>
  );
};

export default DirectThirdPartyConnection;

// export default inject(({ backup, dialogsStore, filesSettingsStore }) => {
//   const {
//     clearLocalStorage,
//     setSelectedThirdPartyAccount,
//     selectedThirdPartyAccount,
//     connectedThirdPartyAccount,
//     isTheSameThirdPartyAccount,

//     accounts,
//     setThirdPartyAccountsInfo,
//   } = backup;
//   const { openConnectWindow } = filesSettingsStore.thirdPartyStore;

//   const {
//     connectDialogVisible,
//     setConnectDialogVisible,
//     setDeleteThirdPartyDialogVisible,
//     deleteThirdPartyDialogVisible,
//   } = dialogsStore;

//   return {
//     isTheSameThirdPartyAccount,
//     clearLocalStorage,
//     openConnectWindow,
//     setConnectDialogVisible,
//     connectDialogVisible,
//     setDeleteThirdPartyDialogVisible,
//     deleteThirdPartyDialogVisible,
//     setSelectedThirdPartyAccount,
//     selectedThirdPartyAccount,
//     connectedThirdPartyAccount,

//     accounts,
//     setThirdPartyAccountsInfo,
//   };
// })(observer(DirectThirdPartyConnection));
