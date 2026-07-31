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

import { TNavigationItem } from "@docspace/ui-kit/components/navigation";
import { Nullable } from "@docspace/shared/types";

class NavigationStore {
  navigationItems: Nullable<TNavigationItem[]> = null;

  currentFolderId: Nullable<number | string> = null;

  currentTitle: Nullable<string> = null;

  currentIsRootRoom: Nullable<boolean> = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentFolderId = (folderId: number | string) => {
    this.currentFolderId = folderId;
  };

  setCurrentTitle = (title: string) => {
    this.currentTitle = title;
  };

  setCurrentIsRootRoom = (isRootRoom: boolean) => {
    this.currentIsRootRoom = isRootRoom;
  };

  setNavigationItems = (navigationItems: TNavigationItem[]) => {
    this.navigationItems = navigationItems;
  };

  updateNavigationItems = (itemId?: string | number) => {
    if (
      itemId &&
      this.navigationItems &&
      this.navigationItems.find((i) => i.id === itemId)
    ) {
      this.removeNavigationItem(itemId);
    } else {
      this.addNavigationItem();
    }
  };

  addNavigationItem = () => {
    if (!this.navigationItems) this.navigationItems = [];

    this.navigationItems.unshift({
      title: this.currentTitle!,
      id: this.currentFolderId!,
      isRootRoom: this.currentIsRootRoom!,
    });
  };

  removeNavigationItem = (id: string | number) => {
    if (!this.navigationItems) {
      return;
    }

    const idx = this.navigationItems.findIndex((item) => item.id === id);
    if (idx === -1) {
      return;
    }

    this.setCurrentFolderId(this.navigationItems[idx].id);
    this.setCurrentTitle(this.navigationItems[idx].title);
    this.setCurrentIsRootRoom(this.navigationItems[idx].isRootRoom);

    const newItems = [...this.navigationItems]
      .map((item, index) => {
        if (index > idx) {
          return item;
        }
        return null;
      })
      .filter((item) => item !== null);

    this.setNavigationItems(newItems);
  };
}

export const NavigationStoreContext = React.createContext<NavigationStore>(
  new NavigationStore(),
);

export const NavigationStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new NavigationStore(), []);

  return (
    <NavigationStoreContext.Provider value={store}>
      {children}
    </NavigationStoreContext.Provider>
  );
};

export const useNavigationStore = () => {
  return React.useContext(NavigationStoreContext);
};
