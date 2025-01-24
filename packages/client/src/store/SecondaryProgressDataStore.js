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

// import { OPERATIONS_NAME } from "@docspace/shared/constants";
// import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { makeAutoObservable } from "mobx";
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class SecondaryProgressDataStore {
  percent = 0;

  itemsSelectionLength = 0;

  itemsSelectionTitle = null;

  isDownload = false;

  secondaryOperationsArray = [
    // {
    //   label: "Duplicating",
    //   operation: "other",
    //   // alert: true,
    //   completed: false,
    //   items: [{ operationId: "operation_1", percent: 10, completed: true }],
    // },
    // {
    //   label: "Downloading",
    //   operation: OPERATIONS_NAME.upload,
    //   // alert: false,
    //   completed: false,
    //   items: [{ operationId: "operation_1", percent: 0, completed: true }],
    // },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  get secondaryActiveOperations() {
    return this.secondaryOperationsArray;
  }

  setSecondaryProgressBarData = (secondaryProgressData) => {
    const { operation, ...progressInfo } = secondaryProgressData;

    const operationIndex = this.secondaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.secondaryOperationsArray[operationIndex];
      const itemIndex = operationObject.items.findIndex(
        (item) => item.operationId === progressInfo.operationId,
      );

      let items = [...operationObject.items];

      if (itemIndex !== -1) {
        items[itemIndex] = progressInfo;
      } else {
        items = [...items, progressInfo];
      }

      const updatedItems = items;

      const isCompleted = updatedItems.every((item) => item.completed);

      this.secondaryOperationsArray[operationIndex] = {
        ...operationObject,
        alert: progressInfo.alert,
        items: updatedItems,
        completed: isCompleted,
      };
    } else {
      const progress = {
        operation,
        alert: progressInfo.alert,
        items: [progressInfo],
        label: getOperationsProgressTitle(operation),
        completed: progressInfo.completed,
      };

      this.secondaryOperationsArray = [
        ...this.secondaryOperationsArray,
        progress,
      ];
    }
  };

  setItemsSelectionTitle = (itemsSelectionTitle) => {
    this.itemsSelectionTitle = itemsSelectionTitle;
  };

  setItemsSelectionLength = (itemsSelectionLength) => {
    this.itemsSelectionLength = itemsSelectionLength;
  };

  clearSecondaryProgressData = (operationId, operation, allOperations) => {
    if (allOperations) {
      const incompleteOperations = this.secondaryOperationsArray.filter(
        (item) => !item.completed,
      );

      this.secondaryOperationsArray.splice(
        0,
        this.secondaryOperationsArray.length,
        ...incompleteOperations,
      );

      console.log("clearSecondaryProgressData", this.secondaryOperationsArray);
      return;
    }

    const operationIndex = this.secondaryOperationsArray.findIndex(
      (obj) => obj.operation === operation,
    );

    if (operationIndex === -1) return;

    const operationObject = this.secondaryOperationsArray[operationIndex];

    if (operationId) {
      const itemIndex = operationObject.items.findIndex(
        (item) => item.operationId === operationId,
      );
      if (itemIndex === -1) return;
      operationObject.items.splice(itemIndex, 1);
      if (operationObject.items.length === 0) {
        this.secondaryOperationsArray.splice(operationIndex, 1);
      }
    } else {
      this.secondaryOperationsArray.splice(operationIndex, 1);
    }
    console.log("clearSecondaryProgressData", this.secondaryOperationsArray);
  };

  get alert() {
    return this.secondaryOperationsArray.some((op) => op.alert);
  }

  get secondaryOperationsCompleted() {
    return (
      this.secondaryOperationsArray.length > 0 &&
      this.secondaryOperationsArray.every((op) => op.completed)
    );
  }
}

export default SecondaryProgressDataStore;
