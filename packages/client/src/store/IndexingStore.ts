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

import { makeAutoObservable } from "mobx";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import SelectedFolderStore from "./SelectedFolderStore";

class IndexingStore {
  infoPanelStore;
  selectedFolderStore;

  isIndexEditingMode: boolean = false;

  isIndexing: boolean = false;

  updateSelection: any[] = [];

  constructor(
    infoPanelStore: InfoPanelStore,
    selectedFolderStore: SelectedFolderStore,
  ) {
    this.infoPanelStore = infoPanelStore;
    this.selectedFolderStore = selectedFolderStore;
    makeAutoObservable(this);
  }

  setUpdateSelection = (selection: any[]) => {
    this.updateSelection = selection;
  };

  setUpdateItems = (items: any) => {
    const newSelection = [...this.updateSelection];

    // eslint-disable-next-line no-restricted-syntax
    for (const item of items) {
      const exist = this.updateSelection.find(
        (selectionItem) =>
          selectionItem.id === item.id &&
          selectionItem.fileExst === item.fileExst,
      );

      // eslint-disable-next-line no-continue
      if (exist) continue;
      newSelection.push(item);
    }
    this.setUpdateSelection(newSelection);
  };

  setIsIndexEditingMode = (mode: boolean) => {
    if (!mode) {
      this.setUpdateSelection([]);
    }
    const { setIsVisible } = this.infoPanelStore;
    setIsVisible(false);
    this.isIndexEditingMode = mode;
  };
}

export default IndexingStore;
