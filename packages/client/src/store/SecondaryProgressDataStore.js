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

class SecondaryProgressDataStore {
  percent = 0;

  label = "";

  visible = false;

  icon = "trash";

  alert = false;

  filesCount = 0;

  itemsSelectionLength = 0;

  itemsSelectionTitle = null;

  isDownload = false;

  secondaryOperationsArray = [];

  constructor() {
    makeAutoObservable(this);
  }

  setSecondaryProgressBarData = (secondaryProgressData) => {
    const progressIndex = this.secondaryOperationsArray.findIndex(
      (p) => p.operationId === secondaryProgressData.operationId,
    );

    if (progressIndex !== -1) {
      this.secondaryOperationsArray[progressIndex] = secondaryProgressData;
    }

    if (progressIndex === 0 || this.secondaryOperationsArray.length === 0) {
      const progressDataItemsArray = Object.keys(secondaryProgressData);
      for (let index = 0; index < progressDataItemsArray.length; index++) {
        const key = progressDataItemsArray[index];
        if (key in this) {
          this[key] = secondaryProgressData[key];
        }
      }
    }

    if (progressIndex === -1) {
      this.secondaryOperationsArray.push(secondaryProgressData);
    }
  };

  setItemsSelectionTitle = (itemsSelectionTitle) => {
    this.itemsSelectionTitle = itemsSelectionTitle;
  };

  setItemsSelectionLength = (itemsSelectionLength) => {
    this.itemsSelectionLength = itemsSelectionLength;
  };

  clearSecondaryProgressData = (operationId) => {
    const progressIndex = this.secondaryOperationsArray.findIndex(
      (p) => p.operationId === operationId,
    );

    if (progressIndex !== -1) {
      this.secondaryOperationsArray = this.secondaryOperationsArray.filter(
        (p) => p.operationId !== operationId,
      );

      if (this.secondaryOperationsArray.length > 0) {
        const nextOperation = this.secondaryOperationsArray[0];

        this.percent = nextOperation.percent;
        this.label = nextOperation.label;
        this.visible = nextOperation.visible;
        this.icon = nextOperation.icon;
        this.alert = nextOperation.alert;
        this.filesCount = nextOperation.filesCount;
        this.isDownload = nextOperation.isDownload;
        return;
      }
    }

    if (this.secondaryOperationsArray.length <= 1) {
      this.percent = 0;
      this.label = "";
      this.visible = false;
      this.icon = "";
      this.alert = false;
      this.filesCount = 0;
      this.isDownload = false;
    }
  };

  get isSecondaryProgressFinished() {
    return this.percent === 100;
  }
}

export default SecondaryProgressDataStore;
