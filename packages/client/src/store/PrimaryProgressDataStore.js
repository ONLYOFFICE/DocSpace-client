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

import i18n from "../i18n";

class PrimaryProgressDataStore {
  percent = 0;

  visible = false;

  icon = "upload";

  alert = false;

  loadingFile = null;

  errors = 0;

  disableUploadPanelOpen = false;

  // uploadingError = 0;

  // uploadingAlert = false;

  // uploadingVisible = true;

  // uploadingPercent = 0;

  // convertingError = 0;

  // convertingAlert = false;

  // convertingVisible = true;

  // convertingPercent = 0;

  uploadingOperation = {
    error: 0,
    alert: false,
    visible: false,
    percent: 0,
    operation: OPERATIONS_NAME.upload,
    label: getOperationsProgressTitle(OPERATIONS_NAME.upload, i18n.t),
  };

  convertingOperation = {
    error: 0,
    alert: false,
    visible: false,
    percent: 0,
  };

  primaryOperationsArray = [
    {
      label: "Uploading",
      operation: "convert",
      // alert: true,
      completed: false,
    },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  setPrimaryProgressBarData = (primaryProgressData) => {
    const { operation, ...progressInfo } = primaryProgressData;

    const operationIndex = this.primaryOperationsArray.findIndex(
      (object) => object.operation === operation,
    );

    if (operationIndex !== -1) {
      const operationObject = this.primaryOperationsArray[operationIndex];

      this.primaryOperationsArray[operationIndex] = {
        ...operationObject,
        ...progressInfo,
      };
    } else {
      const progress = {
        operation,
        alert: progressInfo.alert,
        items: [progressInfo],
        label: getOperationsProgressTitle(operation),
        completed: progressInfo.completed,
      };

      this.primaryOperationsArray = [...this.primaryOperationsArray, progress];
    }
  };

  clearPrimaryProgressData = (operation, allOperations) => {
    if (allOperations) {
      const incompleteOperations = this.primaryOperationsArray.filter(
        (item) => !item.completed,
      );

      this.primaryOperationsArray.splice(
        0,
        this.primaryOperationsArray.length,
        ...incompleteOperations,
      );

      console.log("clearSecondaryProgressData", this.primaryOperationsArray);
      return;
    }

    const operationIndex = this.primaryOperationsArray.findIndex(
      (obj) => obj.operation === operation,
    );

    if (operationIndex === -1) return;

    this.primaryOperationsArray.splice(operationIndex, 1);

    console.log("clearSecondaryProgressData", this.primaryOperationsArray);
  };

  get primaryOperationsCompleted() {
    return (
      this.primaryOperationsArray.length > 0 &&
      this.primaryOperationsArray.every((op) => op.completed)
    );
  }

  setPrimaryProgressBarShowError = (error) => {
    this.alert = error;
  };

  setPrimaryProgressBarErrors = (errors) => {
    this.errors = errors;
  };
}

export default PrimaryProgressDataStore;
