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
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class SecondaryProgressDataStore {
  percent = 0;

  filesCount = 0;

  itemsSelectionLength = 0;

  itemsSelectionTitle = null;

  isDownload = false;

  secondaryOperationsArray = [
    // {
    //   label: "Duplicating",
    //   operation: "duplicate",
    //   alert: true,
    //   items: [{ operationId: "operation_1", percent: 10, completed: false }],
    // },
    // {
    //   label: "Downloading",
    //   operation: "download",
    //   alert: false,
    //   items: [{ operationId: "operation_1", percent: 0, completed: false }],
    // },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  get secondaryActiveOperations() {
    return this.secondaryOperationsArray;
  }

  setSecondaryProgressBarData = (secondaryProgressData) => {
    const { operation, alert, ...progressInfo } = secondaryProgressData;

    const operationIndex = this.secondaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.secondaryOperationsArray[operationIndex];
      const itemIndex = operationObject.items.findIndex(
        (item) => item.operationId === progressInfo.operationId,
      );

      operationObject.alert = alert;

      if (itemIndex !== -1) {
        operationObject.items[itemIndex] = progressInfo;
      } else {
        operationObject.items.push(progressInfo);
      }

      const allItemsCompleted = operationObject.items?.every(
        (item) => item.completed,
      );

      operationObject.completed = allItemsCompleted;
    } else {
      const progress = {
        operation,
        alert,
        items: [progressInfo],
        label: getOperationsProgressTitle(operation),
        completed: progressInfo.completed,
      };
      this.secondaryOperationsArray.push(progress);
    }

    console.log("this.secondaryOperationsArray", this.secondaryOperationsArray);
  };

  setItemsSelectionTitle = (itemsSelectionTitle) => {
    this.itemsSelectionTitle = itemsSelectionTitle;
  };

  setItemsSelectionLength = (itemsSelectionLength) => {
    this.itemsSelectionLength = itemsSelectionLength;
  };

  clearSecondaryProgressData = (operationId, operation) => {
    if (operation) {
      const operationIndex = this.secondaryOperationsArray.findIndex(
        (obj) => obj.operation === operation,
      );

      if (operationIndex !== -1) {
        const operationObject = this.secondaryOperationsArray[operationIndex];
        const allItemsCompleted = operationObject.items.every(
          (item) => item.completed
        );

        // Only remove operation if all items are completed
        if (allItemsCompleted) {
          this.secondaryOperationsArray.splice(operationIndex, 1);
        }
      }
    } else if (operationId) {
      const operationIndex = this.secondaryOperationsArray.findIndex((obj) =>
        obj.items.some((item) => item.operationId === operationId),
      );

      if (operationIndex === -1) return;

      const operationObject = this.secondaryOperationsArray[operationIndex];

      // If operationId is provided, remove specific item
      operationObject.items = operationObject.items.filter(
        (item) => item.operationId !== operationId,
      );

      if (operationObject.items.length === 0) {
        this.secondaryOperationsArray.splice(operationIndex, 1);
      }
    }
  };

  get alert() {
    return this.secondaryOperationsArray.some((op) => op.alert);
  }

  get secondaryOperationsCompleted() {
    return this.secondaryOperationsArray.some((op) => op.completed);
  }

  get isSecondaryProgressFinished() {
    return this.percent === 100;
  }
}

export default SecondaryProgressDataStore;
