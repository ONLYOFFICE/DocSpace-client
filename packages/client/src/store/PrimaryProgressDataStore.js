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

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { makeAutoObservable } from "mobx";
import { getOperationsProgressTitle } from "SRC_DIR/helpers/filesUtils";

class PrimaryProgressDataStore {
  disableUploadPanelOpen = false;

  needErrorChecking = false;

  primaryOperationsArray = [];

  constructor() {
    makeAutoObservable(this);
  }

  get isPrimaryProgressVisbile() {
    return this.primaryOperationsArray.length > 0;
  }

  setPrimaryProgressBarData = (primaryProgressData) => {
    const {
      operation,
      disableUploadPanelOpen,
      isSingleConversion,
      ...progressInfo
    } = primaryProgressData;

    if (typeof disableUploadPanelOpen !== "undefined")
      this.disableUploadPanelOpen = disableUploadPanelOpen;

    const operationIndex = this.primaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.primaryOperationsArray[operationIndex];

      if (progressInfo.alert && !disableUploadPanelOpen) {
        this.setNeedErrorChecking(true);
      }

      this.primaryOperationsArray[operationIndex] = {
        ...operationObject,
        ...progressInfo,
        disableOpenPanel: disableUploadPanelOpen,
        ...(operationObject.isSingleConversion !== isSingleConversion && {
          label: isSingleConversion
            ? getOperationsProgressTitle(OPERATIONS_NAME.convert)
            : getOperationsProgressTitle(operation),
        }),
        isSingleConversion,
      };
    } else {
      const progress = {
        operation,
        alert: progressInfo.alert,
        items: [progressInfo],
        label: isSingleConversion
          ? getOperationsProgressTitle(OPERATIONS_NAME.convert)
          : getOperationsProgressTitle(operation),
        completed: progressInfo.completed,
        disableOpenPanel: disableUploadPanelOpen,
        isSingleConversion,
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

  setNeedErrorChecking = (needErrorChecking) => {
    this.needErrorChecking = needErrorChecking;
  };
}

export default PrimaryProgressDataStore;
