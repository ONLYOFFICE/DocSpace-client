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

import isNil from "lodash/isNil";
import { makeAutoObservable } from "mobx";

import { getConnectingStorages } from "@docspace/shared/api/files";

import type {
  SettingsThirdPartyType,
  TConnectingStorage,
  TConnectingStorages,
  TThirdParty,
} from "@docspace/shared/api/files/types";
import type {
  ConnectingStoragesType,
  Nullable,
  ThirdPartyAccountType,
  TTranslation,
} from "@docspace/shared/types";
import { connectedCloudsTypeTitleTranslation } from "@docspace/shared/utils/connectedCloudsTypeTitleTranslation";
import { ProvidersType } from "@docspace/shared/enums";

import { getSettingsThirdParty } from "@/lib/actions";

class BackupStore {
  public connectedThirdPartyAccount: Nullable<SettingsThirdPartyType> = null;

  public providers: TThirdParty[] = [];

  public connectingStorages: ConnectingStoragesType[] = [];

  public selectedThirdPartyAccount: Nullable<Partial<ThirdPartyAccountType>> =
    null;

  public accounts: ThirdPartyAccountType[] = [];

  public backupProgressError = "";

  public isBackupProgressVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  public setBackupProgressError = (error: string) => {
    this.backupProgressError = error;
  };

  public setIsBackupProgressVisible = (visible: boolean) => {
    this.isBackupProgressVisible = visible;
  };

  public setThirdPartyProviders = (providers: TThirdParty[]) => {
    this.providers = providers;
  };

  public setConnectingStorages = (storages: ConnectingStoragesType[]) => {
    this.connectingStorages = storages;
  };

  public setSelectedThirdPartyAccount = (
    selectedThirdPartyAccount: Nullable<Partial<ThirdPartyAccountType>>,
  ) => {
    this.selectedThirdPartyAccount = selectedThirdPartyAccount;
  };

  public setConnectedThirdPartyAccount = (
    connectedThirdPartyAccount: Nullable<SettingsThirdPartyType>,
  ) => {
    this.connectedThirdPartyAccount = connectedThirdPartyAccount;
  };

  public setThirdPartyAccounts = (accounts: ThirdPartyAccountType[]) => {
    this.accounts = accounts;
  };

  public fetchConnectingStorages = async (): Promise<TConnectingStorages> => {
    const res = await getConnectingStorages();

    this.setConnectingStorages(
      res.map((storage) => ({
        id: storage.name,
        className: `storage_${storage.key}`,
        providerKey:
          storage.key !== ProvidersType.WebDav ? storage.key : storage.name,
        isConnected: storage.connected,
        isOauth: storage.oauth,
        oauthHref: storage.redirectUrl,
        category: storage.name,
        requiredConnectionUrl: storage.requiredConnectionUrl,
        clientId: storage.clientId,
      })),
    );

    return res;
  };

  getThirdPartyAccount = (
    provider: TConnectingStorage,
    t: TTranslation,
    isAdmin: boolean,
  ) => {
    const serviceTitle = connectedCloudsTypeTitleTranslation(provider.name, t);
    const serviceLabel = provider.connected
      ? serviceTitle
      : `${serviceTitle} (${t("Common:ActivationRequired")})`;

    const isConnected =
      provider.name === this.connectedThirdPartyAccount?.title;

    const isDisabled = !provider.connected && !isAdmin;

    const account: ThirdPartyAccountType = {
      key: provider.key,
      name: provider.name,
      label: serviceLabel,
      title: serviceLabel,
      provider_key:
        provider.key !== ProvidersType.WebDav ? provider.key : provider.name,
      ...(provider.clientId && {
        provider_link: provider.clientId,
      }),
      storageIsConnected: isConnected,
      connected: provider.connected,
      ...(isConnected && {
        provider_id: this.connectedThirdPartyAccount?.providerId,
        id: this.connectedThirdPartyAccount?.id,
      }),
      disabled: isDisabled,
    };

    return { account, isConnected };
  };

  public setThirdPartyAccountsInfo = async (
    t: TTranslation,
    isAdmin: boolean,
  ) => {
    const [connectedAccount, providers] = await Promise.all([
      getSettingsThirdParty(),
      this.fetchConnectingStorages(),
    ]);

    if (connectedAccount) this.setConnectedThirdPartyAccount(connectedAccount);

    let selectedAccount: ThirdPartyAccountType | undefined;

    const tempAccounts: ThirdPartyAccountType[] = providers
      .map((item) => {
        const { account, isConnected } = this.getThirdPartyAccount(
          item,
          t,
          isAdmin,
        );

        if (isConnected) {
          selectedAccount = { ...account };
        }

        return account;
      })
      .sort((storage) => (storage.connected ? -1 : 1));

    this.setThirdPartyAccounts(tempAccounts);

    const connectedThirdPartyAccount = tempAccounts.findLast(
      (a) => a.connected,
    );

    const newSelectedThirdPartyAccount =
      selectedAccount ?? connectedThirdPartyAccount ?? null;

    if (
      !isNil(this.selectedThirdPartyAccount?.provider_id) &&
      !isNil(newSelectedThirdPartyAccount?.provider_id) &&
      this.selectedThirdPartyAccount.provider_id ===
        newSelectedThirdPartyAccount.provider_id
    ) {
      return;
    }

    this.setSelectedThirdPartyAccount(newSelectedThirdPartyAccount);
  };
}

export default BackupStore;
