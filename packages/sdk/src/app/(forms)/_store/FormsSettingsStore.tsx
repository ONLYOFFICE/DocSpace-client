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

"use client";

import React from "react";
import { makeAutoObservable } from "mobx";

import { ShareAccessRights } from "@docspace/ui-kit/enums";

import type {
  TFilesSettings,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";

type TFormsConfig = {
  roomId: string | number;
  libraryId?: string | number;
  socketUrl?: string;
};

class FormsSettingsStore {
  roomId: string | number = "";
  libraryId: string | number = "";
  socketUrl: string = "";
  filesSettings: TFilesSettings | null = null;
  folderSecurity: TFolderSecurity | null = null;
  userAccess: ShareAccessRights | null = null;
  inProgressFolderId: number | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  setConfig = (config: TFormsConfig) => {
    this.roomId = config.roomId;
    this.libraryId = config.libraryId ?? "";
    this.socketUrl = config.socketUrl ?? "";
  };

  get hasLibrary(): boolean {
    return !!this.libraryId;
  }

  setFilesSettings = (settings: TFilesSettings) => {
    this.filesSettings = settings;
  };

  setFolderSecurity = (security: TFolderSecurity) => {
    this.folderSecurity = security;
  };

  setUserAccess = (access: ShareAccessRights) => {
    this.userAccess = access;
  };

  setInProgressFolderId = (id: number | undefined) => {
    this.inProgressFolderId = id;
  };

  get hasManagementAccess(): boolean {
    return [
      ShareAccessRights.None, // Owner — server returns 0 for room owner
      ShareAccessRights.FullAccess,
      ShareAccessRights.RoomManager,
      ShareAccessRights.Collaborator,
      ShareAccessRights.Editing,
    ].includes(this.userAccess as ShareAccessRights);
  }

  get isFormFiller(): boolean {
    return this.userAccess === ShareAccessRights.FormFilling;
  }
}

export const FormsSettingsStoreContext =
  React.createContext<FormsSettingsStore | null>(null);

export const FormsSettingsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsSettingsStore(), []);
  return (
    <FormsSettingsStoreContext.Provider value={store}>
      {children}
    </FormsSettingsStoreContext.Provider>
  );
};

export const useFormsSettingsStore = () => {
  const store = React.useContext(FormsSettingsStoreContext);
  if (!store)
    throw new Error(
      "useFormsSettingsStore must be used within FormsSettingsStoreContextProvider",
    );
  return store;
};
