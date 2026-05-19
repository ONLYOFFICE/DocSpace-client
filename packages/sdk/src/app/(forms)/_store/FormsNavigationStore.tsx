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

export type EditorAction = "view" | "edit" | "fill";

class FormsNavigationStore {
  editingFile: TFile | null = null;
  editorAction: EditorAction = "fill";
  completedFolder: TFolder | null = null;
  inProgressFolder: TFolder | null = null;
  isSidebarOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  openCompletedFolder = (folder: TFolder) => {
    this.completedFolder = folder;
  };

  goBackToCompletedRoot = () => {
    this.completedFolder = null;
  };

  openInProgressFolder = (folder: TFolder) => {
    this.inProgressFolder = folder;
  };

  goBackToInProgressRoot = () => {
    this.inProgressFolder = null;
  };

  openEditor = (file: TFile, action: EditorAction = "fill") => {
    this.editingFile = file;
    this.editorAction = action;
  };

  closeEditor = () => {
    this.editingFile = null;
    this.editorAction = "fill";
  };

  openSidebar = () => {
    this.isSidebarOpen = true;
  };

  closeSidebar = () => {
    this.isSidebarOpen = false;
  };

  toggleSidebar = () => {
    this.isSidebarOpen = !this.isSidebarOpen;
  };
}

export const FormsNavigationStoreContext =
  React.createContext<FormsNavigationStore | null>(null);

export const FormsNavigationStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new FormsNavigationStore(), []);
  return (
    <FormsNavigationStoreContext.Provider value={store}>
      {children}
    </FormsNavigationStoreContext.Provider>
  );
};

export const useFormsNavigationStore = () => {
  const store = React.useContext(FormsNavigationStoreContext);
  if (!store)
    throw new Error(
      "useFormsNavigationStore must be used within FormsNavigationStoreContextProvider",
    );
  return store;
};
