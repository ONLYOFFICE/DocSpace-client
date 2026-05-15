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
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class PrimaryProgressDataStore {
  disableUploadPanelOpen = false;

  needErrorChecking = [];

  primaryOperationsArray = [];

  dropTargetPreview = null;

  startDropPreview = true;

  constructor(filesStore, selectedFolderStore) {
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;

    makeAutoObservable(this);
  }

  get isErrorChecking() {
    return this.needErrorChecking.length > 0;
  }

  get isPrimaryProgressVisbile() {
    return this.primaryOperationsArray.length > 0;
  }

  setPrimaryProgressBarData = (primaryProgressData) => {
    const { operation, ...progressInfo } = primaryProgressData;

    const operationIndex = this.primaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.primaryOperationsArray[operationIndex];

      if (progressInfo.alert) {
        this.setNeedErrorChecking(true, operation);
      }
      if (!operationObject.canceled) {
        if (progressInfo.percent > 0 && !progressInfo.completed) {
          progressInfo.label = getOperationsProgressTitle(
            operation,
            Math.trunc(progressInfo.percent),
          );
        }

        if (progressInfo.completed && progressInfo.percent > 0) {
          progressInfo.label = getOperationsProgressTitle(operation);
        }
      }

      const updatedOperation = {
        ...operationObject,
        ...progressInfo,
      };

      const newPrimaryOperationsArray = this.primaryOperationsArray.slice();
      newPrimaryOperationsArray[operationIndex] = updatedOperation;
      this.primaryOperationsArray = newPrimaryOperationsArray;
    } else {
      const progress = {
        operation,
        items: [progressInfo],
        label: getOperationsProgressTitle(operation),
        ...progressInfo,
      };

      this.primaryOperationsArray = [...this.primaryOperationsArray, progress];
    }
  };

  clearPrimaryProgressData = (operation) => {
    this.setNeedErrorChecking(false);

    if (!operation) {
      const incompleteOperations = this.primaryOperationsArray.filter(
        (item) => !item.completed,
      );

      this.primaryOperationsArray = [...incompleteOperations];

      // console.log("clearPrimaryProgressData", this.primaryOperationsArray);
      return;
    }

    const operationIndex = this.primaryOperationsArray.findIndex(
      (obj) => obj.operation === operation,
    );

    if (operationIndex === -1) return;

    const newPrimaryOperationsArray = this.primaryOperationsArray.filter(
      (_, index) => index !== operationIndex,
    );

    this.primaryOperationsArray = [...newPrimaryOperationsArray];

    console.log("clearPrimaryProgressData", this.primaryOperationsArray);
  };

  clearDropPreviewLocation = () => {
    // console.log("clearDropPreviewLocation");

    this.setStartDropPreview(false);
    this.dropTargetPreview = null;
  };

  get primaryOperationsCompleted() {
    return (
      this.primaryOperationsArray.length > 0 &&
      this.primaryOperationsArray.every((op) => op.completed)
    );
  }

  get primaryOperationsCanceled() {
    return this.primaryOperationsArray.some((op) => op.canceled);
  }

  get primaryOperationsAlert() {
    return this.primaryOperationsArray.some((op) => op.alert);
  }

  setNeedErrorChecking = (needErrorChecking, operation) => {
    if (operation) {
      const existingErrorIndex = this.needErrorChecking.findIndex(
        (err) => err === operation,
      );

      if (needErrorChecking && existingErrorIndex === -1) {
        this.needErrorChecking.push(operation);
      }

      if (!needErrorChecking && existingErrorIndex !== -1) {
        this.needErrorChecking.splice(existingErrorIndex, 1);
      }
    } else {
      this.needErrorChecking = [];
    }
  };

  setStartDropPreview = (visible) => {
    if (this.startDropPreview === visible) return;

    this.startDropPreview = visible;
  };

  setDropTargetPreview = (title) => {
    if (this.filesStore.startDrag && title === this.selectedFolderStore.title) {
      this.dropTargetPreview = null;
      return;
    }

    if (!title && !this.startDropPreview) return;

    if (this.dropTargetPreview === title) return;

    this.setStartDropPreview(true);

    this.dropTargetPreview = title;
  };
}

export default PrimaryProgressDataStore;
