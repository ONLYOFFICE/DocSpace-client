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
