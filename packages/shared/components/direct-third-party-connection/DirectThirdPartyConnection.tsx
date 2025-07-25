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

"use client";

import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/16/vertical-dots.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import AccessNoneReactSvgUrl from "PUBLIC_DIR/images/access.none.react.svg?url";
import ExternalLinkReactSvgUrl from "PUBLIC_DIR/images/external.link.react.svg?url";

import { Text } from "../text";
import { toastr } from "../toast";
import { Button } from "../button";
import { getOAuthToken } from "../../utils/common";
import { ComboBox } from "../combobox";
import { saveSettingsThirdParty } from "../../api/files";
import { THIRD_PARTY_SERVICES_URL } from "../../constants";
import { DropDownItem } from "../drop-down-item";
import { ContextMenuButton } from "../context-menu-button";
import { DeleteThirdPartyDialog } from "../../dialogs/delete-third-party";
import { FilesSelectorInput } from "../files-selector-input";
import { isNullOrUndefined } from "../../utils/typeGuards";
import { IconButton } from "../icon-button";
import { useDidMount } from "../../hooks/useDidMount";
import { useUnmount } from "../../hooks/useUnmount";
import type { ConnectedThirdPartyAccountType } from "../../types";

import { initialState } from "./DirectThirdPartyConnection.constants";
import { DirectThirdPartyConnectionProps } from "./DirectThirdPartyConnection.types";
import styles from "./DirectThirdPartyConnection.module.scss";

const DirectThirdPartyConnection = ({
  className,
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
  checkCreating = false,
}: DirectThirdPartyConnectionProps) => {
  const [state, setState] = useReducer(
    (prevState, newState) => ({ ...prevState, ...newState }),
    initialState,
  );

  const { t } = useTranslation(["Common"]);

  const onSetSettings = async () => {
    try {
      setState({
        isLoading: true,
      });

      await setThirdPartyAccountsInfo(t);
    } catch (e) {
      if (!e) return;
      toastr.error(e);
    } finally {
      setState({
        isLoading: false,
        isUpdatingInfo: false,
        isInitialLoading: false,
      });
    }
  };

  useDidMount(() => {
    onSetSettings();
  });

  useUnmount(() => {
    setSelectedThirdPartyAccount(null);
  });

  const saveSettings = async (
    token = "",
    urlValue = "",
    loginValue = "",
    passwordValue = "",
  ) => {
    if (isNullOrUndefined(selectedThirdPartyAccount)) return;

    const { label, key, provider_id } = selectedThirdPartyAccount;

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
        key,
        provider_id ?? "",
      );

      await setThirdPartyAccountsInfo(t);
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setState({ isLoading: false, isUpdatingInfo: false });
    }
  };

  const onConnect = () => {
    clearLocalStorage();
    onSelectFolder?.("");

    if (isNullOrUndefined(selectedThirdPartyAccount)) return;

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

  const onSelectAccount = (name: string) => {
    const account = accounts.find((acc) => acc.name === name);

    if (!account?.connected) {
      setSelectedThirdPartyAccount({
        key: "0",
        label: selectedThirdPartyAccount?.label,
      });

      return window.open(`${THIRD_PARTY_SERVICES_URL}${name}`, "_blank");
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

  const folderList: Partial<ConnectedThirdPartyAccountType> =
    connectedThirdPartyAccount ?? {};

  const advancedOptions = (
    <div style={{ display: "contents" }}>
      {accounts?.map((item) => {
        return (
          <div
            key={`${item.key}_${item.name}`}
            className={classNames(styles.comboboxItem, {
              [styles.isDisabled]: item.disabled,
            })}
          >
            <DropDownItem
              onClick={() => onSelectAccount(item.name)}
              className={item.className}
              data-third-party-key={item.key}
              disabled={item.disabled}
            >
              <Text
                className={classNames(
                  styles.dropDownItemText,
                  "drop-down-item_text",
                )}
                fontWeight={600}
              >
                {item.title}
              </Text>

              {!item.disabled && !item.connected ? (
                <IconButton
                  className={classNames(
                    styles.dropDownItemIcon,
                    "drop-down-item_icon",
                  )}
                  size={16}
                  onClick={() => onSelectAccount(item.name)}
                  iconName={ExternalLinkReactSvgUrl}
                  isFill
                />
              ) : null}
            </DropDownItem>
          </div>
        );
      })}
    </div>
  );

  const isConnectedAccount =
    Boolean(connectedThirdPartyAccount) && isTheSameThirdPartyAccount;

  return (
    <div
      className={classNames(styles.directThirdPartyConnection, className, {
        [styles.isConnectedAccount]: isConnectedAccount,
        [styles.isMobileScale]: isMobileScale,
      })}
    >
      <div className={classNames(styles.backupConnection, "backup_connection")}>
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
          className="thirdparty-combobox"
          advancedOptions={advancedOptions}
          isDisabled={isLoading}
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
            className={classNames(
              styles.backupThirdPartyContext,
              "backup_third-party-context",
            )}
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
          testId="connect-button"
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
            checkCreating={checkCreating}
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
    </div>
  );
};

export default DirectThirdPartyConnection;
