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

import type { TFolder } from "@docspace/shared/api/files/types";

class LibraryNavigationStore {
  /** Level 0 selection: the language/country folder */
  languageFolder: TFolder | null = null;
  /** Breadcrumb trail of subfolders after the language (arbitrary depth) */
  folderPath: TFolder[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  /** Select a language at Level 0 */
  openLanguageFolder = (folder: TFolder) => {
    this.languageFolder = folder;
    this.folderPath = [];
  };

  /** Navigate into a subfolder (any depth) */
  openSubFolder = (folder: TFolder) => {
    this.folderPath = [...this.folderPath, folder];
  };

  /** Go back one level */
  goBack = () => {
    if (this.folderPath.length > 0) {
      this.folderPath = this.folderPath.slice(0, -1);
    } else {
      this.languageFolder = null;
    }
  };

  /** Navigate to a specific breadcrumb level by folder id */
  goToFolder = (folderId: number | string) => {
    if (folderId === "library-root") {
      this.languageFolder = null;
      this.folderPath = [];
      return;
    }
    if (
      this.languageFolder &&
      folderId === this.languageFolder.id
    ) {
      this.folderPath = [];
      return;
    }
    const idx = this.folderPath.findIndex((f) => f.id === folderId);
    if (idx !== -1) {
      this.folderPath = this.folderPath.slice(0, idx + 1);
    }
  };

  /** Reset to language selection (Level 0) */
  reset = () => {
    this.languageFolder = null;
    this.folderPath = [];
  };

  /** 0 = language selection, 1+ = inside language folder tree */
  get depth(): number {
    if (!this.languageFolder) return 0;
    return 1 + this.folderPath.length;
  }

  /** Whether we're at the language selection screen (Level 0) */
  get isLanguageLevel(): boolean {
    return !this.languageFolder;
  }

  /** The currently open folder (deepest in the path) */
  get currentFolder(): TFolder | null {
    if (this.folderPath.length > 0) {
      return this.folderPath[this.folderPath.length - 1];
    }
    return this.languageFolder;
  }
}

export const LibraryNavigationStoreContext =
  React.createContext<LibraryNavigationStore>(
    null as unknown as LibraryNavigationStore,
  );

export const LibraryNavigationStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new LibraryNavigationStore(), []);
  return (
    <LibraryNavigationStoreContext.Provider value={store}>
      {children}
    </LibraryNavigationStoreContext.Provider>
  );
};

export const useLibraryNavigationStore = () => {
  return React.useContext(LibraryNavigationStoreContext);
};
