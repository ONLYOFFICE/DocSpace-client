// (c) Copyright Ascensio System SIA 2009-2026
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

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { loadDbConfig, loadRoomFormSettings } from "../_api/dbSettings";

export type DatabaseType = "MySQL";

export type SettingsLevel = "CategoryList" | "ConnectDatabase";

const DEFAULT_PORTS: Record<DatabaseType, string> = {
  MySQL: "3306",
};

class FormsDbSettingsStore {
  isPanelVisible = false;
  currentLevel: SettingsLevel = "CategoryList";

  collectXlsx = false;
  sendToDb = false;

  databaseType: DatabaseType = "MySQL";
  host = "";
  port = "3306";
  databaseName = "";
  user = "";
  password = "";
  useSsl = false;

  isSaving = false;
  isTesting = false;

  constructor() {
    makeAutoObservable(this);
  }

  openPanel = (roomId: string | number) => {
    this.isPanelVisible = true;
    this.currentLevel = "CategoryList";
    this.fetchConfig(roomId);
  };

  fetchConfig = async (roomId: string | number) => {
    try {
      const [props, roomSettings] = await Promise.all([
        loadDbConfig(),
        loadRoomFormSettings(roomId),
      ]);

      runInAction(() => {
        if (props) {
          this.loadFromConfig(props);
        }
        this.sendToDb = roomSettings.sendFormToExternalDB;
        this.collectXlsx = roomSettings.saveFormAsXLSX;
      });
    } catch {
      // ignore — use defaults
    }
  };

  setCollectXlsx = (value: boolean) => {
    this.collectXlsx = value;
  };

  setSendToDb = (value: boolean) => {
    this.sendToDb = value;
  };

  closePanel = () => {
    this.isPanelVisible = false;
    this.currentLevel = "CategoryList";
  };

  setCurrentLevel = (level: SettingsLevel) => {
    this.currentLevel = level;
  };

  setDatabaseType = (type: DatabaseType) => {
    this.databaseType = type;
    this.port = DEFAULT_PORTS[type];
  };

  setHost = (value: string) => {
    this.host = value;
  };

  setPort = (value: string) => {
    this.port = value;
  };

  setDatabaseName = (value: string) => {
    this.databaseName = value;
  };

  setUser = (value: string) => {
    this.user = value;
  };

  setPassword = (value: string) => {
    this.password = value;
  };

  setUseSsl = (value: boolean) => {
    this.useSsl = value;
  };

  setIsSaving = (value: boolean) => {
    this.isSaving = value;
  };

  setIsTesting = (value: boolean) => {
    this.isTesting = value;
  };

  get formData() {
    return {
      databaseType: this.databaseType,
      host: this.host,
      port: this.port,
      databaseName: this.databaseName,
      user: this.user,
      password: this.password,
      useSsl: this.useSsl,
    };
  }

  resetForm = () => {
    this.sendToDb = false;
    this.databaseType = "MySQL";
    this.host = "";
    this.port = "3306";
    this.databaseName = "";
    this.user = "";
    this.password = "";
    this.useSsl = false;
  };

  loadFromConfig = (props: { name: string; value: string }[]) => {
    for (const prop of props) {
      if (!prop.value) continue;

      switch (prop.name) {
        case "databaseType":
          this.databaseType = "MySQL";
          break;
        case "dbHost":
          this.host = prop.value;
          break;
        case "dbPort":
          this.port = prop.value;
          break;
        case "dbName":
          this.databaseName = prop.value;
          break;
        case "dbUser":
          this.user = prop.value;
          break;
        case "dbPassword":
          this.password = prop.value;
          break;
        case "dbSsl":
          this.useSsl = prop.value === "true";
          break;
        default:
          break;
      }
    }
  };
}

export const FormsDbSettingsStoreContext =
  React.createContext<FormsDbSettingsStore | null>(null);

export const FormsDbSettingsStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsDbSettingsStore(), []);
  return (
    <FormsDbSettingsStoreContext.Provider value={store}>
      {children}
    </FormsDbSettingsStoreContext.Provider>
  );
};

export const useFormsDbSettingsStore = () => {
  const store = React.useContext(FormsDbSettingsStoreContext);
  if (!store)
    throw new Error(
      "useFormsDbSettingsStore must be used within FormsDbSettingsStoreContextProvider",
    );
  return store;
};
