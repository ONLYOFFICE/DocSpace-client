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
import { makeAutoObservable, toJS } from "mobx";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { LinkParamsType } from "@docspace/shared/types";

class InfoPanelStore {
  isVisible: boolean = false;
  selection: TFile | TFolder | null = null;
  shareChanged: boolean = false;

  editLinkPanelIsVisible: boolean = false;
  linkParams: LinkParamsType | null = null;
  embeddingPanelData: { visible: boolean; item?: TFile | TFolder } | null =
    null;

  constructor() {
    makeAutoObservable(this);
  }

  open = (item: TFile | TFolder) => {
    this.selection = toJS(item);
    this.isVisible = true;
  };

  close = () => {
    this.isVisible = false;
    this.selection = null;
    this.shareChanged = false;
  };

  toggle = () => {
    this.isVisible = !this.isVisible;
  };

  setShareChanged = (changed: boolean) => {
    this.shareChanged = changed;
  };

  setEditLinkPanelIsVisible = (visible: boolean) => {
    this.editLinkPanelIsVisible = visible;
  };

  setLinkParams = (params: LinkParamsType | null) => {
    this.linkParams = params;
  };

  setEmbeddingPanelData = (data: {
    visible: boolean;
    item?: TFile | TFolder;
  }) => {
    this.embeddingPanelData = data;
  };
}

export const InfoPanelStoreContext = React.createContext<InfoPanelStore>(
  null as unknown as InfoPanelStore,
);

export const InfoPanelStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new InfoPanelStore(), []);
  return (
    <InfoPanelStoreContext.Provider value={store}>
      {children}
    </InfoPanelStoreContext.Provider>
  );
};

export const useInfoPanelStore = () => {
  const store = React.useContext(InfoPanelStoreContext);
  if (!store) {
    throw new Error(
      "useInfoPanelStore must be used within an InfoPanelStoreContextProvider",
    );
  }
  return store;
};
