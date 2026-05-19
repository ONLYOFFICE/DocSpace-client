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

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

import type { FormsSection } from "@/types/forms";

class FormsListStore {
  items: TFile[] = [];
  folders: TFolder[] = [];
  total: number = 0;
  isLoading: boolean = true;

  section: FormsSection | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setItems = (items: TFile[], total: number) => {
    this.items = items;
    this.total = total;
  };

  setFolders = (folders: TFolder[]) => {
    this.folders = folders;
  };

  appendItems = (items: TFile[], total: number) => {
    this.items = [...this.items, ...items];
    this.total = total;
  };

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  setSection = (section: FormsSection | null) => {
    this.section = section;
  };

  reset = () => {
    this.items = [];
    this.folders = [];
    this.total = 0;
    this.isLoading = false;
    this.section = null;
  };

  get hasMore(): boolean {
    return this.items.length < this.total;
  }
}

export const FormsListStoreContext =
  React.createContext<FormsListStore | null>(null);

export const FormsListStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsListStore(), []);
  return (
    <FormsListStoreContext.Provider value={store}>
      {children}
    </FormsListStoreContext.Provider>
  );
};

export const useFormsListStore = () => {
  const store = React.useContext(FormsListStoreContext);
  if (!store)
    throw new Error(
      "useFormsListStore must be used within FormsListStoreContextProvider",
    );
  return store;
};
