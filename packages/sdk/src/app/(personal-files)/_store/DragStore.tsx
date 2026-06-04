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

class DragStore {
  dragging: boolean = false;
  startDrag: boolean = false;
  tooltipPageX: number = 0;
  tooltipPageY: number = 0;

  osDragging: boolean = false;
  // The current (root) folder — the default upload destination shown while
  // dragging over empty space. Set once when an OS drag enters the drop zone.
  osCurrentFolderTitle: string | null = null;
  // The droppable sub-folder currently under the cursor, if any. Takes
  // precedence over the current-folder default for the "Drop to" label.
  osHoveredFolderTitle: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Destination shown in the floating "Drop to" tooltip: the hovered folder
  // when over one, otherwise the current folder.
  get osDropTargetFolderName(): string | null {
    return this.osHoveredFolderTitle ?? this.osCurrentFolderTitle;
  }

  setDragging = (v: boolean) => {
    this.dragging = v;
  };

  setStartDrag = (v: boolean) => {
    this.startDrag = v;
  };

  setTooltipPosition = (x: number, y: number) => {
    this.tooltipPageX = x;
    this.tooltipPageY = y;
  };

  setOsDragging = (v: boolean) => {
    this.osDragging = v;
    if (!v) {
      this.osCurrentFolderTitle = null;
      this.osHoveredFolderTitle = null;
    }
  };

  setOsCurrentFolderTitle = (name: string | null) => {
    this.osCurrentFolderTitle = name;
  };

  setOsHoveredFolderTitle = (name: string | null) => {
    this.osHoveredFolderTitle = name;
  };
}

export const DragStoreContext = React.createContext<DragStore>(
  null as unknown as DragStore,
);

export const DragStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new DragStore(), []);
  return (
    <DragStoreContext.Provider value={store}>
      {children}
    </DragStoreContext.Provider>
  );
};

export const useDragStore = () => {
  const store = React.useContext(DragStoreContext);
  if (!store) {
    throw new Error(
      "useDragStore must be used within a DragStoreContextProvider",
    );
  }
  return store;
};
