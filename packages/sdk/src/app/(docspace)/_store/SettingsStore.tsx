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

import { TViewAs } from "@docspace/shared/types";
import { setCookie } from "@docspace/ui-kit/utils/cookie";
import { DeviceType } from "@docspace/shared/enums";
import { getDeviceTypeByWidth } from "@docspace/shared/utils";

type TSettingsStoreInitData = {
  viewAs: TViewAs;
};

class SettingsStore {
  filesViewAs: TViewAs | null = null;

  isEmptyList: boolean = false;

  itemsCount: number = 0;

  shareKey: string = "";

  // NOTE: `currentDeviceType` is correctly set only on the client (depends on `window.innerWidth`).
  // Use CSS media queries for SSR components.
  currentDeviceType: DeviceType = DeviceType.desktop;

  displayAbout: boolean = true;

  constructor(initData?: TSettingsStoreInitData) {
    if (initData?.viewAs) {
      this.filesViewAs = initData.viewAs;
    }

    if (typeof window !== "undefined") {
      this.setCurrentDeviceType(getDeviceTypeByWidth(window.innerWidth));
    }

    makeAutoObservable(this);
  }

  setFilesViewAs = (viewAs: TViewAs) => {
    setCookie("viewAs", viewAs);

    this.filesViewAs = viewAs;
  };

  setIsEmptyList = (isEmptyList: boolean) => {
    this.isEmptyList = isEmptyList;
  };

  setShareKey = (shareKey: string) => {
    this.shareKey = shareKey;
  };

  setItemsCount = (itemsCount: number) => {
    this.itemsCount = itemsCount;
  };

  setCurrentDeviceType = (value: DeviceType) => {
    this.currentDeviceType = value;
  };

  setDisplayAbout = (value: boolean) => {
    this.displayAbout = value;
  };
}

export const SettingsStoreContext = React.createContext<SettingsStore>(
  null as unknown as SettingsStore,
);

export const SettingsStoreContextProvider = ({
  children,
  initData,
}: {
  children: React.ReactNode;
  initData: TSettingsStoreInitData;
}) => {
  const store = React.useMemo(() => new SettingsStore(initData), [initData]);
  return <SettingsStoreContext value={store}>{children}</SettingsStoreContext>;
};

export const useSettingsStore = () => {
  return React.useContext(SettingsStoreContext);
};
