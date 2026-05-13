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
import { makeAutoObservable } from "mobx";

import type { TFile, TFolder } from "@docspace/shared/api/files/types";

export type EditorAction = "view" | "edit" | "fill";

class FormsNavigationStore {
  editingFile: TFile | null = null;
  editorAction: EditorAction = "fill";
  completedFolder: TFolder | null = null;
  inProgressFolder: TFolder | null = null;

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
