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

import { makeAutoObservable } from "mobx";

import { hideInfoPanel } from "SRC_DIR/helpers/info-panel";

import SelectedFolderStore from "./SelectedFolderStore";

type IndexingItem = {
  id: string | number;
  order?: number;
  isFolder?: boolean;
  fileExst?: string;
};

class IndexingStore {
  selectedFolderStore;

  isIndexEditingMode: boolean = false;

  isIndexing: boolean = false;

  updateSelection: IndexingItem[] = [];

  previousFilesList: IndexingItem[] = [];

  constructor(selectedFolderStore: SelectedFolderStore) {
    this.selectedFolderStore = selectedFolderStore;
    makeAutoObservable(this);
  }

  setUpdateSelection = (selection: IndexingItem[]) => {
    if (this.updateSelection.length === 0) {
      return (this.updateSelection = [...selection]);
    }

    const elementIndexReturned = this.previousFilesList.filter(
      (item) =>
        item.order === selection[0].order && item.id === selection[0].id,
    );

    if (elementIndexReturned.length > 0) {
      const filtered = this.updateSelection.filter((item) => {
        return elementIndexReturned[0].isFolder === item.isFolder
          ? item.id !== elementIndexReturned[0].id
          : item.id !== elementIndexReturned[0].id &&
              item.fileExst !== elementIndexReturned[0].fileExst;
      });

      return (this.updateSelection = [...filtered]);
    }

    const existItem = this.updateSelection.filter((item) => {
      return (
        item.id === selection[0].id && item.fileExst === selection[0].fileExst
      );
    });

    if (existItem.length > 0) {
      if (existItem[0].order === selection[0].order) return;
      else if (
        existItem[0].order &&
        existItem[0].order !== selection[0].order
      ) {
        const filtered = this.updateSelection.filter((item) => {
          return existItem[0].isFolder === item.isFolder
            ? item.id !== existItem[0].id
            : item.id !== existItem[0].id &&
                item.fileExst !== existItem[0].fileExst;
        });

        return (this.updateSelection = [...filtered, ...selection]);
      }
    }

    return (this.updateSelection = [...this.updateSelection, ...selection]);
  };

  clearUpdateSelection = () => {
    this.updateSelection = [];
  };

  setPreviousFilesList = (list: IndexingItem[]) => {
    this.previousFilesList = list;
  };

  setIsIndexEditingMode = (mode: boolean) => {
    if (!mode) {
      this.clearUpdateSelection();
      this.setPreviousFilesList([]);
    }

    if (mode) {
      hideInfoPanel();
    }

    this.isIndexEditingMode = mode;
  };

  getIndexingArray = () => {
    const items = this.updateSelection.reduce<
      Array<{
        order: number | undefined;
        entryId: string | number;
        entryType: number;
      }>
    >((res, item) => {
      return [
        ...res,
        {
          order: item.order,
          entryId: item.id,
          entryType: item.isFolder ? 1 : 2,
        },
      ];
    }, []);

    return items;
  };
}

export default IndexingStore;
