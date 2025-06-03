// (c) Copyright Ascensio System SIA 2009-2025
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

import { makeAutoObservable } from "mobx";

import { hideInfoPanel } from "SRC_DIR/helpers/info-panel";

import SelectedFolderStore from "./SelectedFolderStore";

class IndexingStore {
  selectedFolderStore;

  isIndexEditingMode: boolean = false;

  isIndexing: boolean = false;

  updateSelection: any[] = [];

  previousFilesList: any[] = [];

  constructor(selectedFolderStore: SelectedFolderStore) {
    this.selectedFolderStore = selectedFolderStore;
    makeAutoObservable(this);
  }

  setUpdateSelection = (selection: any[]) => {
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
      // eslint-disable-next-line no-else-return
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

  setPreviousFilesList = (list: any[]) => {
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
    const items = this.updateSelection.reduce((res, item) => {
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
