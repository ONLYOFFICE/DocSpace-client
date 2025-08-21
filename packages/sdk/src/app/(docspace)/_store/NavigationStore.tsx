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

import { TNavigationItem } from "@docspace/shared/components/navigation";
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
