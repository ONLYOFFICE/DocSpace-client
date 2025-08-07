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
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class PrimaryProgressDataStore {
  disableUploadPanelOpen = false;

  needErrorChecking = [];

  primaryOperationsArray = [];

  constructor() {
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
      if (progressInfo.percent > 0 && !progressInfo.completed) {
        progressInfo.label = getOperationsProgressTitle(
          operation,
          Math.trunc(progressInfo.percent),
        );
      }

      if (progressInfo.completed && progressInfo.percent > 0) {
        progressInfo.label = getOperationsProgressTitle(operation);
      }

      this.primaryOperationsArray[operationIndex] = {
        ...operationObject,
        ...progressInfo,
      };
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

      this.primaryOperationsArray.splice(
        0,
        this.primaryOperationsArray.length,
        ...incompleteOperations,
      );

      console.log("clearPrimaryProgressData", this.primaryOperationsArray);
      return;
    }

    const operationIndex = this.primaryOperationsArray.findIndex(
      (obj) => obj.operation === operation,
    );

    if (operationIndex === -1) return;

    this.primaryOperationsArray.splice(operationIndex, 1);

    console.log("clearPrimaryProgressData", this.primaryOperationsArray);

  clearDropPreviewLocation = () => {
    console.log("clearDropPreviewLocation");
    this.setStartDropPreview(false);
    this.dropTargetPreview = null;
  };

  get primaryOperationsCompleted() {
    return (
      this.primaryOperationsArray.length > 0 &&
      this.primaryOperationsArray.every((op) => op.completed)
    );
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
    if (!title && !this.startDropPreview) return;
    this.setStartDropPreview(true);
    // console.log("setDropTargetPreview", title);
    this.dropTargetPreview = title;
  };
}

export default PrimaryProgressDataStore;
