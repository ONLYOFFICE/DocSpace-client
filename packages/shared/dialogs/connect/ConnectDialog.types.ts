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
import type { TFolder, TThirdParty } from "../../api/files/types";
import type {
  ConnectingStoragesType,
  Nullable,
  ThirdPartyAccountType,
  TTranslation,
} from "../../types";

export type ConnectionItemType = {
  link: string;
  title: string;
  token: string;
  key: string;
  provider_id: string;
  provider_key: string;
};

export interface ConnectDialogProps {
  visible: boolean;
  item: Nullable<
    | (ThirdPartyAccountType &
        Partial<Pick<ConnectionItemType, "token" | "link">>)
    | ConnectionItemType
  >;
  providers: TThirdParty[];
  selectedFolderId: Nullable<string | number>;
  selectedFolderFolders: Nullable<TFolder[]>;
  folderFormValidation: RegExp;
  isConnectionViaBackupModule: boolean;
  roomCreation: boolean;
  isConnectDialogReconnect: boolean;
  saveAfterReconnectOAuth: boolean;
  connectingStorages: ConnectingStoragesType[];
  fetchThirdPartyProviders: () => Promise<void>;
  saveThirdParty: (
    url: string,
    login: string,
    password: string,
    token: string,
    isCorporate: boolean,
    customerTitle: string,
    providerKey: string,
    providerId: string,
    isRoomsStorage: boolean,
  ) => Promise<void>;
  openConnectWindow: (
    serviceName: string,
    modal: Nullable<Window>,
  ) => Promise<Nullable<Window>>;
  setConnectDialogVisible: (visible: boolean) => void;
  setSaveThirdpartyResponse?: (response: unknown) => void;
  setSaveAfterReconnectOAuth: (saveAfterReconnectOAuth: boolean) => void;
  setIsConnectDialogReconnect: (isConnectDialogReconnect: boolean) => void;
  setThirdPartyAccountsInfo: (t: TTranslation) => Promise<void>;
}
