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

"use client";

import React from "react";
import { makeAutoObservable } from "mobx";

import { TViewAs } from "@docspace/shared/types";
import { setCookie } from "@docspace/shared/utils/cookie";
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
  new SettingsStore(),
);

export const SettingsStoreContextProvider = ({
  children,
  initData,
}: {
  children: React.ReactNode;
  initData: TSettingsStoreInitData;
}) => {
  return (
    <SettingsStoreContext.Provider value={new SettingsStore(initData)}>
      {children}
    </SettingsStoreContext.Provider>
  );
};

export const useSettingsStore = () => {
  return React.useContext(SettingsStoreContext);
};
